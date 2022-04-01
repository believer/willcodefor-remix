import { Prisma } from '@prisma/client'
import clsx from 'clsx'
import { json, Link, LoaderFunction, useLoaderData } from 'remix'
import { getLatestTil, LatestTilPosts } from '~/models/post.server'
import { formatDate, formatDateTime, toISO } from '~/utils/date'

type SortOrder = 'updatedAt' | 'createdAt'

type LoaderData = {
  sort: SortOrder
  posts: LatestTilPosts
}

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams
  const sortOrder = (searchParams.get('sort') ?? 'createdAt') as SortOrder
  const orderBy: Prisma.PostFindManyArgs['orderBy'] =
    sortOrder === 'updatedAt' ? { updatedAt: 'desc' } : { createdAt: 'desc' }

  const posts = await getLatestTil({ orderBy })

  return json<LoaderData>({ sort: sortOrder, posts })
}

export default function PostsIndexPage() {
  const data = useLoaderData() as LoaderData

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 items-center justify-between sm:mb-8 sm:flex">
        <h2 className="sm:mb-0">Today I Learned</h2>

        <ul className="flex space-x-2 text-sm sm:justify-end">
          <li className="font-semibold">Sort posts by:</li>
          <li>
            <Link
              className={clsx({ 'font-bold': data.sort === 'createdAt' })}
              to="?sort=createdAt"
              prefetch="intent"
            >
              Created
            </Link>
          </li>
          <li>
            <Link
              className={clsx({ 'font-bold': data.sort === 'updatedAt' })}
              to="?sort=updatedAt"
              prefetch="intent"
            >
              Last updated
            </Link>
          </li>
        </ul>
      </div>

      <ol reversed className="space-y-2 sm:space-y-4">
        {data.posts.map((post) => {
          const time =
            data.sort === 'createdAt' ? post.createdAt : post.updatedAt

          return (
            <li
              className="grid-post til-counter relative grid items-baseline gap-4 sm:gap-5"
              data-til={post.tilId}
              key={post.id}
            >
              <Link to={post.slug} prefetch="intent">
                {post.title}
              </Link>
              <hr className="m-0 hidden border-dashed border-gray-300 sm:block" />
              <time
                className="font-mono text-xs tabular-nums text-gray-500"
                dateTime={toISO(time)}
              >
                <span className="hidden sm:block">{formatDateTime(time)}</span>
                <span className="block sm:hidden">{formatDate(time)}</span>
              </time>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
