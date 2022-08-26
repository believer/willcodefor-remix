import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, useParams } from '@remix-run/react'
import PostList from '~/components/PostList'
import { prisma } from '~/db.server'

export async function loader({ params }: LoaderArgs) {
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
    include: {
      _count: { select: { postViews: true } },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return json({ posts })
}

export default function PostsIndexPage() {
  const data = useLoaderData<typeof loader>()
  const params = useParams()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 items-center justify-between sm:mb-8 sm:flex">
        <h2 className="sm:mb-0">Tag: {params.tagSlug}</h2>
      </div>

      <PostList posts={data.posts} />

      {data.posts.length === 0 ? (
        <p className="text-center">No posts found.</p>
      ) : null}
    </div>
  )
}
