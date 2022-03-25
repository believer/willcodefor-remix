import { Link, LoaderFunction, redirect, useCatch } from 'remix'
import { prisma } from '~/db.server'

export const loader: LoaderFunction = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      tilId: Number(params.id),
    },
    select: {
      slug: true,
    },
  })

  if (!post) {
    return redirect(`/posts/404`)
  }

  return redirect(`/posts/${post.slug}`)
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  console.log(caught)

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
