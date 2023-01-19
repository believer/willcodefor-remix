import type { ActionArgs, LinksFunction, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useLoaderData, useParams } from '@remix-run/react'
import { prisma } from '~/db.server'
import { requireUser } from '~/utils/session.server'
import tokyoNight from 'highlight.js/styles/tokyo-night-dark.css'
import { Editor } from '~/components/Editor'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tokyoNight }]
}

export let loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request)

  if (params.adminId === 'new') {
    const latestPost = await prisma.post.findFirst({
      select: { tilId: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    if (!latestPost) {
      throw new Error('No posts found')
    }

    return json({
      post: {
        body: '',
        title: '',
        tilId: latestPost.tilId + 1,
        excerpt: '',
        slug: '',
        longSlug: '',
        published: false,
        series: '',
      },
    })
  }

  const post = await prisma.post.findUnique({
    where: {
      id: params.adminId,
    },
  })

  if (!post) {
    throw new Response('Not Found', { status: 404 })
  }

  return json({ post })
}

export const action = async ({ params, request }: ActionArgs) => {
  const formData = await request.formData()
  const data: any = Object.fromEntries(formData.entries())
  const published = formData.get('published')

  if (params.adminId === 'new') {
    await prisma.post.create({
      data: {
        ...data,
        tilId: Number(data.tilId),
        published: published === 'on',
      },
    })
  } else {
    await prisma.post.update({
      where: {
        id: params.adminId,
      },
      data: {
        ...data,
        tilId: Number(data.tilId),
        published: published === 'on',
      },
    })
  }

  return redirect('/admin/posts')
}

export default function AdminPosts() {
  const data = useLoaderData<typeof loader>()
  const params = useParams()

  return (
    <Form method="post">
      <div className="mx-auto max-w-5xl py-10">
        <Link to="/admin/posts">← Back</Link>
        <input
          className="mt-8 mb-4 block w-full rounded-sm border bg-transparent p-2 text-2xl ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
          name="title"
          type="text"
          defaultValue={data.post.title}
        />
        <div className="grid grid-cols-2 gap-10">
          <Editor value={data.post.body} />
        </div>
        <div className="mt-4">
          <div className="space-y-2">
            <h3>Metadata</h3>
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="slug"
              placeholder="Slug"
              type="text"
              defaultValue={data.post.slug}
            />
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="longSlug"
              placeholder="Long Slug"
              type="text"
              defaultValue={data.post.longSlug}
            />
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="excerpt"
              placeholder="Excerpt"
              type="text"
              defaultValue={data.post.excerpt}
            />
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="tilId"
              placeholder="TIL ID"
              type="number"
              defaultValue={data.post.tilId}
            />
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="series"
              placeholder="Series"
              type="text"
              defaultValue={data.post.series ?? ''}
            />
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="published"
              type="checkbox"
              defaultChecked={data.post.published}
            />
          </div>
        </div>
        <footer className="mt-10 flex justify-end gap-4">
          {data.post.slug ? (
            <Link
              className="rounded-lg border border-brandBlue-500 px-4 py-2 text-white no-underline"
              to={`/admin/posts/preview/${data.post.slug}`}
            >
              Preview
            </Link>
          ) : null}
          <button
            className="rounded-lg bg-brandBlue-500 px-4 py-2 text-white"
            type="submit"
          >
            Save
          </button>
        </footer>
      </div>
    </Form>
  )
}
