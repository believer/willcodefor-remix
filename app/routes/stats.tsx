import type { TooltipProps } from 'recharts'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import type { LoaderFunction } from 'remix'
import { json, useLoaderData } from 'remix'
import PostList from '~/components/PostList'
import { prisma } from '~/db.server'
import type { LatestTilPosts } from '~/models/post.server'
import { SortOrder } from '~/routes/posts/index'
import parser from 'ua-parser-js'
import React from 'react'
import clsx from 'clsx'

type Day = {
  date: string
  day: string
  count: number
}

type Month = {
  date: string
  month: string
  count: number
}

type UserAgent = {
  userAgent: string
}

type Browsers = Record<string, number>
type OS = Record<string, number>

type LoaderData = {
  browsers: Browsers
  cumulative: Array<Day>
  mostViewed: LatestTilPosts
  mostViewedToday: LatestTilPosts
  os: OS
  perDay: Array<Day>
  perMonth: Array<Month>
  totalViews: number
}

export const loader: LoaderFunction = async () => {
  const totalViewsQuery: Promise<{ _count: number }> =
    prisma.postView.aggregate({
      _count: true,
    })

  const perDayQuery: Promise<Array<Day>> = prisma.$queryRaw`
WITH days AS (
  SELECT generate_series(CURRENT_DATE - '30 days'::INTERVAL, CURRENT_DATE, '1 day')::DATE AS day
)

SELECT
	days.day as date,
  to_char(days.day, 'Mon DD') as day,
	count(pv.id)
FROM days
LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('day', "createdAt") = days.day
GROUP BY 1
ORDER BY 1 ASC`

  const perMonthQuery: Promise<Array<Month>> = prisma.$queryRaw`
WITH months AS (
	SELECT (DATE_TRUNC('year', NOW()) + (INTERVAL '1' MONTH * GENERATE_SERIES(0,11)))::DATE AS MONTH
)

SELECT
  months.month as date,
	to_char(months.month, 'Mon') as month,
	COUNT(pv.id)
FROM
	months
	LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('month', "createdAt") = months.month
GROUP BY 1
ORDER BY 1 ASC`

  const cumulativeQuery: Promise<Array<Day>> = prisma.$queryRaw`with data as (
  select
    date_trunc('day', "createdAt") as day,
    count(1)
  from public."PostView" group by 1
)

select
  day::DATE as date,
	to_char(day, 'Mon DD') as day,
  sum(count) over (order by day asc rows between unbounded preceding and current row) as count
from data`

  const mostViewedQuery: Promise<LatestTilPosts> = prisma.$queryRaw`SELECT
	pv."postId",
	COUNT(pv.id),
  json_build_object(
        'postViews', COUNT(pv.id)
    ) as "_count",
	p.*
FROM
	public."PostView" AS pv
	INNER JOIN public."Post" AS p ON p.id = pv."postId"
GROUP BY 1, p.id
ORDER BY count DESC`

  const mostViewedTodayQuery: Promise<LatestTilPosts> = prisma.$queryRaw`SELECT
	pv."postId",
	COUNT(pv.id),
	json_build_object(
        'postViews', COUNT(pv.id)
    ) as "_count",
	p.*
FROM
	public."PostView" AS pv
	INNER JOIN public."Post" AS p ON p.id = pv."postId"
WHERE
	pv."createdAt" >= date_trunc('day', now())
GROUP BY 1, p.id
ORDER BY count DESC`

  const userAgentsQuery: Promise<
    Array<UserAgent>
  > = prisma.$queryRaw`SELECT "userAgent" FROM public."PostView"`

  const [
    totalViews,
    cumulative,
    mostViewed,
    mostViewedToday,
    perDay,
    perMonth,
    userAgents,
  ] = await Promise.all([
    totalViewsQuery,
    cumulativeQuery,
    mostViewedQuery,
    mostViewedTodayQuery,
    perDayQuery,
    perMonthQuery,
    userAgentsQuery,
  ])

  let browsers: Browsers = {}
  let os: OS = {}

  for (const { userAgent } of userAgents) {
    const parsed = parser(userAgent)

    if (parsed.browser.name) {
      if (!browsers[parsed.browser.name]) {
        browsers[parsed.browser.name] = 0
      }

      browsers[parsed.browser.name]++
    }

    if (parsed.os.name) {
      if (!os[parsed.os.name]) {
        os[parsed.os.name] = 0
      }

      os[parsed.os.name]++
    }
  }

  return json<LoaderData>({
    browsers: Object.fromEntries(
      Object.entries(browsers).sort(([, aCount], [, bCount]) => bCount - aCount)
    ),
    cumulative,
    mostViewed,
    mostViewedToday,
    os: Object.fromEntries(
      Object.entries(os).sort(([, aCount], [, bCount]) => bCount - aCount)
    ),
    perDay,
    perMonth,
    totalViews: totalViews._count,
  })
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex px-4 py-2 bg-gray-200 gap-2 dark:bg-gray-700">
        <span>{label}</span>
        <span className="text-brandBlue-600 dark:text-brandBlue-400">
          {payload[0].value}
        </span>
      </div>
    )
  }

  return null
}

