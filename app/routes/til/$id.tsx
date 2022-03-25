import { LoaderFunction, redirect } from 'remix'
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
