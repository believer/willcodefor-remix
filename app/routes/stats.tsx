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
import { json, Link, useLoaderData } from 'remix'
import PostList from '~/components/PostList'
import { prisma } from '~/db.server'
import type { LatestTilPosts } from '~/models/post.server'
import { SortOrder } from '~/routes/posts/index'

type Day = {
  day: string
  count: number
}

type LoaderData = {
  cumulative: Array<Day>
  mostViewed: LatestTilPosts
  totalViews: number
  perDay: Array<Day>
}

export const loader: LoaderFunction = async () => {
  const totalViews = await prisma.postView.aggregate({
    _count: true,
  })

  const last30Days: Array<Day> = await prisma.$queryRaw`SELECT
	DATE_TRUNC('day', dd)::DATE as day,
	0 as count
FROM
	GENERATE_SERIES (
		'2022-06-08'::TIMESTAMP - INTERVAL '30 days',
		'2022-06-08'::TIMESTAMP, '1 day'::INTERVAL
	) dd;`

  const dateViews: Array<Day> = await prisma.$queryRaw`SELECT
  DATE_TRUNC('day', "createdAt")::DATE as day,
    COUNT(1) as count
  FROM public."PostView"
  GROUP BY 1;`

  const cumulative: Array<Day> = await prisma.$queryRaw`with data as (
  select
    date_trunc('day', "createdAt") as day,
    count(1)
  from public."PostView"  group by 1
)

select
  day::DATE,
  sum(count) over (order by day asc rows between unbounded preceding and current row) as count
from data`

  const mostViewed = await prisma.post.findMany({
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

  let perDay = []

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

  return json<LoaderData>({
    cumulative,
    mostViewed,
    totalViews: totalViews._count,
    perDay,
  })
}

export default function StatsPage() {
  const data = useLoaderData<LoaderData>()

  return (
    <div className="max-w-4xl mx-auto my-10">
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
      <PostList posts={data.mostViewed} sort={SortOrder.views} />
    </div>
  )
}
