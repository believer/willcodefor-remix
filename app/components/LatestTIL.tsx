import { Link } from '@remix-run/react'
import type { TilPost } from '~/models/post.server'
import { PostRow } from '~/components/PostRow'
import { ExternalLink } from './Link'

type LatestTILProps = {
  posts: Array<TilPost>
}

export const LatestTIL = ({ posts }: LatestTILProps) => {
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
          <ExternalLink href="https://leebyron.com/til">TIL</ExternalLink> and
          builds on top of my initial attempt with my{' '}
          <a href="https://devlog.willcodefor.beer">Devlog</a>.
        </p>

        <ol className="mt-8 space-y-2 sm:space-y-4">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </ol>

        <div className="mt-4 flex justify-end">
          <Link to="feed.xml" reloadDocument>
            Feed
          </Link>
        </div>
      </div>
    </section>
  )
}
