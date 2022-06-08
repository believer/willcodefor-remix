import { Link } from 'remix'
import type { LatestTilPosts } from '~/models/post.server'
import { SortOrder } from '~/routes/posts/index'
import { formatDate, formatDateTime, parseNumber, toISO } from '~/utils/intl'

type PostListProps = {
  posts: LatestTilPosts
  sort?: SortOrder
}

export default function PostList({
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
            className="relative items-baseline w-full til-counter grid-post grid gap-4 sm:inline-flex sm:gap-5"
            data-til={post.tilId}
            key={post.id}
          >
            <Link to={`/posts/${post.slug}`} prefetch="intent">
              {post.title}
            </Link>
            <hr className="flex-1 hidden m-0 border-gray-300 border-dashed dark:border-gray-600 sm:block" />
            {isTimeSort ? (
              <time
                className="font-mono text-xs text-gray-500 tabular-nums dark:text-gray-400"
                dateTime={toISO(time)}
              >
                <span className="hidden sm:block">{formatDateTime(time)}</span>
                <span className="block sm:hidden">{formatDate(time)}</span>
              </time>
            ) : (
              <div className="font-mono text-xs text-gray-500 tabular-nums dark:text-gray-400">
                {parseNumber(post._count.postViews)} views
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
