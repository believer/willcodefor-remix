import type { Post } from '@prisma/client'
import type { LinksFunction, LoaderFunction, MetaFunction } from 'remix'
import { json, Link, useCatch, useLoaderData } from 'remix'
import { prisma } from '~/db.server'
import { getPost } from '~/models/post.server'
import nightOwl from 'highlight.js/styles/night-owl.css'
import { formatDateTime, toISO } from '~/utils/date'
import { md } from '~/utils/markdown'

type LoaderData = {
  nextPost: Pick<Post, 'title' | 'slug'> | null
  post: Post
  previousPost: Pick<Post, 'title' | 'slug'> | null
  series: Array<Post>
  seriesName: string | null
}

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: nightOwl }]
}

export const meta: MetaFunction = ({ data }: { data: LoaderData | null }) => {
  if (!data) {
    return { title: 'No post found', description: 'No post found' }
  }

  const { title, excerpt, slug } = data.post

  return {
    title: `${data.post.title} | Rickard Natt och Dag`,
    description: excerpt,
    'og:title': title,
    'og:url': `https://willcodefor.beer/posts/${slug}`,
    'og:description': excerpt,
    'twitter:title': title,
    'twitter:description': excerpt,
    'twitter:url': `https://willcodefor.beer/posts/${slug}`,
  }
}

export const loader: LoaderFunction = async ({ params }) => {
  const post = await getPost(params.postSlug)

  const seriesNames = {
    rescript: 'ReScript',
  }

  if (!post) {
    throw new Response('Not Found', { status: 404 })
  }

  const nextPost = await prisma.post.findFirst({
    cursor: { id: post.id },
    take: 2,
    skip: 1,
    select: { title: true, slug: true },
    orderBy: { createdAt: 'asc' },
  })
  const previousPost = await prisma.post.findFirst({
    cursor: { id: post.id },
    take: -1,
    skip: 1,
    select: { title: true, slug: true },
    orderBy: { createdAt: 'asc' },
  })

  return json<LoaderData>({
    nextPost,
    post: { ...post, body: md.render(post.body) },
    previousPost,
    series: post.series
      ? await prisma.post.findMany({
          where: { series: post.series },
          orderBy: { createdAt: 'asc' },
        })
      : [],
    seriesName: post.series
      ? seriesNames[post.series as keyof typeof seriesNames]
      : null,
  })
}

export default function PostPage() {
  const data = useLoaderData() as LoaderData

  return (
    <section className="mx-auto max-w-prose">
      <article className="prose dark:prose-invert">
        <h1 className="mb-5 flex text-2xl">
          <span className="not-prose font-medium">
            <Link to=".." prefetch="intent">
              til
            </Link>
          </span>
          <span className="mx-1 font-normal text-gray-400">/</span>
          <span>{data.post.title}</span>
        </h1>
        <span dangerouslySetInnerHTML={{ __html: data.post.body }} />
        {data.series.length > 0 && (
          <section className="not-prose mt-5 rounded-lg bg-brandBlue-50 p-5 text-sm shadow-lg">
            <h2 className="mb-2">{data.seriesName} series</h2>
            <ul className="counter space-y-2">
              {data.series.map((post) => (
                <li className="counter-increment" key={post.id}>
                  {post.title === data.post.title ? (
                    <strong>{post.title}</strong>
                  ) : (
                    <Link to={`/posts/${post.slug}`} prefetch="intent">
                      {post.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
      {data.nextPost || data.previousPost ? (
        <>
          <hr />
          <ul className="flex flex-col items-center justify-between gap-5 space-y-3 text-sm sm:flex-row sm:space-y-0">
            <li>
              {data.nextPost && (
                <Link to={`/posts/${data.nextPost.slug}`} prefetch="intent">
                  ← {data.nextPost.title}
                </Link>
              )}
            </li>
            <li className="text-right">
              {data.previousPost && (
                <Link to={`/posts/${data.previousPost.slug}`} prefetch="intent">
                  {data.previousPost.title} →
                </Link>
              )}
            </li>
          </ul>
        </>
      ) : null}
      <footer className="mt-8 text-center text-xs text-gray-600">
        This til was created{' '}
        <time className="font-semibold" dateTime={toISO(data.post.createdAt)}>
          {formatDateTime(data.post.createdAt)}
        </time>
        {data.post.createdAt !== data.post.updatedAt && (
          <>
            {' '}
            and last modified{' '}
            <time
              className="font-semibold"
              dateTime={toISO(data.post.updatedAt)}
            >
              {formatDateTime(data.post.updatedAt)}
            </time>
          </>
        )}
      </footer>
    </section>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <div>
        Post not found. Try another one from the{' '}
        <Link to="/posts">posts list</Link>
      </div>
    )
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
