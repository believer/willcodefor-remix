import { LoaderFunction, redirect } from 'remix'

export const loader: LoaderFunction = async ({ params }) => {
  const tagSlug = encodeURIComponent(`topic/${params.topicSlug}`)
  return redirect(`/tags/${tagSlug}`)
}
