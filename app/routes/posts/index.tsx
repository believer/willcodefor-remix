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

export type SortOrder = 'updatedAt' | 'createdAt'

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
  const [params, setParams] = useSearchParams()

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
            <label className="group flex-1">
              <span className="mb-2 block text-sm font-semibold">Search</span>
              <div className="relative rounded border-2 border-gray-300 ring-brandBlue-600 group-focus-within:ring-2 group-focus-within:ring-offset-1 dark:border-gray-700 dark:ring-brandBlue-600 dark:ring-offset-gray-800">
                <input
                  className="w-full py-1 px-2 focus:outline-none dark:bg-gray-800"
                  defaultValue={params.get('query') ?? ''}
                  type="text"
                  name="query"
                  required={!params.get('query')}
                />
                {params.get('query') ? (
                  <button
                    className="absolute right-2 top-1/2 flex hidden h-6 w-6 -translate-y-1/2 transform items-center justify-center rounded-full text-sm focus:bg-brandBlue-100 focus:outline-none focus:ring-2 focus:ring-brandBlue-600 focus:ring-offset-1 group-focus-within:block dark:ring-offset-gray-800 dark:focus:bg-brandBlue-600 dark:focus:ring-brandBlue-600"
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
              className="rounded bg-brandBlue-100 p-2 px-4 text-sm ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brandBlue-600 dark:bg-brandBlue-600 dark:focus:ring-2 dark:focus:ring-offset-gray-800"
              name="_action"
              value="search"
            >
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
        <PostList posts={data.posts} sort={data.sort} />
      ) : (
        <div className="text-center">
          <p className="text-gray-500">No posts found.</p>
        </div>
      )}
    </div>
  )
}
