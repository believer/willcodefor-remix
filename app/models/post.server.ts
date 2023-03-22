import type { Post, Prisma } from '@prisma/client'
import { prisma } from '~/db.server'

export function getPost(slug?: Post['slug']) {
  return prisma.post.findFirst({
    where: { OR: [{ slug }, { longSlug: slug }] },
    include: {
      _count: { select: { postViews: true } },
    },
  })
}

export type TilPost = {
  _count: { postViews: number }
  tilId: number
  title: string
  id: string
  slug: string
  createdAt: string | Date
  updatedAt: string | Date
}

export type LatestTilPosts = Array<TilPost>

export function getLatestTil({
  orderBy,
  take,
}: Pick<Prisma.PostFindManyArgs, 'orderBy' | 'take'>): Promise<LatestTilPosts> {
  return prisma.post.findMany({
    select: {
      _count: { select: { postViews: true } },
      tilId: true,
      title: true,
      id: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
    take,
    orderBy: orderBy ? orderBy : { createdAt: 'desc' },
    where: {
      published: true,
    },
  })
}

export function postSearch(query: string): Promise<LatestTilPosts> {
  return prisma.post.findMany({
    select: {
      _count: { select: { postViews: true } },
      tilId: true,
      title: true,
      id: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      published: true,
      OR: [
        {
          title: {
            mode: 'insensitive',
            search: decodeURI(query).replace(/\s/g, ' & '),
          },
        },
        {
          body: {
            mode: 'insensitive',
            search: decodeURI(query).replace(/\s/g, ' & '),
          },
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
  })
}

export function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      published: true,
    },
  })
}
