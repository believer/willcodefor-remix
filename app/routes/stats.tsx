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
  month: string
  count: number
}

type LoaderData = {
  cumulative: Array<Day>
  mostViewed: LatestTilPosts
  perDay: Array<Day>
  perMonth: Array<Month>
  totalViews: number
}

export const loader: LoaderFunction = async () => {
  const totalViewsQuery: Promise<{ _count: number }> =
    prisma.postView.aggregate({
      _count: true,
    })

  const last30DaysQuery: Promise<Array<Day>> = prisma.$queryRaw`SELECT
	DATE_TRUNC('day', dd)::DATE as day,
	0 as count
FROM
	GENERATE_SERIES (
    CURRENT_DATE::TIMESTAMP - INTERVAL '30 days',
    CURRENT_DATE::TIMESTAMP, '1 day'::INTERVAL
	) dd;`

  const currentYearQuery: Promise<
    Array<Month>
  > = prisma.$queryRaw`select (date_trunc('year', now()) + (interval '1' month * generate_series(0,11)))::DATE as month, 0 as count`

  const thisYearQuery: Promise<Array<Month>> = prisma.$queryRaw`SELECT
	DATE_TRUNC('month', "createdAt")::DATE as month,
	COUNT(1)
FROM
	public."PostView"
GROUP BY
	1`

  const dateViewsQuery: Promise<Array<Day>> = prisma.$queryRaw`SELECT
  DATE_TRUNC('day', "createdAt")::DATE as day,
    COUNT(1) as count
  FROM public."PostView"
  GROUP BY 1;`

  const cumulativeQuery: Promise<Array<Day>> = prisma.$queryRaw`with data as (
  select
    date_trunc('day', "createdAt") as day,
    count(1)
  from public."PostView"  group by 1
)

select
  day::DATE,
  sum(count) over (order by day asc rows between unbounded preceding and current row) as count
from data`

  const mostViewedQuery = prisma.post.findMany({
    select: {
      _count: {
        select: { postViews: true },
      },
      id: true,
      createdAt: true,
      updatedAt: true,
      tilId: true,
      title: true,
      slug: true,
    },
    take: 10,
    orderBy: {
      postViews: { _count: 'desc' },
    },
  })

  const [
    totalViews,
    last30Days,
    currentYear,
    thisYear,
    dateViews,
    cumulative,
    mostViewed,
  ] = await Promise.all([
    totalViewsQuery,
    last30DaysQuery,
    currentYearQuery,
    thisYearQuery,
    dateViewsQuery,
    cumulativeQuery,
    mostViewedQuery,
  ])

  let perDay = []
  let perMonth = []

  for (const day of last30Days) {
    const views = dateViews.find((d) => d.day === day.day)

    if (views) {
      perDay.push({
        day: day.day,
        count: views.count,
      })
    } else {
      perDay.push(day)
    }
  }

  for (const month of currentYear) {
    const views = thisYear.find((d) => d.month === month.month)

    if (views) {
      perMonth.push({
        month: month.month,
        count: views.count,
      })
    } else {
      perMonth.push(month)
    }
  }

  return json<LoaderData>({
    cumulative,
    mostViewed,
    perDay,
    perMonth,
    totalViews: totalViews._count,
  })
}

export default function StatsPage() {
  const data = useLoaderData<LoaderData>()

  return (
    <div className="mx-auto my-10 max-w-4xl">
      <div className="mb-8 grid grid-cols-2">
        <div className="text-center text-5xl">
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
            <Tooltip cursor={{ fill: '#006dcc33' }} />
            <Bar dataKey="count" fill="#006dcc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="mb-8">
          <h2>Per Month</h2>
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
              <Tooltip cursor={{ fill: '#006dcc33' }} />
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
              <Tooltip cursor={{ stroke: '#006dcc33' }} />
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
      <PostList posts={data.mostViewed} sort={SortOrder.views} />
    </div>
  )
}
