import type { LoaderFunction } from 'remix'
import { getPosts } from '~/models/post.server'
import { toISO } from '~/utils/intl'
import { md } from '~/utils/markdown'

export const loader: LoaderFunction = async () => {
  const posts = await getPosts()
  const metadata = {
    title: 'willcodefor.beer',
    url: 'https://willcodefor.beer/',
    description: 'Things I learn while browsing the web',
    author: {
      name: 'Rickard Natt och Dag',
      email: 'rickard@willcodefor.dev',
    },
  }

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${metadata.title}</title>
    <subtitle>${metadata.description}</subtitle>
    <link href="${metadata.url}/feed.xml" rel="self"/>
    <link href="${metadata.url}"/>
    <updated>${toISO(posts.slice(-1)[0].updatedAt)}</updated>
    <id>${metadata.url}</id>
    <author>
        <name>${metadata.author.name}</name>
        <email>${metadata.author.email}</email>
    </author>
    ${posts
      .map(
        (post) =>
          `<entry>
      <title>${post.title}</title>
      <link href="${metadata.url}posts/${post.slug}"/>
      <updated>${toISO(post.updatedAt)}</updated>
      <id>${metadata.url}posts/${post.slug}</id>
      <content type="html">${md.render(post.body)}</content>
    </entry>`
      )
      .join('')}
</feed>`

  return new Response(feed, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
