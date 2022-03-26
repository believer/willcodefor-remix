import type { LinksFunction, MetaFunction } from 'remix'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'remix'
import tailwindStylesheetUrl from './styles/tailwind.css'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => {
  const description =
    'I am a developer from Sweden. I enjoy making user-friendly websites and creating tools that make life easier for other developers.'
  const title = 'Rickard Natt och Dag'
  const image = 'https://willcodefor.beer/ogimage.png'
  const url = 'https://willcodefor.beer/'

  return {
    description,
    title,
    author: title,
    charset: 'utf-8',
    viewport: 'width=device-width,initial-scale=1',
    keywords: 'blog,today i learned',
    'og:title': title,
    'og:type': 'article',
    'og:url': url,
    'og:description': description,
    'og:image': image,
    'twitter:image': image,
    'twitter:card': 'summary',
    'twitter:creator': '@rnattochdag',
    'twitter:site': '@rnattochdag',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:url': url,
  }
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
        <script
          async
          data-token="MWFWWD5X1WEC"
          data-respect-dnt
          data-no-cookie
          src="https://cdn.splitbee.io/sb.js"
        ></script>
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
