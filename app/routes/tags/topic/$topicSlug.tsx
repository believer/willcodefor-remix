import type { LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

export const loader = async ({ params }: LoaderArgs) => {
  const tagSlug = encodeURIComponent(`topic/${params.topicSlug}`)
  return redirect(`/tags/${tagSlug}`)
}
