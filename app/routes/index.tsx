import { Post } from "@prisma/client";
import { json, Link, LoaderFunction, useLoaderData } from "remix";
import Layout from "~/components/Layout";
import { GitHub, Polywork, Twitter } from "~/components/SocialMedia";
import { getPosts } from "~/models/post.server";
import { formatDate, formatDateTime, toISO } from "~/utils/date";

type Experience = {
  name: string;
  start: string;
  end: string;
  position: string;
  description: string;
  link?: string;
  linkDescription?: string;
};

type Project = {
  name: string;
  description: string;
  tech: Array<string>;
  link: string;
};

type LoaderData = {
  experience: Array<Experience>;
  postCounter: number;
  posts: Array<Post>;
  projects: Array<Project>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPosts();

  const experience = [
    {
      name: "Arizon",
      start: "2022",
      end: "&nbsp;&nbsp;",
      position: "Frontend Developer Consultant",
      description: "<p>Arizon is a IT consultancy and startup incubator.</p>",
    },
    {
      name: "Hemnet",
      start: "2020",
      end: "22",
      position: "Frontend Developer",
      description:
        "<p>With 2.8 miljon unique vistors each week, Hemnet is Sweden's biggest website when you're looking to buy or sell your appartment or house.</p><p>I was part of the Seller's Experience team. This team handles the \"behind the scenes\" of a sale. Everything from the broker adding your listing, you purchasing additional packages for better exposure of your listing to a dashboard where you can follow statistics on the sale.</p> ",
    },
    {
      name: "Iteam",
      start: "2012",
      end: "20",
      position: "Developer / Head of Tech",
      description:
        "<p>Iteam is a development consultancy working mostly in-house.</p><p>My work focused on front-end, but also backend (Node) whenever there's a need. We use React and React Native with TypeScript, but recently we've also started using ReasonML. We write all code using TDD and Jest. API integrations are made using GraphQL, with some REST.</p> ",
      link: "/iteam",
      linkDescription:
        "Here's a list of all the projects I've a been a part of at Iteam",
    },
    {
      name: "MatHem",
      start: "2011",
      end: "12",
      position: "Interaction designer",
      description:
        "<p>MatHem delivers groceries directly to your door, either as a prepackaged concept with recipes or as individual products of your choosing. MatHem has been selected as one of the best Swedish online stores two years running by Internetworld.</p><p>My job was mostly front-end development. I made mockups in Photoshop and then implemented the HTML, CSS and some jQuery on the website. I also made flash banners for advertising campaigns.</p> ",
    },
  ];

  const projects = [
    {
      name: "Supreme",
      description:
        "Supreme is a command line tool that helps you get up and running fast with new apps. It can currently generate rescript-react apps with Tailwind CSS, GraphQL APIs with examples for queries, mutations and subscriptions using TypeScript and React apps with both TypeScript and JavaScript. It can also help you install and generate commonly used configs for things like prettier, husky and jest. ",
      tech: ["rust", "github actions"],
      link: "https://github.com/opendevtools/supreme",
    },
    {
      name: "rescript-intl",
      description:
        "re-intl helps you with date, number and currency formatting in ReasonML (BuckleScript). Everything is built on top of Intl which comes built-in with browsers >= IE11 as well as Node.",
      tech: ["rescript", "github actions"],
      link: "https://github.com/opendevtools/rescript-intl",
    },
    {
      name: "Clearingnummer",
      description:
        "Sort codes, clearingnummer in Swedish, are four or five digit identifiers for Swedish banks. This package helps you find the bank related to a specific number. ",
      tech: ["typescript", "github actions"],
      link: "https://github.com/believer/clearingnummer",
    },
    {
      name: "Telefonnummer",
      description:
        "Telefonnummer is phone number in Swedish. This package formats all Swedish phone numbers, both mobile and landline, to a standard format. ",
      tech: ["typescript", "github actions"],
      link: "https://github.com/believer/telefonnummer",
    },
    {
      name: "WCAG Color",
      tech: ["rescript", "github actions"],
      link: "https://github.com/opendevtools/wcag-color",
      description:
        '<p>According to the WHO an <a href="https://www.who.int/en/news-room/fact-sheets/detail/blindness-and-visual-impairment">estimated 1.3 billion</a> people live with some form of visual impairment. This includes people who are legally blind and people with less than 20/20 vision.</p>  <p>This library helps you achieve the accessibility standards for color contrast outlined in the WCAG 2.0 specification.</p> ',
    },
    {
      name: "Wejay",
      description:
        "A Slack bot that controls a Sonos system. We use it at Iteam as a collaborative music player. It can do pretty much everything from managing the play queue, control playback, list most played songs and even contains some hidden easter eggs. ",
      tech: ["reasonml", "docker", "elasticsearch", "github actions", "slack"],
      link: "https://github.com/Iteam1337/sonos-wejay",
    },
    {
      name: "Workout of the Day",
      description:
        "<p>A collection of competition and benchmark CrossFit workouts but also workouts that I've made. A combination of two of my passions code and CrossFit.</p><p>I've also made a version of the app in <a href=\"https://github.com/believer/wod-elm\">Elm</a>.</p> ",
      tech: ["rescript", "vercel", "github actions"],
      link: "https://github.com/believer/wod",
    },
  ];

  return json<LoaderData>({
    experience,
    posts: posts.slice(0, 10),
    postCounter: posts.length + 1,
    projects,
  });
};

