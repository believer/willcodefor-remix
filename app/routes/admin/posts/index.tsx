import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { prisma } from '~/db.server'
import { requireUser } from '~/utils/session.server'

export let loader = async ({ request }: LoaderArgs) => {
  await requireUser(request)

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return json({ posts })
}

export default function AdminPosts() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Link to="/admin/posts/new">New post</Link>
      <ul className="mt-8 list-disc space-y-2">
        {data.posts.map((post) => (
          <li key={post.id}>
            <Link to={`/admin/posts/${post.id}`}>{post.title}</Link>
            {post.published ? null : (
              <span className="text-gray-500"> (unpublished)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
