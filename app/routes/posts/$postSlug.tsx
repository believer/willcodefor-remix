import type { Post } from '@prisma/client'
import type {
  ActionFunction,
  LinksFunction,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useCatch, useLoaderData, useParams } from '@remix-run/react'
import nightOwl from 'highlight.js/styles/night-owl.css'
import React from 'react'
import { prisma } from '~/db.server'
import { getPost } from '~/models/post.server'
import { formatDateTime, toISO, toYear } from '~/utils/intl'
import { md } from '~/utils/markdown'

type MetaData = {
  nextPost: Pick<Post, 'title' | 'slug'> | null
  post: Post & { _count: { postViews: number } }
  previousPost: Pick<Post, 'title' | 'slug'> | null
  series: Array<Post>
  seriesName: string | null
}

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: nightOwl }]
}

export const meta: MetaFunction = ({ data }: { data: MetaData | null }) => {
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

export const loader = async ({ params }: LoaderArgs) => {
  const post = await getPost(params.postSlug)

  const seriesNames = {
    applescript: 'AppleScript',
    dataview: 'Dataview',
    neovim: 'Neovim',
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
    where: { published: true },
    orderBy: { createdAt: 'asc' },
  })
  const previousPost = await prisma.post.findFirst({
    cursor: { id: post.id },
    take: -1,
    skip: 1,
    select: { title: true, slug: true },
    where: { published: true },
    orderBy: { createdAt: 'asc' },
  })

  return json({
    nextPost,
    post: { ...post, body: md.render(post.body) },
    previousPost,
    series: post.series
      ? await prisma.post.findMany({
        where: { series: post.series, published: true },
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
  const cookie = request.headers.get('Cookie')

  const hasNoTrackCookie = cookie
    ?.split('; ')
    .flatMap((c) => c.split('=')[0])
    .includes('no-track')

  if (post && !body.userAgent.includes('Googlebot') && !hasNoTrackCookie) {
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
  const data = useLoaderData<typeof loader>()
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
          <section className="not-prose mt-5 rounded-lg bg-brandBlue-50 p-5 text-sm shadow-lg dark:bg-brandBlue-900">
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
        . It has been viewed {data.post._count.postViews} times.
        <div>
          <a
            className="text-gray-600 no-underline"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-NC-SA 4.0
          </a>{' '}
          {toYear(data.post.createdAt)}-PRESENT © Rickard Natt och Dag
        </div>
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
