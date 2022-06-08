import type { Prisma } from '@prisma/client'
import clsx from 'clsx'
import React from 'react'
import type { ActionFunction, LoaderFunction } from 'remix'
import {
  Form,
  json,
  Link,
  redirect,
  useLoaderData,
  useSearchParams,
} from 'remix'
import PostList from '~/components/PostList'
import type { LatestTilPosts } from '~/models/post.server'
import { getLatestTil, postSearch } from '~/models/post.server'

export enum SortOrder {
  updatedAt = 'updatedAt',
  createdAt = 'createdAt',
  views = 'views',
}

type LoaderData = {
  sort: SortOrder
  posts: LatestTilPosts
}

const getSortOrder = (
  sortOrder: SortOrder
): Prisma.PostFindManyArgs['orderBy'] => {
  switch (sortOrder) {
    case SortOrder.updatedAt:
      return { updatedAt: 'desc' }
    case SortOrder.views:
      return {
        postViews: {
          _count: 'desc',
        },
      }
    default:
      return { createdAt: 'desc' }
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams
  const query = searchParams.get('query')
  const sortOrder = (searchParams.get('sort') ?? 'createdAt') as SortOrder
  const orderBy = getSortOrder(sortOrder)

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
  const [params, setParams] = useSearchParams()

  React.useEffect(() => {
    if (!params.get('query')) {
      formRef.current?.reset()
    }
  }, [params])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sm:grid-search grid grid-cols-1 gap-x-12 gap-y-4">
        <div>
          <Form
            method="post"
            className="flex items-end w-full gap-2"
            ref={formRef}
          >
            <label className="flex-1 group">
              <span className="block mb-2 text-sm font-semibold">Search</span>
              <div className="relative border-2 border-gray-300 rounded ring-brandBlue-600 group-focus-within:ring-2 group-focus-within:ring-offset-1 dark:border-gray-700 dark:ring-brandBlue-600 dark:ring-offset-gray-800">
                <input
                  className="w-full px-2 py-1 focus:outline-none dark:bg-gray-800"
                  defaultValue={params.get('query') ?? ''}
                  type="text"
                  name="query"
                  required={!params.get('query')}
                />
                {params.get('query') ? (
                  <button
                    className="absolute flex items-center justify-center hidden w-6 h-6 text-sm rounded-full right-2 top-1/2 -translate-y-1/2 transform focus:bg-brandBlue-100 focus:outline-none focus:ring-2 focus:ring-brandBlue-600 focus:ring-offset-1 group-focus-within:block dark:ring-offset-gray-800 dark:focus:bg-brandBlue-600 dark:focus:ring-brandBlue-600"
                    onClick={() => {
                      setParams({})
                    }}
                    type="button"
                  >
                    &times;
                  </button>
                ) : null}
              </div>
            </label>
            <button
              className="p-2 px-4 text-sm rounded bg-brandBlue-100 ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brandBlue-600 dark:bg-brandBlue-600 dark:focus:ring-2 dark:focus:ring-offset-gray-800"
              name="_action"
              value="search"
            >
              Search
            </button>
          </Form>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold">Sort posts by</div>
          <ul className="flex text-sm space-x-2">
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
            <li>
              <Link
                className={clsx({ 'font-bold': data.sort === 'views' })}
                to="?sort=views"
                prefetch="intent"
              >
                Views
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <hr className="my-8" />
      {data.posts.length > 0 ? (
        <PostList posts={data.posts} sort={data.sort} />
      ) : (
        <div className="text-center">
          <p className="text-gray-500">No posts found.</p>
        </div>
      )}
    </div>
  )
}
