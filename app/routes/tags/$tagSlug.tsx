import type { LoaderFunction } from 'remix'
import { json, useLoaderData, useParams } from 'remix'
import PostList from '~/components/PostList'
import { prisma } from '~/db.server'
import type { LatestTilPosts } from '~/models/post.server'

type LoaderData = {
  posts: LatestTilPosts
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
    include: {
      _count: { select: { postViews: true } },
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
    <div className="max-w-2xl mx-auto">
      <div className="items-center justify-between mb-4 sm:mb-8 sm:flex">
        <h2 className="sm:mb-0">Tag: {params.tagSlug}</h2>
      </div>

      <PostList posts={data.posts} />

      {data.posts.length === 0 ? (
        <p className="text-center">No posts found.</p>
      ) : null}
    </div>
  )
}
