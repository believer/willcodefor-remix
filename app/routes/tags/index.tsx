import type { Tag } from '@prisma/client'
import type { LoaderFunction } from 'remix'
import { json, Link, useLoaderData } from 'remix'
import { prisma } from '~/db.server'

type LoaderData = {
  tags: Tag[]
}

export const loader: LoaderFunction = async () => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    where: { name: { not: 'til' } },
  })

  return json<LoaderData>({ tags })
}

export default function PostsIndexPage() {
  const data = useLoaderData() as LoaderData

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 items-center justify-between sm:mb-8 sm:flex">
        <h2 className="sm:mb-0">Tags</h2>
      </div>

      <ol reversed className="space-y-2 sm:space-y-4">
        {data.tags.map((tag) => {
          return (
            <li
              className="grid-post relative grid items-baseline gap-4 sm:gap-5"
              key={tag.id}
            >
              <Link to={encodeURIComponent(tag.name)} prefetch="intent">
                {tag.name}
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
