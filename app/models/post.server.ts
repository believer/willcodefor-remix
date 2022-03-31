import type { Post, Prisma } from '@prisma/client'
import { prisma } from '~/db.server'

export function getPost(slug?: Post['slug']) {
  return prisma.post.findFirst({
    where: { slug },
  })
}

export type LatestTilPosts = Array<
  Pick<Post, 'id' | 'title' | 'tilId' | 'createdAt' | 'slug' | 'updatedAt'>
>

export function getLatestTil({
  orderBy,
  take,
}: Pick<Prisma.PostFindManyArgs, 'orderBy' | 'take'>): Promise<LatestTilPosts> {
  return prisma.post.findMany({
    select: {
      tilId: true,
      title: true,
      id: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
    take,
    orderBy: orderBy ? orderBy : { createdAt: 'desc' },
  })
}

export function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  })
}
