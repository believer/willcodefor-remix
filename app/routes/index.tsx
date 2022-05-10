import type { LoaderFunction} from 'remix';
import { json, useLoaderData } from 'remix'
import LatestTIL from '~/components/LatestTIL'
import Layout from '~/components/Layout'
import SelectedProjects from '~/components/SelectedProjects'
import { GitHub, Polywork, Twitter } from '~/components/SocialMedia'
import Work from '~/components/Work'
import type { LatestTilPosts } from '~/models/post.server';
import { getLatestTil } from '~/models/post.server'

type LoaderData = {
  posts: LatestTilPosts
}

export const loader: LoaderFunction = async () => {
  const posts = await getLatestTil({ take: 10 })

  return json<LoaderData>({
    posts,
  })
}

export default function Index() {
  const data = useLoaderData<LoaderData>()

  return (
    <Layout>
      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-start-3 md:col-end-13">
          <header className="text-2xl font-light">
            <h1 className="mb-5 text-4xl font-bold md:text-5xl">
              Rickard Natt och Dag
            </h1>
            Hej! I'm a developer from Sweden. I enjoy making user-friendly
            websites and creating tools that make life easier for other
            developers. I currently love working in{' '}
            <a
              href="https://rescript-lang.org/"
              rel="noopener noreferrer"
              target="_blank"
            >
              ReScript
            </a>{' '}
            and{' '}
            <a
              href="https://www.rust-lang.org/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Rust
            </a>
            .
          </header>
          <section className="mt-10 flex items-center space-x-6">
            <GitHub />
            <Twitter />
            <Polywork />
          </section>
        </div>
      </section>

      <LatestTIL posts={data.posts} />
      <Work />
      <SelectedProjects />
    </Layout>
  )
}
