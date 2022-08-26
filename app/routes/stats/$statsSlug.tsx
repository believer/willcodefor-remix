import type { Post } from '@prisma/client'
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
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { prisma } from '~/db.server'
import { getPost } from '~/models/post.server'
import { formatEventDate } from '~/utils/intl'
import type { Day } from './index'
import { CustomTooltip } from './index'

type Event = {
  x: string
  value: string
  display: boolean
}

type LoaderData = {
  cumulative: Array<Day>
  events: Array<Event>
  perDay: Array<Day>
  post: Post
  totalViews: number
}

const tweets = {
  dataview: 'Jun 23',
  pggen: 'Jun 10',
}

export const loader: LoaderFunction = async ({ params }) => {
  const post = await getPost(params.statsSlug)

  if (!post) {
    throw new Response('Not Found', { status: 404 })
  }

  const totalViewsQuery: Promise<{ _count: number }> =
    prisma.postView.aggregate({
      _count: true,
      where: {
        postId: post.id,
      },
    })

  const cumulativeQuery: Promise<Array<Day>> = prisma.$queryRaw`
WITH firstPostView AS (
	SELECT "createdAt" FROM public."PostView" FETCH FIRST ROW ONLY
),
days AS (
  SELECT GENERATE_SERIES(
    DATE_TRUNC('day',(SELECT "createdAt" FROM firstPostView)),
		DATE_TRUNC('day', CURRENT_DATE),
		'1 day'
	)::DATE AS DAY
),
post as (
	SELECT id FROM public."Post" WHERE slug = ${params.statsSlug}
),
data as (
  select
    case when date_trunc('day', pv."createdAt") IS NOT NULL then date_trunc('day', pv."createdAt") else days.day end as day,
    count(pv)
   from days
  LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('day', "createdAt") = days.day AND "postId" = (select id from post)
  group by 1
  order by 1 asc
)

select
  day::DATE as date,
	to_char(day, 'Mon DD') as day,
  sum(count) over (order by day asc rows between unbounded preceding and current row) as count
from data`

  const perDayQuery: Promise<Array<Day>> = prisma.$queryRaw`
WITH firstPostView AS (
	SELECT "createdAt" FROM public."PostView" FETCH FIRST ROW ONLY
),
days AS (
  SELECT GENERATE_SERIES(
    DATE_TRUNC('day',(SELECT "createdAt" FROM firstPostView)),
		DATE_TRUNC('day', CURRENT_DATE),
		'1 day'
	)::DATE AS DAY
),
post as (
	SELECT id FROM public."Post" WHERE slug = ${params.statsSlug}
)

SELECT
	days.day AS DATE,
	TO_CHAR(days.day, 'Mon DD') AS DAY,
	COUNT(pv)
FROM
	days
	LEFT JOIN public."PostView" AS pv ON DATE_TRUNC('day', "createdAt") = days.day AND pv."postId" = (select id from post)
GROUP BY 1
ORDER BY 1 ASC`

  const [cumulative, perDay, totalViews] = await Promise.all([
    cumulativeQuery,
    perDayQuery,
    totalViewsQuery,
  ])

  const tweeted = tweets[post.slug as keyof typeof tweets]
  const postPublished = formatEventDate(post.createdAt)

  const postEvents: Array<Event> =
    postPublished === tweeted
      ? [
          {
            x: tweeted,
            value: 'Published / tweeted',
            display: true,
          },
        ]
      : [
          {
            x: formatEventDate(post.createdAt),
            value: 'Published',
            display: true,
          },
          {
            x: tweeted,
            value: 'Tweeted',
            display: !!tweeted,
          },
        ]

  const events = [
    {
      x: 'Jun 18',
      value: 'Posted on ReScript forum',
      display: post.series === 'rescript',
    },
    ...postEvents,
  ]

  return json<LoaderData>({
    cumulative,
    events,
    perDay,
    post,
    totalViews: totalViews._count,
  })
}

export default function StatsPostPage() {
  const data = useLoaderData<LoaderData>()

  return (
    <div>
      <div className="flex justify-between">
        <Link to="../" prefetch="intent">
          Back to stats
        </Link>
        <Link to={`/${data.post.slug}`} prefetch="intent">
          To post
        </Link>
      </div>
      <h1 className="mt-8 mb-10 font-semibold">{data.post.title}</h1>
      <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center text-center text-8xl font-bold">
          {data.totalViews}
          <div className="mt-2 text-sm font-normal uppercase text-gray-600 dark:text-gray-700">
            Total views
          </div>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="my-4 font-semibold uppercase text-gray-500">
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
              cursor={{ fill: '#006dcc33', stroke: '#006dcc77' }}
            />
            {data.events.map((event) =>
              event.display ? (
                <ReferenceLine
                  key={event.x}
                  x={event.x}
                  stroke="#f472b6"
                  strokeDasharray="5 5"
                  label={{
                    fill: '#d1d5db',
                    fontSize: 12,
                    position: 'top',
                    value: event.value,
                  }}
                />
              ) : null
            )}
            <Line dataKey="count" fill="#006dcc" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="my-4 font-semibold uppercase text-gray-500">Per day</h3>
        <ResponsiveContainer height={300} width="100%">
          <BarChart data={data.perDay} margin={{ top: 30 }}>
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
            {data.events.map((event) =>
              event.display ? (
                <ReferenceLine
                  key={event.x}
                  x={event.x}
                  stroke="#f472b6"
                  strokeDasharray="5 5"
                  label={{
                    fill: '#d1d5db',
                    fontSize: 12,
                    position: 'top',
                    value: event.value,
                  }}
                />
              ) : null
            )}
            <Bar dataKey="count" fill="#006dcc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <div>
        Post not found. Try another one from the{' '}
        <Link to="/posts">posts list</Link>
      </div>
    )
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
