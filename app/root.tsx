import type { LinksFunction, MetaFunction } from '@remix-run/node'

import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLocation,
} from '@remix-run/react'
import Layout from '~/components/Layout'
import { ExternalLink } from '~/components/Link'

import tailwindStylesheetUrl from './styles/style.css'

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
  const location = useLocation()
  const noHeader = ['habits', 'stats']

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white transition duration-500 dark:bg-tokyoNight-bg dark:text-gray-200">
        <Layout noHeader={noHeader.includes(location.pathname.split('/')[1])}>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="flex h-screen items-center justify-center bg-white transition duration-500 dark:bg-tokyoNight-bg dark:text-gray-200">
        <main className="max-w-lg">
          <h1>Dangit, it looks like something went wrong!</h1>
          <p>
            Try going <Link to="/">back to the start page</Link>. If you want to
            be super helpful, send me the error and URL on Twitter{' '}
            <ExternalLink href="https://twitter.com/rnattochdag">
              @rnattochdag
            </ExternalLink>
            . Thanks! 🙌🏻
          </p>
          <p className="text-xs text-gray-500">
            <code className="rounded bg-gray-200 px-2 py-1 dark:bg-gray-800">
              {caught.status} {caught.statusText}
            </code>
          </p>
        </main>
        <Scripts />
      </body>
    </html>
  )
}