enum GraphType {
  ThirtyDays = 'thirty',
  Year = 'year',
  Cumulative = 'cumulative',
}

const GraphButton = ({
  children,
  currentType,
  onClick,
  type,
}: {
  children: React.ReactNode
  currentType: GraphType
  onClick: () => void
  type: GraphType
}) => {
  return (
    <button
      className={clsx(
        'rounded border bg-opacity-25 px-4 py-2 text-xs font-bold uppercase transition-colors',
        {
          'border-brandBlue-700 bg-brandBlue-500 text-brandBlue-100':
            currentType === type,
          'border-gray-700 bg-gray-500 text-gray-400': currentType !== type,
        }
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const DataList = ({
  data,
  title,
}: {
  data: Record<string, number>
  title: string
}) => {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-gray-500 uppercase">{title}</h3>
      <ul className="space-y-1">
        {Object.entries(data).map(([value, count]) => (
          <li className="flex" key={value}>
            <span className="flex-1">{value}</span>
            <span className="ml-auto text-sm dark:text-gray-400">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function StatsPage() {
  const data = useLoaderData<LoaderData>()
  const [graphType, setGraphType] = React.useState(GraphType.ThirtyDays)

  return (
    <div className="max-w-5xl px-5 py-10 mx-auto">
      <div className="items-center mb-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="font-bold text-center text-8xl">
          {data.totalViews}
          <div className="mt-2 text-sm font-normal text-gray-600 uppercase dark:text-gray-700">
            Total views
          </div>
        </div>
        <DataList data={data.os} title="Operating Systems" />
        <DataList data={data.browsers} title="Browsers" />
      </div>
      <div className="mb-4">
        {
          {
            [GraphType.ThirtyDays]: (
              <>
                <h3 className="mb-4 font-semibold text-gray-500 uppercase">
                  Last 30 days
                </h3>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={data.perDay}>
                    <XAxis
                      dataKey="day"
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <YAxis
                      type="number"
                      width={30}
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: '#006dcc33', stroke: '#006dcc77' }}
                    />
                    <Bar dataKey="count" fill="#006dcc" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ),
            [GraphType.Year]: (
              <>
                <h3 className="mb-4 font-semibold text-gray-500 uppercase">
                  This year
                </h3>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={data.perMonth}>
                    <XAxis
                      dataKey="month"
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <YAxis
                      type="number"
                      width={30}
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: '#006dcc33', stroke: '#006dcc77' }}
                    />
                    <Bar dataKey="count" fill="#006dcc" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ),
            [GraphType.Cumulative]: (
              <>
                <h3 className="mb-4 font-semibold text-gray-500 uppercase">
                  Cumulative
                </h3>
                <ResponsiveContainer height={300} width="100%">
                  <LineChart data={data.cumulative}>
                    <XAxis
                      dataKey="day"
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <YAxis
                      type="number"
                      width={30}
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: '#006dcc33' }}
                    />
                    <Line
                      activeDot={{ r: 4 }}
                      strokeOpacity={0.5}
                      type="monotone"
                      dataKey="count"
                      stroke="#006dcc"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ),
          }[graphType]
        }
      </div>
      <div className="flex justify-center mb-12 gap-4 sm:justify-end">
        <GraphButton
          currentType={graphType}
          type={GraphType.ThirtyDays}
          onClick={() => setGraphType(GraphType.ThirtyDays)}
        >
          Last 30 days
        </GraphButton>
        <GraphButton
          currentType={graphType}
          type={GraphType.Year}
          onClick={() => setGraphType(GraphType.Year)}
        >
          This year
        </GraphButton>
        <GraphButton
          currentType={graphType}
          type={GraphType.Cumulative}
          onClick={() => setGraphType(GraphType.Cumulative)}
        >
          Cumulative
        </GraphButton>
      </div>
      <div className="mb-10">
        <h3 className="mb-4 font-semibold text-gray-500 uppercase">
          Most viewed
        </h3>
        <PostList posts={data.mostViewed} sort={SortOrder.views} />
      </div>
      <div>
        <h3 className="mb-4 font-semibold text-gray-500 uppercase">
          Most viewed today
        </h3>
        <PostList posts={data.mostViewedToday} sort={SortOrder.views} />
      </div>
    </div>
  )
}
