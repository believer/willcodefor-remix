import { Post } from '@prisma/client'
import { Link } from 'remix'
import { LatestTilPosts } from '~/models/post.server'
import { formatDate, formatDateTime, toISO } from '~/utils/date'

type LatestTILProps = {
  posts: LatestTilPosts
}

const LatestTIL = ({ posts }: LatestTILProps) => {
  return (
    <section className="mt-10 grid gap-6 md:grid-cols-12">
      <header className="col-span-12 text-gray-600 dark:text-gray-400 md:col-span-2 md:text-right">
        Latest TIL
      </header>

      <div className="col-span-12 md:col-span-10">
        <p className="mt-0">
          Here are interesting things I found while browsing the web. It's ideas
          and thoughts, new findings, and reminders regarding software
          development. I see it as a second brain for all things related to
          development and a way for me to practice{' '}
          <a href="/posts/learning-in-public">Learning in public</a>.
        </p>

        <p>
          This is heavily inspired by Lee Byron's{' '}
          <a
            href="https://leebyron.com/til"
            target="_blank"
            rel="noopener noreferrer"
          >
            TIL
          </a>{' '}
          and builds on top of my initial attempt with my{' '}
          <a href="https://devlog.willcodefor.beer">Devlog</a>.
        </p>

        <ul className="mt-8 space-y-3">
          {posts.map((post) => (
            <li
              className="grid-post til-counter relative grid items-baseline gap-4 sm:gap-5"
              data-til={post.tilId}
              key={post.id}
            >
              <h2 className="m-0 text-base font-medium text-gray-800 dark:text-gray-400">
                <Link to={`/posts/${post.slug}`} prefetch="intent">
                  {post.title}
                </Link>
              </h2>
              <hr className="m-0 hidden border-dashed border-gray-300 sm:block" />

              <time
                className="font-mono text-xs tabular-nums text-gray-500"
                dateTime={toISO(post.createdAt)}
              >
                <span className="hidden sm:block">
                  {formatDateTime(post.createdAt)}
                </span>
                <span className="block sm:hidden">
                  {formatDate(post.createdAt)}
                </span>
              </time>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-end">
          <Link to="feed" reloadDocument>
            Feed
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LatestTIL
