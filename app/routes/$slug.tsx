import type { LoaderFunction} from 'remix';
import { redirect } from 'remix'
import { prisma } from '~/db.server'

export const loader: LoaderFunction = async ({ params }) => {
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ longSlug: params.slug }, { slug: params.slug }],
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
