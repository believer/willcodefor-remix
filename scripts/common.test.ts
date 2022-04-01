import { obsidianLinkToMarkdownLink, slugify } from './common'
import { beforeEach, afterEach, vi, describe, expect, test } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('#obsidianLinkToMarkdownLink', () => {
  test('returns title if link is not a file, i.e. not a page', () => {
    expect(obsidianLinkToMarkdownLink([])('[[Link]]')).toEqual('Link')
  })

  test('returns link to page', () => {
    expect(obsidianLinkToMarkdownLink(['Link'])('[[Link]]')).toEqual(
      '[Link](/posts/link)'
    )
  })

  test('fixes the url', () => {
    expect(
      obsidianLinkToMarkdownLink(["Test's - are nice*"])(
        "[[Test's - are nice*]]"
      )
    ).toEqual("[Test's - are nice*](/posts/tests-are-nice)")
  })

  test('handles links with quotation marks', () => {
    expect(
      obsidianLinkToMarkdownLink(['Test "Parkinsons" law'])(
        '[[Test "Parkinsons" law]]'
      )
    ).toEqual('[Test "Parkinsons" law](/posts/test-parkinsons-law)')
  })

  test('handles links without page', () => {
    expect(
      obsidianLinkToMarkdownLink([])("[[Parkinsons lag|Parkinson's law]]")
    ).toEqual("Parkinson's law")
  })

  test('handles aliased links with page', () => {
    expect(
      obsidianLinkToMarkdownLink(["Parkinson's law"])(
        "[[Parkinsons lag|Parkinson's law]]"
      )
    ).toEqual("[Parkinson's law](/posts/parkinsons-law)")
  })

  test('handles images', () => {
    expect(obsidianLinkToMarkdownLink([])('![[image.png]]')).toEqual(
      '![image](/image.png)'
    )
  })
})

describe('#slugify', () => {
  test('remove file extension', () => {
    expect(slugify('filename.md')).toEqual('filename')
  })

  test('lowercase the slug', () => {
    expect(slugify('FiLeNAmE.md')).toEqual('filename')
  })

  test('replace spaced hyphens with hyphen', () => {
    expect(slugify('file - name.md')).toEqual('file-name')
  })

  test('replace spaces with hyphen', () => {
    expect(slugify('file name.md')).toEqual('file-name')
  })

  test('replace certain chars with empty string', () => {
    expect(slugify("file's na*me.md")).toEqual('files-name')
  })

  test('removes characters inside parentheses', () => {
    expect(
      slugify(
        'Difference between nullish coalescing (??) and logical or (||).md'
      )
    ).toEqual('difference-between-nullish-coalescing-and-logical-or')
  })
})
