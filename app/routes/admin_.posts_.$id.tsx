import type { ActionArgs, LinksFunction, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react'
import { prisma } from '~/db.server'
import { requireUser } from '~/utils/session.server'
import tokyoNight from 'highlight.js/styles/tokyo-night-dark.css'
import { Editor } from '~/components/Editor'
import React from 'react'
import type { Post } from '@prisma/client'
import { formatDateTime } from '~/utils/intl'
import debounce from 'lodash.debounce'
import { slugify } from '~/utils/markdown'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tokyoNight }]
}

export let loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request)

  const latestPost = await prisma.post.findFirst({
    select: { tilId: true },
    orderBy: { createdAt: 'desc' },
    where: { published: true },
  })

  if (!latestPost) {
    throw new Error('No posts found')
  }

  if (params.id === 'new') {
    return json({
      post: {
        body: '',
        createdAt: new Date(),
        excerpt: '',
        id: 'new',
        language: 'en',
        longSlug: '',
        published: false,
        series: '',
        slug: '',
        tilId: latestPost.tilId + 1,
        title: '',
        updatedAt: new Date(),
      } as Post,
    })
  }

  const post = await prisma.post.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!post) {
    throw new Response('Not Found', { status: 404 })
  }

  return json({
    post: {
      ...post,
      tilId: post.published ? post.tilId : latestPost.tilId + 1,
    },
  })
}

export const action = async ({ params, request }: ActionArgs) => {
  const formData = await request.formData()
  const data: any = Object.fromEntries(formData.entries())
  const published = formData.get('published')
  const isPublished = published === 'on'

  if (params.id === 'new') {
    const post = await prisma.post.create({
      data: {
        ...data,
        series: data.series || null,
        tilId: isPublished ? Number(data.tilId) : 0,
        published: isPublished,
      },
    })

    return redirect(`/admin/posts/${post.id}`)
  } else {
    await prisma.post.update({
      where: {
        id: params.id,
      },
      data: {
        ...data,
        series: data.series || null,
        tilId: isPublished ? Number(data.tilId) : 0,
        published: isPublished,
      },
    })
  }

  return null
}

export default function AdminPosts() {
  const data = useLoaderData<typeof loader>()
  const submit = useSubmit()

  const handleChange = (formElement: HTMLFormElement | null) => {
    if (formElement?.checkValidity() && data.post.id !== 'new') {
      submit(formElement, { method: 'put' })
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChange = React.useCallback(
    debounce((event: any) => {
      handleChange(event.target.closest('form'))
    }, 1000),
    []
  )

  React.useEffect(() => {
    return () => {
      debouncedChange.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Form method="post" onChange={debouncedChange}>
      <div className="mx-auto max-w-5xl py-10">
        <div className="flex items-center justify-between">
          <Link to=".." relative="path">
            ← Back
          </Link>
          {data.post.id !== 'new' ? (
            <span className="text-gray-500 dark:text-gray-600">
              Last updated: {formatDateTime(data.post.updatedAt)}
            </span>
          ) : null}
        </div>
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
              required
              defaultValue={data.post.slug}
            />
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="longSlug"
              placeholder="Long Slug"
              type="text"
              required
              defaultValue={slugify(data.post.title)}
            />
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="excerpt"
              placeholder="Excerpt"
              type="text"
              required
              defaultValue={data.post.excerpt}
            />
            <input
              className="block w-full rounded-sm border bg-transparent p-2 ring-blue-700 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
              name="tilId"
              readOnly
              placeholder="TIL ID"
              type="number"
              required
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
