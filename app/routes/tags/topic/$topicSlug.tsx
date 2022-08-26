import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({ params }) => {
  const tagSlug = encodeURIComponent(`topic/${params.topicSlug}`)
  return redirect(`/tags/${tagSlug}`)
}