export default function Index() {
  const data = useLoaderData<LoaderData>();

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
            developers. I currently love working in{" "}
            <a
              href="https://rescript-lang.org/"
              rel="noopener noreferrer"
              target="_blank"
            >
              ReScript
            </a>{" "}
            and{" "}
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
      <section className="mt-10 grid gap-6 md:grid-cols-12">
        <header className="col-span-12 text-gray-600 dark:text-gray-400 md:col-span-2 md:text-right">
          Latest TIL
        </header>

        <div className="col-span-12 md:col-span-10">
          <p className="mt-0">
            Here are interesting things I found while browsing the web. It's
            ideas and thoughts, new findings, and reminders regarding software
            development. I see it as a second brain for all things related to
            development and a way for me to practice{" "}
            <a href="/posts/learning-in-public">Learning in public</a>.
          </p>

          <p>
            This is heavily inspired by Lee Byron's{" "}
            <a
              href="https://leebyron.com/til"
              target="_blank"
              rel="noopener noreferrer"
            >
              TIL
            </a>{" "}
            and builds on top of my initial attempt with my{" "}
            <a href="https://devlog.willcodefor.beer">Devlog</a>.
          </p>

          <ul
            className="mt-8 space-y-3"
            style={{
              counterReset: `section ${data.postCounter}`,
            }}
          >
            {data.posts.map((post) => (
              <li
                className="grid-post counter-decrement relative grid items-baseline gap-4 sm:gap-5"
                key={post.id}
              >
                <h2 className="m-0 text-base font-medium text-gray-800 dark:text-gray-400">
                  <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                </h2>
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
          </ul>

          <div className="mt-4 flex justify-end">
            <Link to="feed" reloadDocument>
              Feed
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-12">
        <header className="col-span-12 text-gray-600 dark:text-gray-400 md:col-span-2 md:text-right">
          Work
        </header>
        <div className="col-span-12 space-y-2 md:col-span-10">
          {data.experience.map((w) => (
            <details key={w.name}>
              <summary className="group mb-2 flex cursor-pointer items-center space-x-4 text-gray-800 dark:text-gray-400">
                <span className="flex-none font-medium group-hover:text-brandBlue-600 group-hover:underline dark:group-hover:text-brandBlue-300">
                  {w.name}
                </span>
                <span className="w-full flex-shrink border-t border-dashed border-gray-300 dark:border-gray-500"></span>
                <span className="flex-none text-gray-600 dark:text-gray-400">
                  {w.position}
                </span>
                <span className="flex-none font-mono text-sm text-gray-500">
                  {w.start}-<span dangerouslySetInnerHTML={{ __html: w.end }} />
                </span>
              </summary>
              <div className="mb-8 text-sm">
                <span dangerouslySetInnerHTML={{ __html: w.description }} />
                {w.link && (
                  <Link className="inline-block" to={w.link} prefetch="intent">
                    {w.linkDescription}
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
        <header className="col-span-12 text-gray-600 dark:text-gray-400 md:col-span-2 md:text-right">
          Selected projects
        </header>
        <div className="col-span-12 space-y-2 md:col-span-10">
          {data.projects.map((p) => (
            <details key={p.name}>
              <summary className="group mb-2 flex cursor-pointer items-center space-x-4 text-gray-800 dark:text-gray-400">
                <span className="flex-none font-medium group-hover:text-brandBlue-600 group-hover:underline dark:group-hover:text-brandBlue-300">
                  {p.name}
                </span>
                <span className="w-full flex-shrink border-t border-dashed border-gray-300 dark:border-gray-500"></span>
              </summary>
              <div className="mb-8 text-sm">
                <div className="flex items-center">
                  <div className="mr-5 flex-1">
                    <div className="mb-2 flex space-x-2">
                      {p.tech.map((tech) => (
                        <div
                          className="text-xs text-gray-600 dark:text-gray-400"
                          key={tech}
                        >
                          {tech}
                        </div>
                      ))}
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: p.description }} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap">
                  <a
                    className="underline"
                    href={p.link}
                    aria-label={`Source code for ${p.name} on GitHub`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Link
                  </a>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </Layout>
  );
}
