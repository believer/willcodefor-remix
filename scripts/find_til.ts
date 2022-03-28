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

async function run() {
  const lastUpdate = await readFile('.til', 'utf8')
  const timeUpdated = Date.parse(lastUpdate.replace(/\n/, ''))

  const postId = []

  // Import blog posts from Obsidian
  const [tils, allFilenames] = await filteredFiles()

  console.log('============== Upload Obsidian files ==============\n')
  console.log(`Found ${tils.length} files\n`)

  for (const f of tils) {
    const fileData = await readFile(f, 'utf8')
    const metadata = await stat(f)
    const { attributes, body } = fm<ObsidianAttributes>(fileData)

    const slug = slugify(f)

    postId.push({ created: metadata.birthtimeMs, slug })

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
      tilId: 0,
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
    const { attributes, body } = fm<OldPostAttributes>(data)

    if (attributes.tags?.includes('til') && attributes.title) {
      const slug = slugify(f)

      postId.push({
        created: new Date(attributes.createdDateTime).getTime(),
        slug,
      })

      // Skip if not modified
      if (new Date(attributes.modifiedDateTime).getTime() < timeUpdated) {
        console.log(`⎘ ${attributes.title}`)
        continue
      }

      const data = {
        body,
        slug,
        title: attributes.title,
        excerpt: attributes.excerpt ?? '',
        createdAt: new Date(attributes.createdDateTime),
        updatedAt: new Date(attributes.modifiedDateTime),
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

      console.log(`✅ ${attributes.title}`)
    }
  }

  postId.sort((a, b) => a.created - b.created)

  // Adding TIL IDs
  for (const [i, { slug }] of postId.entries()) {
    const hasPost = await prisma.post.findUnique({ where: { tilId: i + 1 } })

    if (!hasPost) {
      await prisma.post.update({
        where: { slug },
        data: {
          tilId: i + 1,
        },
      })
    }
  }

  console.log('\nIDs updated')

  await writeFile('.til', new Date().toISOString())
}

run()
