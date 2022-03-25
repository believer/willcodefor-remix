import { Link, LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";
import { getPosts } from "~/models/post.server";
import { formatDate, formatDateTime, toISO } from "~/utils/date";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPosts();
  return json<LoaderData>({ posts });
};

export default function PostsIndexPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div className="mx-auto max-w-2xl">
      <h2>Today I Learned</h2>

      <ol
        reversed
        className="space-y-2 sm:space-y-4"
        style={{ counterReset: `section ${data.posts.length + 1}` }}
      >
        {data.posts.map((post) => (
          <li
            className="grid-post counter-decrement relative grid items-baseline gap-4 sm:gap-5"
            key={post.id}
          >
            <Link to={`/posts/${post.slug}`} prefetch="intent">
              {post.title}
            </Link>
            <hr className="m-0 hidden border-dashed border-gray-300 sm:block" />
            <time
              className="font-mono text-xs tabular-nums text-gray-500"
              dateTime={toISO(post.createdAt)}
            >
              <span className="hidden sm:block">
                {formatDateTime(post.createdAt)}
              </span>
              <span className="block sm:hidden">
                {formatDate(post.createdAt)}
              </span>
            </time>
          </li>
        ))}
      </ol>
    </div>
  );
}
