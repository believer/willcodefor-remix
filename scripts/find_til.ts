import fm from 'front-matter'
import { readFile, stat, writeFile } from 'fs/promises'
import { prisma } from '../app/db.server'
import {
  filteredFiles,
  getFiles,
  ObsidianAttributes,
  obsidianLinkToMarkdownLink,
  OldPostAttributes,
  slugify,
} from './common'

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}

async function run() {
  const lastUpdate = await readFile('.til', 'utf8')
  const timeUpdated = Date.parse(lastUpdate.replace(/\n/, ''))

  // Import blog posts from Obsidian
  const [tils, allFilenames] = await filteredFiles()

  console.log('============== Upload Obsidian files ==============\n')
  console.log(`Found ${tils.length} files\n`)

  for (const f of tils) {
    const fileData = await readFile(f, 'utf8')
    const metadata = await stat(f)
    const { attributes, body } = fm<ObsidianAttributes>(fileData)

    const slug = slugify(f)

    // Skip if not modified
    if (metadata.mtimeMs < timeUpdated) {
      console.log(`⎘ ${attributes.title}`)
      continue
    }

    const parsedBody = body.replace(
      /!?\[\[([a-zåäö0-9\s-_'.,|]+)\]\]/gi,
      obsidianLinkToMarkdownLink(allFilenames)
    )

    const data = {
      slug,
      title: attributes.title,
      excerpt: attributes.excerpt,
      body: parsedBody,
      createdAt: metadata.birthtime,
      updatedAt: metadata.mtime,
      series: attributes.series,
      tilId: getRandomInt(10000),
    }

    await prisma.post.upsert({
      where: {
        slug: slug,
      },
      update: data,
      create: data,
    })

    console.log(`✅ ${attributes.title}`)
  }

  // Import old blog posts
  console.log('\n============== Upload old blog posts ==============\n')

  for await (const f of getFiles('./data')) {
    const data = await readFile(f, 'utf8')
    const metadata = await stat(f)
    const { attributes, body } = fm<OldPostAttributes>(data)

    if (attributes.tags?.includes('til') && attributes.title) {
      const slug = slugify(f)

      // Skip if not modified
      if (metadata.mtimeMs < timeUpdated) {
        console.log(`⎘ ${attributes.title}`)
        continue
      }

      const currentPost = await prisma.post.findUnique({ where: { slug } })

      const data = currentPost
        ? {
            ...currentPost,
            body,
            slug,
            title: attributes.title,
            excerpt: attributes.excerpt ?? '',
            updatedAt: metadata.mtime,
          }
        : {
            body,
            slug,
            title: attributes.title,
            excerpt: attributes.excerpt ?? '',
            createdAt: new Date(attributes.createdDateTime),
            updatedAt: metadata.mtime,
            series: attributes.series,
            tilId: getRandomInt(10000),
          }

      await prisma.post.upsert({
        where: {
          slug: slug,
        },
        update: data,
        create: data,
      })

      console.log(`✅ ${attributes.title}`)
    }
  }

  // Update TIL IDs to sequence
  prisma.$queryRaw`UPDATE public."Post" SET "tilId" = col_serial FROM
(SELECT id, row_number() OVER (ORDER BY "createdAt") as col_serial FROM public."Post" ORDER BY "createdAt") AS p WHERE public."Post".id = p.id;`

  console.log('\nIDs updated')

  await writeFile('.til', new Date().toISOString())
}

run()
