import chokidar from 'chokidar'
import fm from 'front-matter'
import { readFile, stat } from 'fs/promises'
import { prisma } from '../app/db.server'
import type {
  ObsidianAttributes} from './common';
import {
  filteredFiles,
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

  // Only update TILs that are considered done. Otherwise it would
  // update on posts that are in progress.
  if (
    attributes.tags?.includes('til') &&
    attributes.tags?.includes('status/done') &&
    attributes.title
  ) {
    console.log(`TIL update: ${dateFormatter.format(new Date())}`)

    const [, allFilenames] = await filteredFiles()
    const slug = slugify(f)

    const parsedBody = body.replace(
      /!?\[\[([a-zåäö0-9\s-_'.,|]+)\]\]/gi,
      obsidianLinkToMarkdownLink(allFilenames)
    )

    const currentPost = await prisma.post.findUnique({ where: { slug } })

    const data = {
      ...currentPost,
      body: parsedBody,
      slug,
      title: attributes.title,
      excerpt: attributes.excerpt ?? '',
      updatedAt: metadata.mtime,
    }

    await prisma.post.update({
      where: {
        slug: slug,
      },
      data,
    })

    console.log(`✅ ${attributes.title}\n`)
  }
}

console.log('====== Watching for changes to TILs ======')

// Add event listeners.
watcher.on('change', (path) => updateFile(path))
