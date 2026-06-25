import { Marked } from 'marked'

const marked = new Marked({ gfm: true })

export function renderMarkdown(source) {
  return marked.parse(source.trim())
}

export function renderInline(source) {
  return marked.parseInline(source.trim())
}
