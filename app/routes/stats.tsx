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

type Day = {
  day: string
  count: number
}

type Month = {
  date: string
  month: string
  count: number
}

type LoaderData = {
  cumulative: Array<Day>
  mostViewed: LatestTilPosts
  mostViewedToday: LatestTilPosts
  perDay: Array<Day>
  perMonth: Array<Month>
  totalViews: number
}

export const loader: LoaderFunction = async () => {
  const totalViewsQuery: Promise<{ _count: number }> =
    prisma.postView.aggregate({
      _count: true,
    })

  const perDayQuery: Promise<Array<Day>> = prisma.$queryRaw`WITH days AS (
	SELECT
		GENERATE_SERIES (
			CURRENT_DATE - INTERVAL '30 days',
			CURRENT_DATE, '1 day'::INTERVAL
		)::DATE AS day
)

SELECT
	days.day,
	count(pv.id)
FROM days
LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('day', "createdAt")::DATE = days.day
GROUP BY 1`

  const perMonthQuery: Promise<Array<Month>> = prisma.$queryRaw`WITH months AS (
	SELECT
		(
			DATE_TRUNC('year', NOW()) + (
				INTERVAL '1' MONTH * GENERATE_SERIES(0,11)
			)
		)::DATE AS MONTH
)
SELECT
  months.month as date,
	to_char(months.month, 'Month') as month,
	COUNT(pv.id)
FROM
	months
	LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('month', "createdAt")::DATE = months.month
GROUP BY
	1
ORDER BY
	1 ASC`

  const cumulativeQuery: Promise<Array<Day>> = prisma.$queryRaw`with data as (
  select
    date_trunc('day', "createdAt") as day,
    count(1)
  from public."PostView" group by 1
)

select
  day::DATE,
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

  const [
    totalViews,
    cumulative,
    mostViewed,
    mostViewedToday,
    perDay,
    perMonth,
  ] = await Promise.all([
    totalViewsQuery,
    cumulativeQuery,
    mostViewedQuery,
    mostViewedTodayQuery,
    perDayQuery,
    perMonthQuery,
  ])

  return json<LoaderData>({
    cumulative,
    mostViewed,
    mostViewedToday,
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

export default function StatsPage() {
  const data = useLoaderData<LoaderData>()

  return (
    <div className="max-w-5xl mx-auto my-10">
      <div className="mb-8 grid grid-cols-2">
        <div className="text-5xl text-center">
          {data.totalViews}
          <div className="mt-2 text-sm text-gray-400 dark:text-gray-700">
            Total views
          </div>
        </div>
        <div></div>
      </div>
      <div className="mb-8">
        <h2>Last 30 days</h2>
        <ResponsiveContainer height={300} width="100%">
          <BarChart data={data.perDay}>
            <XAxis
              dataKey="day"
              axisLine={{ stroke: '#374151' }}
              stroke="#374151"
            />
            <YAxis
              type="number"
              axisLine={{ stroke: '#374151' }}
              stroke="#374151"
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: '#006dcc33' }}
            />
            <Bar dataKey="count" fill="#006dcc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="mb-8">
          <h2>This year</h2>
          <ResponsiveContainer height={300} width="100%">
            <BarChart data={data.perMonth}>
              <XAxis
                dataKey="month"
                axisLine={{ stroke: '#374151' }}
                stroke="#374151"
              />
              <YAxis
                type="number"
                axisLine={{ stroke: '#374151' }}
                stroke="#374151"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: '#006dcc33' }}
              />
              <Bar dataKey="count" fill="#006dcc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2>Cumulative</h2>
          <ResponsiveContainer height={300} width="100%">
            <LineChart data={data.cumulative}>
              <XAxis
                dataKey="day"
                axisLine={{ stroke: '#374151' }}
                stroke="#374151"
              />
              <YAxis
                type="number"
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
        </div>
      </div>
      <div className="mb-8">
        <h2>Most viewed</h2>
        <PostList posts={data.mostViewed} sort={SortOrder.views} />
      </div>
      <div>
        <h2>Most viewed today</h2>
        <PostList posts={data.mostViewedToday} sort={SortOrder.views} />
      </div>
    </div>
  )
}
