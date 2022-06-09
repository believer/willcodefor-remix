import type { Post } from '@prisma/client'
import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from 'remix'
import { useParams } from 'remix'
import { json, Link, useCatch, useLoaderData } from 'remix'
import { prisma } from '~/db.server'
import { getPost } from '~/models/post.server'
import nightOwl from 'highlight.js/styles/night-owl.css'
import { formatDateTime, toISO } from '~/utils/intl'
import { md } from '~/utils/markdown'
import React from 'react'

type LoaderData = {
  nextPost: Pick<Post, 'title' | 'slug'> | null
  post: Post & { _count: { postViews: number } }
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

export const action: ActionFunction = async ({ params, request }) => {
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ slug: params.postSlug }, { longSlug: params.postSlug }],
    },
    select: { id: true },
  })

  const body: { userAgent: string } = await request.json()

  if (post && !body.userAgent.includes('Googlebot')) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        postViews: {
          create: {
            userAgent: body.userAgent,
          },
        },
      },
    })
  }

  return null
}

export default function PostPage() {
  const data = useLoaderData() as LoaderData
  const params = useParams()

  React.useEffect(() => {
    fetch(`/posts/${params.postSlug}`, {
      method: 'post',
      body: JSON.stringify({
        userAgent: navigator.userAgent,
      }),
    })
  }, [params.postSlug])

  return (
    <section className="mx-auto max-w-prose">
      <article className="prose dark:prose-invert">
        <h1 className="flex mb-5 text-2xl">
          <span className="font-medium not-prose">
            <Link to=".." prefetch="intent">
              til
            </Link>
          </span>
          <span className="mx-1 font-normal text-gray-400">/</span>
          <span>{data.post.title}</span>
        </h1>
        <span dangerouslySetInnerHTML={{ __html: data.post.body }} />
        {data.series.length > 0 && (
          <section className="p-5 mt-5 text-sm rounded-lg shadow-lg not-prose bg-brandBlue-50">
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
          <ul className="flex flex-col items-center justify-between text-sm gap-5 space-y-3 sm:flex-row sm:space-y-0">
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
      <footer className="mt-8 text-xs text-center text-gray-600">
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
        . It has been viewed {data.post._count.postViews} times.
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
