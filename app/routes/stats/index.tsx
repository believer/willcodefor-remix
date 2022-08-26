import type { Post } from '@prisma/client'
import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData, useSearchParams } from '@remix-run/react'
import clsx from 'clsx'
import React from 'react'
import type { TooltipProps } from 'recharts'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import parser from 'ua-parser-js'
import PostList, { PostListLinkTo } from '~/components/PostList'
import { prisma } from '~/db.server'
import type { LatestTilPosts } from '~/models/post.server'
import { SortOrder } from '~/routes/posts/index'
import { formatEventDate, formatTime, parsePercent, toISO } from '~/utils/intl'

enum GraphType {
  Today = 'today',
  Week = 'week',
  ThirtyDays = 'thirty',
  Year = 'year',
  Cumulative = 'cumulative',
}

type Hour = {
  date: string
  hour: string
  count: number
}

type DayPost = Pick<Post, 'title' | 'slug'>

export type Day = {
  date: string
  day: string
  count: number
  posts?: Array<DayPost>
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

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const graphType =
    (url.searchParams.get('graphType') as GraphType) ?? GraphType.Today
  const pageParam = url.searchParams.get('page')
  const page = pageParam ? parseInt(pageParam, 10) : 1

  let totalViewsCreatedAt: Date = new Date(2000, 0, 1)
  const now = new Date()

  switch (graphType) {
    case GraphType.Today:
      now.setHours(0, 0, 0, 0)
      totalViewsCreatedAt = now
      break
    case GraphType.Week:
      // Set to monday
      var day = now.getDay() || 7
      now.setHours(0, 0, 0, 0)
      if (day !== 1) {
        now.setHours(-24 * (day - 1))
      }
      totalViewsCreatedAt = now
      break
    case GraphType.ThirtyDays:
      // Set to 30 days ago
      now.setDate(now.getDate() - 30)
      now.setHours(0, 0, 0, 0)
      totalViewsCreatedAt = now
      break
    case GraphType.Year:
      // Set to this year
      now.setFullYear(now.getFullYear(), 0, 1)
      now.setHours(0, 0, 0, 0)
      totalViewsCreatedAt = now
      break
  }

  const postsPublishedQuery = prisma.post.findMany({
    where: {
      createdAt: {
        gte: new Date(2022, 5, 1),
      },
    },
    select: {
      createdAt: true,
      slug: true,
    },
  })

  const totalViewsQuery: Promise<{ _count: number }> =
    prisma.postView.aggregate({
      _count: true,
      where: {
        createdAt: {
          gte: totalViewsCreatedAt,
        },
      },
    })

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const eventsTodayQuery = prisma.postView.findMany({
    where: {
      createdAt: {
        gte: today,
      },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      post: {
        select: {
          title: true,
          tilId: true,
          slug: true,
        },
      },
    },
  })

  const viewsPerDayQuery: Promise<
    Array<{
      viewsPerDay: number
    }>
  > = prisma.$queryRaw`SELECT ROUND((COUNT(id) / (max("createdAt")::DATE - min("createdAt")::DATE + 1)::NUMERIC), 2) as "viewsPerDay" FROM public."PostView"`

  const perHourQuery: Promise<Array<Hour>> = prisma.$queryRaw`
WITH days AS (
  SELECT generate_series(CURRENT_DATE, CURRENT_DATE + '1 day'::INTERVAL, '1 hour') AS hour
)

SELECT
	days.hour as date,
  to_char(days.hour, 'HH24:MI') as hour,
  count(pv.id)::int,
	case when count(pv.id) > 0 then json_agg(json_build_object('title', p.title, 'slug', p.slug)) else '[]' end as posts
FROM days
LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('hour', "createdAt") = days.hour
LEFT JOIN public."Post" AS p ON p.id = pv."postId"
GROUP BY 1
ORDER BY 1 ASC`

  const perDayQuery: Promise<Array<Day>> = prisma.$queryRaw`
WITH days AS (
  SELECT generate_series(CURRENT_DATE - '30 days'::INTERVAL, CURRENT_DATE, '1 day')::DATE AS day
)

SELECT
	days.day as date,
  to_char(days.day, 'Mon DD') as day,
  count(pv.id)::int
FROM days
LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('day', "createdAt") = days.day
GROUP BY 1
ORDER BY 1 ASC`

  const perWeekQuery: Promise<Array<Day>> = prisma.$queryRaw`
WITH days AS (
  SELECT generate_series(date_trunc('week', current_date), date_trunc('week', current_date) + '6 days'::INTERVAL, '1 day')::DATE as day
)

SELECT
	days.day as date,
  to_char(days.day, 'Mon DD') as day,
  count(pv.id)::int
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
  COUNT(pv.id)::int
FROM
	months
	LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('month', "createdAt") = months.month
GROUP BY 1
ORDER BY 1 ASC`

  const cumulativeQuery: Promise<Array<Day>> = prisma.$queryRaw`
with data as (
  select
    date_trunc('day', "createdAt") as day,
    count(1)::int
  from public."PostView" group by 1
)

select
  day::DATE as date,
	to_char(day, 'Mon DD') as day,
  sum(count) over (order by day asc rows between unbounded preceding and current row)::int as count
from data`

  const mostViewedQuery: Promise<LatestTilPosts> = prisma.$queryRaw`
SELECT
	pv."postId",
  COUNT(pv.id)::int,
  json_build_object(
        'postViews', COUNT(pv.id)
    ) as "_count",
	p.*
FROM
	public."PostView" AS pv
	INNER JOIN public."Post" AS p ON p.id = pv."postId"
GROUP BY 1, p.id
ORDER BY count DESC
LIMIT ${10 * page}`

  const mostViewedTodayQuery: Promise<LatestTilPosts> = prisma.$queryRaw`
SELECT
	pv."postId",
  COUNT(pv.id)::int,
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

  const numberOfPostsWithViewsQuery: Promise<
    Array<{ postId: string }>
  > = prisma.$queryRaw`SELECT "postId" FROM public."PostView" GROUP BY "postId"`

  let userAgentsQuery: Promise<
    Array<UserAgent>
  > = prisma.$queryRaw`SELECT "userAgent" FROM public."PostView"`

  switch (graphType) {
    case GraphType.ThirtyDays:
      userAgentsQuery = prisma.$queryRaw`SELECT "userAgent" FROM public."PostView" WHERE "createdAt" >= CURRENT_DATE - '30 days'::INTERVAL`
      break
    case GraphType.Today:
      userAgentsQuery = prisma.$queryRaw`SELECT "userAgent" FROM public."PostView" WHERE "createdAt" >= CURRENT_DATE`
      break
    case GraphType.Week:
      userAgentsQuery = prisma.$queryRaw`SELECT "userAgent" FROM public."PostView" WHERE "createdAt" >= date_trunc('week', CURRENT_DATE)`
      break
    case GraphType.Year:
      userAgentsQuery = prisma.$queryRaw`SELECT "userAgent" FROM public."PostView" WHERE "createdAt" >= date_trunc('year', CURRENT_DATE)`
      break
    case GraphType.Cumulative:
      userAgentsQuery = prisma.$queryRaw`SELECT "userAgent" FROM public."PostView"`
      break
  }

  const [
    totalViews,
    cumulative,
    mostViewed,
    mostViewedToday,
    perDay,
    perHour,
    perMonth,
    perWeek,
    userAgents,
    [{ viewsPerDay }],
    numberOfPostsWithViews,
    publishedPosts,
    eventsToday,
  ] = await Promise.all([
    totalViewsQuery,
    cumulativeQuery,
    mostViewedQuery,
    mostViewedTodayQuery,
    perDayQuery,
    perHourQuery,
    perMonthQuery,
    perWeekQuery,
    userAgentsQuery,
    viewsPerDayQuery,
    numberOfPostsWithViewsQuery,
    postsPublishedQuery,
    eventsTodayQuery,
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

  return json({
    cumulative,
    hasMore: numberOfPostsWithViews.length > 10 * page,
    mostViewed,
    mostViewedToday,
    numberOfPostsWithViews: numberOfPostsWithViews.length,
    perDay,
    perHour,
    perMonth,
    perWeek,
    publishedPosts,
    viewsPerDay: viewsPerDay.toFixed(2),
    totalViews: totalViews._count,
    eventsToday,
    browsers: Object.fromEntries(
      Object.entries(browsers).sort(([, aCount], [, bCount]) => bCount - aCount)
    ),
    os: Object.fromEntries(
      Object.entries(os).sort(([, aCount], [, bCount]) => bCount - aCount)
    ),
  })
}

export const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-200 px-4 py-2 dark:bg-gray-700">
        <div className="flex gap-2">
          <span>{label}</span>
          <span className="text-brandBlue-600 dark:text-brandBlue-400">
            {payload[0].value}
          </span>
        </div>
        {payload[0].payload?.posts?.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-300">
            {payload[0].payload.posts.map((post: DayPost) => (
              <li key={post.slug}>{post.title}</li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  return null
}

const GraphButton = ({
  children,
  currentType,
  type,
}: {
  children: React.ReactNode
  currentType: GraphType
  type: GraphType
}) => {
  return (
    <Link
      className={clsx(
        'rounded border bg-opacity-25 px-4 py-2 text-center text-xs font-bold uppercase no-underline transition-colors',
        {
          'border-brandBlue-500 bg-brandBlue-300 text-brandBlue-700 dark:border-brandBlue-700 dark:bg-brandBlue-500 dark:text-brandBlue-100':
            currentType === type,
          'border-gray-500 bg-gray-200 text-gray-500 hover:border-brandBlue-500 hover:bg-brandBlue-300 hover:bg-opacity-25 hover:text-brandBlue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:dark:border-brandBlue-700 hover:dark:bg-brandBlue-500 hover:dark:text-brandBlue-100':
            currentType !== type,
        }
      )}
      prefetch="intent"
      to={`/stats?graphType=${type}`}
    >
      {children}
    </Link>
  )
}

const DataList = ({
  data,
  title,
}: {
  data: Record<string, number>
  title: string
}) => {
  const sum = Object.values(data).reduce((acc, curr) => acc + curr, 0)

  return (
    <div>
      <h3 className="mb-2 font-semibold uppercase text-gray-500">{title}</h3>
      <ul className="space-y-1">
        {Object.entries(data).map(([value, count]) => (
          <li
            className="grid grid-cols-[auto_1fr_52px] items-center gap-2"
            key={value}
          >
            <span className="flex-1">{value}</span>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {count}
            </span>
            <span className="text-right font-mono text-xs tabular-nums text-gray-400 dark:text-gray-600">
              ({parsePercent(count / sum)})
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function StatsIndexPage() {
  const data = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const graphType =
    (searchParams.get('graphType') as GraphType) ?? GraphType.Today
  const pageParam = searchParams.get('page')
  const page = pageParam ? parseInt(pageParam, 10) : 1

  return (
    <div>
      <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center text-center text-8xl font-bold">
          {data.totalViews}
          <div className="mt-2 text-sm font-normal uppercase text-gray-600 dark:text-gray-700">
            Total views
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center text-8xl font-bold">
          {data.viewsPerDay}
          <div className="mt-2 text-sm font-normal uppercase text-gray-600 dark:text-gray-700">
            Views per day (average)
          </div>
        </div>
      </div>
      <div className="mb-4">
        {
          {
            [GraphType.Today]: (
              <>
                <h3 className="mb-4 font-semibold uppercase text-gray-500">
                  Today
                </h3>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={data.perHour}>
                    <XAxis
                      dataKey="hour"
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <YAxis
                      allowDecimals={false}
                      type="number"
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
            [GraphType.ThirtyDays]: (
              <>
                <h3 className="mb-4 font-semibold uppercase text-gray-500">
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
                      allowDecimals={false}
                      type="number"
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
            [GraphType.Week]: (
              <>
                <h3 className="mb-4 font-semibold uppercase text-gray-500">
                  This week
                </h3>
                <ResponsiveContainer height={300} width="100%">
                  <BarChart data={data.perWeek}>
                    <XAxis
                      dataKey="day"
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <YAxis
                      allowDecimals={false}
                      type="number"
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
                <h3 className="mb-4 font-semibold uppercase text-gray-500">
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
                      allowDecimals={false}
                      type="number"
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
                <h3 className="mb-4 font-semibold uppercase text-gray-500">
                  Cumulative
                </h3>
                <ResponsiveContainer height={300} width="100%">
                  <LineChart data={data.cumulative} margin={{ top: 30 }}>
                    <XAxis
                      dataKey="day"
                      axisLine={{ stroke: '#374151' }}
                      stroke="#374151"
                    />
                    <YAxis
                      allowDecimals={false}
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
                    {data.publishedPosts.map((post) => (
                      <ReferenceLine
                        key={post.slug}
                        x={formatEventDate(new Date(post.createdAt))}
                        stroke="#f472b6"
                        strokeDasharray="5 5"
                        label={{
                          fill: '#d1d5db',
                          fontSize: 12,
                          position: 'top',
                          value: `${post.slug}`,
                        }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </>
            ),
          }[graphType]
        }
      </div>
      <div className="mb-12 flex justify-center sm:justify-end">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <GraphButton currentType={graphType} type={GraphType.Today}>
            Today
          </GraphButton>
          <GraphButton currentType={graphType} type={GraphType.Week}>
            This week
          </GraphButton>
          <GraphButton currentType={graphType} type={GraphType.ThirtyDays}>
            Last 30 days
          </GraphButton>
          <GraphButton currentType={graphType} type={GraphType.Year}>
            This year
          </GraphButton>
          <GraphButton currentType={graphType} type={GraphType.Cumulative}>
            Cumulative
          </GraphButton>
        </div>
      </div>
      <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <DataList data={data.os} title="Operating Systems" />
        <DataList data={data.browsers} title="Browsers" />
      </div>
      <div className="mb-10">
        <h3 className="mb-4 font-semibold uppercase text-gray-500">
          Most viewed
        </h3>
        <PostList
          linkTo={PostListLinkTo.Stats}
          posts={data.mostViewed}
          sort={SortOrder.views}
        />
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {data.numberOfPostsWithViews} posts with views
        </div>
        {data.hasMore ? (
          <div className="mt-8 flex justify-center">
            <Link
              className="hover: rounded border border-gray-500 bg-gray-200 bg-opacity-25 px-4 py-2 text-center text-xs font-bold uppercase text-gray-500 no-underline transition-colors hover:border-brandBlue-500 hover:bg-brandBlue-300 hover:bg-opacity-25 hover:text-brandBlue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:dark:border-brandBlue-700 hover:dark:bg-brandBlue-500 hover:dark:text-brandBlue-100"
              prefetch="intent"
              to={`/stats?page=${page + 1}`}
            >
              Load more
            </Link>
          </div>
        ) : null}
      </div>
      <div className="mb-10">
        <h3 className="mb-4 font-semibold uppercase text-gray-500">
          Most viewed today
        </h3>
        <PostList
          linkTo={PostListLinkTo.Stats}
          posts={data.mostViewedToday}
          sort={SortOrder.views}
        />
      </div>
      <div>
        <h3 className="mb-4 font-semibold uppercase text-gray-500">
          Views today
        </h3>
        <ol className="space-y-2 sm:space-y-4">
          {data.eventsToday.map((event, i) => (
            <li
              className="til-counter grid-post relative grid w-full items-baseline gap-4 sm:inline-flex sm:gap-5"
              data-til={i + 1}
              key={event.id}
            >
              <Link to={`/stats/${event.post.slug}`} prefetch="intent">
                {event.post.title}
              </Link>
              <hr className="m-0 hidden flex-1 border-dashed border-gray-300 dark:border-gray-600 sm:block" />
              <time
                className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400"
                dateTime={toISO(event.createdAt)}
              >
                {formatTime(event.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
