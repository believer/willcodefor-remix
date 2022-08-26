import type { LinksFunction, MetaFunction } from "@remix-run/node";

import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react";

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
      </head>
      <body className="h-full bg-white transition duration-500 dark:bg-gray-900 dark:text-gray-200">
        <Outlet />
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
      <body className="flex items-center justify-center h-screen bg-white transition duration-500 dark:bg-gray-900 dark:text-gray-200">
        <main className="max-w-lg">
          <h1>Dangit, it looks like something went wrong!</h1>
          <p>
            Try going <Link to="/">back to the start page</Link>. If you want to
            be super helpful, send me the error and URL on Twitter{' '}
            <a
              href="https://twitter.com/rnattochdag"
              target="_blank"
              rel="noreferrer noopener"
            >
              @rnattochdag
            </a>
            . Thanks! 🙌🏻
          </p>
          <p className="text-xs text-gray-500">
            <code className="px-2 py-1 bg-gray-200 rounded dark:bg-gray-800">
              {caught.status} {caught.statusText}
            </code>
          </p>
        </main>
        <Scripts />
      </body>
    </html>
  )
}
