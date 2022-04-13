import { Prisma } from '@prisma/client'
import clsx from 'clsx'
import React from 'react'
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useLoaderData,
  useSearchParams,
} from 'remix'
import { getLatestTil, LatestTilPosts, postSearch } from '~/models/post.server'
import { formatDate, formatDateTime, toISO } from '~/utils/date'

type SortOrder = 'updatedAt' | 'createdAt'

type LoaderData = {
  sort: SortOrder
  posts: LatestTilPosts
}

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams
  const sortOrder = (searchParams.get('sort') ?? 'createdAt') as SortOrder
  const query = searchParams.get('query')

  const orderBy: Prisma.PostFindManyArgs['orderBy'] =
    sortOrder === 'updatedAt' ? { updatedAt: 'desc' } : { createdAt: 'desc' }

  const posts = query
    ? await postSearch(query)
    : await getLatestTil({ orderBy })

  return json<LoaderData>({ sort: sortOrder, posts })
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const query = form.get('query')?.toString() ?? ''

  return redirect(`/posts?query=${encodeURI(query)}`)
}

export default function PostsIndexPage() {
  const data = useLoaderData() as LoaderData
  const formRef = React.useRef<HTMLFormElement>(null)
  const [params] = useSearchParams()

  React.useEffect(() => {
    if (!params.get('query')) {
      formRef.current?.reset()
    }
  }, [params])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sm:grid-search grid grid-cols-1 gap-x-12 gap-y-4">
        <div>
          <Form
            method="post"
            className="flex w-full items-end gap-2"
            ref={formRef}
          >
            <label className="flex-1">
              <span className="mb-2 block text-sm font-semibold">Search</span>
              <input
                className="w-full rounded border-2 border-gray-300 py-1 px-2 ring-brandBlue-600 focus:outline-none focus:ring-2 focus:ring-offset-1"
                type="text"
                name="query"
                required={!params.get('query')}
              />
            </label>
            <button className="rounded bg-brandBlue-100 p-2 px-4 text-sm">
              Search
            </button>
          </Form>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">Sort posts by</div>
          <ul className="flex space-x-2 text-sm">
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
      </div>
      <hr className="my-8" />
      {data.posts.length > 0 ? (
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
                  <span className="hidden sm:block">
                    {formatDateTime(time)}
                  </span>
                  <span className="block sm:hidden">{formatDate(time)}</span>
                </time>
              </li>
            )
          })}
        </ol>
      ) : (
        <div className="text-center">
          <p className="text-gray-500">No posts found.</p>
        </div>
      )}
    </div>
  )
}
