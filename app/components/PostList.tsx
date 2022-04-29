import { Link } from 'remix'
import { LatestTilPosts } from '~/models/post.server'
import { SortOrder } from '~/routes/posts/index'
import { formatDate, formatDateTime, toISO } from '~/utils/date'

type PostListProps = {
  posts: LatestTilPosts
  sort?: SortOrder
}

export default function PostList({ posts, sort = 'createdAt' }: PostListProps) {
  return (
    <ol reversed className="group space-y-2 sm:space-y-4">
      {posts.map((post) => {
        const time = sort === 'createdAt' ? post.createdAt : post.updatedAt

        return (
          <li
            className="grid-post til-counter relative grid items-baseline gap-4 transition-opacity group-hover:opacity-30 group-hover:hover:opacity-100 sm:gap-5"
            data-til={post.tilId}
            key={post.id}
          >
            <Link to={`/posts/${post.slug}`} prefetch="intent">
              {post.title}
            </Link>
            <hr className="m-0 hidden border-dashed border-gray-300 dark:border-gray-600 sm:block" />
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
