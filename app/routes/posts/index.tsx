import { Prisma } from '@prisma/client'
import clsx from 'clsx'
import {
  json,
  Link,
  LoaderFunction,
  useLoaderData,
  useSearchParams,
} from 'remix'
import { prisma } from '~/db.server'
import { getLatestTil, LatestTilPosts } from '~/models/post.server'
import { formatDate, formatDateTime, toISO } from '~/utils/date'

type SortOrder = 'updatedAt' | 'createdAt'

type LoaderData = {
  pages: number
  posts: LatestTilPosts
}

export const loader: LoaderFunction = async ({ request }) => {
  const PAGE_SIZE = 25
  const searchParams = new URL(request.url).searchParams
  const sortOrder = (searchParams.get('sort') ?? 'createdAt') as SortOrder
  const orderBy: Prisma.PostFindManyArgs['orderBy'] =
    sortOrder === 'updatedAt' ? { updatedAt: 'desc' } : { createdAt: 'desc' }
  const pageParam = searchParams.get('page')
  const page = pageParam ? Number(pageParam) : 1

  const numberOfPosts = await prisma.post.count()
  const posts = await getLatestTil({
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return json<LoaderData>({
    pages: Math.ceil(numberOfPosts / PAGE_SIZE),
    posts,
  })
}

export default function PostsIndexPage() {
  const data = useLoaderData() as LoaderData
  const [searchParams, setSearchParams] = useSearchParams()
  const orderBy = (searchParams.get('sort') ?? 'createdAt') as SortOrder
  const pageParam = searchParams.get('page')
  const currentPage = pageParam ? Number(pageParam) : 1

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 items-center justify-between sm:mb-8 sm:flex">
        <h2 className="sm:mb-0">Today I Learned</h2>

        <ul className="flex space-x-2 text-sm sm:justify-end">
          <li className="font-semibold">Sort posts by:</li>
          <li>
            <Link
              className={clsx({ 'font-bold': orderBy === 'createdAt' })}
              to="?sort=createdAt"
              prefetch="intent"
            >
              Created
            </Link>
          </li>
          <li>
            <Link
              className={clsx({ 'font-bold': orderBy === 'updatedAt' })}
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
          const time = orderBy === 'createdAt' ? post.createdAt : post.updatedAt

          return (
            <li
              className="grid-post til-counter relative grid items-baseline gap-4 sm:gap-5"
              data-til={post.tilId}
              key={post.id}
            >
              <Link to={`/posts/${post.slug}`} prefetch="intent">
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

      <div className="mt-10 flex items-center justify-center gap-2">
        {[...Array(data.pages).keys()]
          .map((i) => i + 1)
          .map((page) => (
            <button
              className={clsx(
                'rounded py-2 px-4 tabular-nums text-brandBlue-900 no-underline hover:bg-brandBlue-300',
                {
                  'bg-brandBlue-300': currentPage === page,
                  'bg-brandBlue-100': currentPage !== page,
                }
              )}
              key={`page-${page}`}
              onClick={() => {
                searchParams.set('page', page.toString())
                setSearchParams(searchParams.toString())
              }}
            >
              {page}
            </button>
          ))}
      </div>
    </div>
  )
}
