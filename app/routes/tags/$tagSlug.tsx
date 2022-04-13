import { Post } from '@prisma/client'
import { json, Link, LoaderFunction, useLoaderData, useParams } from 'remix'
import { prisma } from '~/db.server'
import { formatDate, formatDateTime, toISO } from '~/utils/date'

type LoaderData = {
  posts: Post[]
}

export const loader: LoaderFunction = async ({ params }) => {
  const posts = await prisma.post.findMany({
    where: {
      post_tags: {
        some: {
          tag: {
            name: params.tagSlug,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return json<LoaderData>({ posts })
}

export default function PostsIndexPage() {
  const data = useLoaderData() as LoaderData
  const params = useParams()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 items-center justify-between sm:mb-8 sm:flex">
        <h2 className="sm:mb-0">Tag: {params.tagSlug}</h2>
      </div>

      <ol reversed className="space-y-2 sm:space-y-4">
        {data.posts.map((post) => {
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
                dateTime={toISO(post.createdAt)}
              >
                <span className="hidden sm:block">
                  {formatDateTime(post.createdAt)}
                </span>
                <span className="block sm:hidden">
                  {formatDate(post.createdAt)}
                </span>
              </time>
            </li>
          )
        })}
      </ol>

      {data.posts.length === 0 ? (
        <p className="text-center">No posts found.</p>
      ) : null}
    </div>
  )
}
