import fm from 'front-matter'
import { readdir, readFile } from 'fs/promises'
import path from 'path'

export type ObsidianAttributes = {
  body: string
  excerpt: string
  tags: Array<string>
  title: string
  series?: string
}

export type OldPostAttributes = {
  modifiedDateTime: string
  createdDateTime: string
  body: string
  excerpt: string
  tags: Array<string>
  series?: string
  title: string
}

export async function* getFiles(dir: string): any {
  const dirents = await readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}

export const slugify = (filename: string) =>
  path
    .basename(filename, '.md')
    .toLowerCase()
    .replace(/ - /g, ' ')
    .replace(/\s/g, '-')
    .replace(/[*']/g, '')

const imageExtensions = ['.png', '.jpg']

export const obsidianLinkToMarkdownLink =
  (allFilenames: Array<string>) => (match: string) => {
    let title = match.replace(/[[\]]/g, '')

    if (imageExtensions.some((i) => title.includes(i))) {
      title = title.replace('!', '')
      const [filename] = title.split('.')
      return `![${filename}](/${title})`
    }

    if (title.includes('|')) {
      title = title.split('|')[1]
    }

    if (!allFilenames.includes(title)) {
      return title
    }

    return `[${title}](/posts/${title
      .toLowerCase()
      .replace(/ - /g, ' ')
      .replace(/\s/g, '-')
      .replace(/[*'"]/g, '')})`
  }

export const filteredFiles = async () => {
  const tils = []
  const files = []

  for await (const f of getFiles(
    '/Users/rdag/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes'
  )) {
    const data = await readFile(f, 'utf8')
    const { attributes } = fm<ObsidianAttributes>(data)

    if (attributes.tags?.includes('til') && attributes.title) {
      tils.push(f)
      files.push(path.basename(f, '.md'))
    }
  }

  return [tils, files]
}
