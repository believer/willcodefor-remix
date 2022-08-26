import { getPosts } from '~/models/post.server'
import { toISO } from '~/utils/intl'

export const loader = async () => {
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

  const sitemap = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${posts
      .map(
        (post) =>
          `<url>
      <loc>${metadata.url}${post.slug}</loc>
      <lastmod>${toISO(post.updatedAt)}</lastmod>
    </url>`
      )
      .join('')}
</urlset>`

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
