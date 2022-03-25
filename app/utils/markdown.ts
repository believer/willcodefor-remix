import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItLinkAttributes from 'markdown-it-link-attributes'
import markdownItHighlight from 'markdown-it-highlightjs'

export const md = markdownIt({
  html: true,
  xhtmlOut: true,
  breaks: true,
  linkify: true,
})
  .use(markdownItHighlight)
  .use(markdownItAnchor, {
    level: [1, 2, 3, 4],
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      class: 'text-gray-300',
      symbol: '#',
    }),
  })
  .use(markdownItLinkAttributes, {
    matcher(href: string) {
      return href.startsWith('https:')
    },
    attrs: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  })
