import fm from 'front-matter'
import { readFile, stat, writeFile } from 'fs/promises'
import { prisma } from '../app/db.server'
import type { ObsidianAttributes, OldPostAttributes } from './common'
import {
  filteredFiles,
  getFiles,
  obsidianLinkToMarkdownLink,
  slugify,
} from './common'

async function run() {
  const lastUpdate = await readFile('.til', 'utf8')
  const timeUpdated = Date.parse(lastUpdate.replace(/\n/, ''))

  // Import blog posts from Obsidian
  const [tils, allFilenames] = await filteredFiles()

  console.log('============== Upload Obsidian files ==============\n')
  console.log(`Found ${tils.length} files\n`)

  let skipped = 0
  let updated = []

  for (const f of tils) {
    const fileData = await readFile(f, 'utf8')
    const metadata = await stat(f)
    const { attributes, body } = fm<ObsidianAttributes>(fileData)

    const longSlug = slugify(f)
    const slug = attributes.slug ? slugify(attributes.slug) : longSlug

    // Skip if not modified
    if (metadata.mtimeMs < timeUpdated) {
      skipped += 1
      continue
    }

    const parsedBody = body.replace(
      /!?\[\[([a-zåäö0-9\s-_'.,|]+)\]\]/gi,
      obsidianLinkToMarkdownLink(allFilenames)
    )

    const data = {
      slug,
      longSlug,
      title: attributes.title,
      excerpt: attributes.excerpt,
      body: parsedBody,
      createdAt: metadata.birthtime,
      updatedAt: metadata.mtime,
      series: attributes.series,
      tilId: 0,
      post_tags: {
        create: attributes.tags.map((tag) => ({
          tag: {
            connectOrCreate: { create: { name: tag }, where: { name: tag } },
          },
        })),
      },
    }

    await prisma.post.upsert({
      where: {
        longSlug,
      },
      update: data,
      create: data,
    })

    updated.push(`✅ ${attributes.title}`)
  }

  if (updated.length > 0) {
    console.log(updated.join('\n'))
  }

  console.log(`\nSkipped ${skipped} files`)

  skipped = 0
  updated = []

  // Import old blog posts
  console.log('\n============== Upload old blog posts ==============\n')

  for await (const f of getFiles('./data')) {
    const data = await readFile(f, 'utf8')
    const metadata = await stat(f)
    const { attributes, body } = fm<OldPostAttributes>(data)

    if (attributes.tags?.includes('til') && attributes.title) {
      const longSlug = slugify(f)
      const slug = attributes.slug ? slugify(attributes.slug) : longSlug

      // Skip if not modified
      if (metadata.mtimeMs < timeUpdated) {
        skipped += 1
        continue
      }

      const currentPost = await prisma.post.findUnique({ where: { slug } })

      const data = currentPost
        ? {
            ...currentPost,
            body,
            slug,
            longSlug,
            title: attributes.title,
            excerpt: attributes.excerpt ?? '',
            updatedAt: metadata.mtime,
          }
        : {
            body,
            slug,
            longSlug,
            title: attributes.title,
            excerpt: attributes.excerpt ?? '',
            createdAt: new Date(attributes.createdDateTime),
            updatedAt: metadata.mtime,
            series: attributes.series,
            tilId: 0,
          }

      await prisma.post.upsert({
        where: {
          slug: slug,
        },
        update: data,
        create: data,
      })

      updated.push(`✅ ${attributes.title}`)
    }
  }

  if (updated.length > 0) {
    console.log(updated.join('\n'))
  }
  console.log(`Skipped ${skipped} files`)

  // Update TIL IDs to sequence
  await prisma.$queryRaw`UPDATE public."Post" SET "tilId" = col_serial FROM
  (SELECT id, row_number() OVER (ORDER BY "createdAt") as col_serial FROM public."Post" ORDER BY "createdAt") AS p WHERE public."Post".id = p.id;`

  console.log('\nIDs updated')

  await writeFile('.til', new Date().toISOString())
}

run()
