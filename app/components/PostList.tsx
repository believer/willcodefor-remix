import { Link } from '@remix-run/react'
import type { TilPost } from '~/models/post.server'
import { SortOrder } from '~/routes/posts/index'
import { formatDate, formatDateTime, parseNumber, toISO } from '~/utils/intl'

export enum PostListLinkTo {
  Post = 'posts',
  Stats = 'stats',
}

type PostListProps = {
  linkTo?: PostListLinkTo
  posts: Array<TilPost>
  sort?: SortOrder
}

export default function PostList({
  linkTo = PostListLinkTo.Post,
  posts,
  sort = SortOrder.createdAt,
}: PostListProps) {
  return (
    <ol reversed className="space-y-2 sm:space-y-4">
      {posts.map((post) => {
        const time =
          sort === SortOrder.updatedAt ? post.updatedAt : post.createdAt
        const isTimeSort =
          sort === SortOrder.updatedAt || sort === SortOrder.createdAt

        return (
          <li
            className="til-counter grid-post relative grid w-full items-baseline gap-4 sm:inline-flex sm:gap-5"
            data-til={post.tilId}
            key={post.id}
          >
            <Link to={`/${linkTo}/${post.slug}`} prefetch="intent">
              {post.title}
            </Link>
            <hr className="m-0 hidden flex-1 border-dashed border-gray-300 dark:border-gray-600 sm:block" />
            {isTimeSort ? (
              <time
                className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400"
                dateTime={toISO(time)}
              >
                <span className="hidden sm:block">{formatDateTime(time)}</span>
                <span className="block sm:hidden">{formatDate(time)}</span>
              </time>
            ) : (
              <div className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {parseNumber(post._count.postViews)} views
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
