import chokidar from 'chokidar'
import fm from 'front-matter'
import { readFile, stat } from 'fs/promises'
import { prisma } from '../app/db.server'
import {
  filteredFiles,
  ObsidianAttributes,
  obsidianLinkToMarkdownLink,
  slugify,
  tilPath,
} from './common'

const dateFormatter = new Intl.DateTimeFormat('sv', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const watcher = chokidar.watch(tilPath as string)

const updateFile = async (f: string) => {
  const fileData = await readFile(f, 'utf8')
  const metadata = await stat(f)
  const { attributes, body } = fm<ObsidianAttributes>(fileData)

  if (attributes.tags?.includes('til') && attributes.title) {
    console.log(`TIL update: ${dateFormatter.format(new Date())}`)

    const [, allFilenames] = await filteredFiles()
    const slug = slugify(f)

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

    console.log(`✅ ${attributes.title}\n`)
  }
}

console.log('====== Watching for changes to TILs ======')

// Add event listeners.
watcher.on('change', (path) => updateFile(path))