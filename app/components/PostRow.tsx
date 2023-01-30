import type { TilPost } from '~/models/post.server'
import { formatDate, formatDateTime, toISO } from '~/utils/intl'
import { Link } from '@remix-run/react'

type PostRowProps = {
  post: TilPost
}

export const PostRow = ({ post }: PostRowProps) => {
  return (
    <li
      className="til-counter grid-post relative grid w-full items-baseline gap-4 sm:inline-flex sm:gap-5"
      data-til={post.tilId}
    >
      <Link to={`/posts/${post.slug}`} prefetch="intent">
        {post.title}
      </Link>
      <hr className="m-0 hidden flex-1 border-dashed border-gray-300 dark:border-gray-600 sm:block" />
      <time
        className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400"
        dateTime={toISO(post.createdAt)}
      >
        <span className="hidden sm:block">
          {formatDateTime(post.createdAt)}
        </span>
        <span className="block sm:hidden">{formatDate(post.createdAt)}</span>
      </time>
    </li>
  )
}
