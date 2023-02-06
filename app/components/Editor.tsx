import React from 'react'
import { md } from '~/utils/markdown'

type EditorProps = {
  value: string
}

export const Editor = ({ value }: EditorProps) => {
  const bodyRef = React.useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = React.useState<string>(value)
  const [selection, setSelection] = React.useState<number>()

  React.useEffect(() => {
    if (bodyRef.current && selection) {
      bodyRef.current.focus()
      bodyRef.current.setSelectionRange(selection, selection)
    }
  }, [selection])

  const handleFormatting = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Return immediately if the user isn't pressing the cmd key
    if (!e.metaKey) {
      return
    }

    // Find the start and end of the current selection
    const { selectionStart, selectionEnd } = e.currentTarget
    const selection = e.currentTarget.value.substring(
      selectionStart,
      selectionEnd
    )

    let nextValue = null
    let nextPosition = selectionStart

    // Add bold formatting on cmd + b
    if (e.key === 'b') {
      nextValue = `**${selection}**`
      nextPosition = selectionStart + 2
    }

    // Add italic formatting on cmd + i
    if (e.key === 'i') {
      nextValue = `_${selection}_`
      nextPosition = selectionStart + 1
    }

    if (!nextValue) {
      return
    }

    // Update text and selection
    const before = e.currentTarget.value.substring(0, selectionStart)
    const after = e.currentTarget.value.substring(selectionEnd)

    setContent(`${before}${nextValue}${after}`)
    setSelection(nextPosition)
  }

  return (
    <>
      <textarea
        className="rounded-sm border bg-transparent p-4 ring-blue-700 ring-offset-4 focus:outline-none focus:ring-2 dark:border-gray-800 dark:ring-offset-gray-900"
        name="body"
        ref={bodyRef}
        onKeyDown={handleFormatting}
        onChange={(e) => setContent(e.target.value)}
        value={content}
      />
      <div
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: md.render(content) }}
      />
    </>
  )
}
