import { Link } from 'remix'
import type { LatestTilPosts } from '~/models/post.server'
import type { SortOrder } from '~/routes/posts/index'
import { formatDate, formatDateTime, toISO } from '~/utils/date'

type PostListProps = {
  posts: LatestTilPosts
  sort?: SortOrder
}

export default function PostList({ posts, sort = 'createdAt' }: PostListProps) {
  return (
    <ol reversed className="space-y-2 sm:space-y-4">
      {posts.map((post) => {
        const time = sort === 'updatedAt' ? post.updatedAt : post.createdAt

        return (
          <li
            className="til-counter grid-post relative grid w-full items-baseline gap-4 sm:inline-flex sm:gap-5"
            data-til={post.tilId}
            key={post.id}
          >
            <Link to={`/posts/${post.slug}`} prefetch="intent">
              {post.title}
            </Link>
            <hr className="m-0 hidden flex-1 border-dashed border-gray-300 dark:border-gray-600 sm:block" />
            <time
              className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400"
              dateTime={toISO(time)}
            >
              <span className="hidden sm:block">{formatDateTime(time)}</span>
              <span className="block sm:hidden">{formatDate(time)}</span>
            </time>
          </li>
        )
      })}
    </ol>
  )
}
