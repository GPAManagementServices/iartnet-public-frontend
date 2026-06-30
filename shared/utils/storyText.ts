/** HTML story: trim, `null` se assente o vuoto. */
export function storyHtmlContent(text: string | null | undefined): string | null {
  if (text == null)
    return null

  const trimmed = text.trim()
  return trimmed || null
}

const STORY_CAPTION_MEDIA_PATTERN = /<(?:figure|picture|video|table|iframe|svg)\b[\s\S]*?<\/(?:figure|picture|video|table|iframe|svg)>|<img\b[^>]*>/gi
const STORY_CAPTION_HEADING_PATTERN = /<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/i
const STORY_CAPTION_TEXT_BLOCK_PATTERN = /<(?:p|li|blockquote|div)\b[^>]*>[\s\S]*?<\/(?:p|li|blockquote|div)>/gi
const STORY_CAPTION_MEDIA_SELECTOR = 'img, figure, picture, video, table, iframe, svg'
const STORY_CAPTION_BLOCK_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, blockquote, div'

/** Solo per verificare presenza di testo; non usare per generare output HTML. */
function storyCaptionHasText(html: string): boolean {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length > 0
}

function storyCaptionStripMedia(html: string): string {
  return html.replace(STORY_CAPTION_MEDIA_PATTERN, '')
}

function storyCaptionRemoveMedia(root: ParentNode): void {
  root.querySelectorAll(STORY_CAPTION_MEDIA_SELECTOR).forEach(el => el.remove())
}

/** In anteprima compatta: più <br> consecutivi (anche con whitespace tra loro) → uno solo. */
function storyCaptionCollapseConsecutiveBreaksInDom(root: ParentNode): void {
  for (const br of [...root.querySelectorAll('br')]) {
    let prev = br.previousSibling
    while (prev?.nodeType === Node.TEXT_NODE && !(prev.textContent ?? '').trim())
      prev = prev.previousSibling
    if (prev?.nodeName === 'BR')
      br.remove()
  }
}

const STORY_CAPTION_CONSECUTIVE_BR_PATTERN = /(<br\s*\/?>)(?:\s*<br\s*\/?>)+/gi

function storyCaptionCollapseConsecutiveBreaks(html: string): string {
  return html.replace(STORY_CAPTION_CONSECUTIVE_BR_PATTERN, '$1')
}

function storyCaptionIsTextBlock(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  if (!['p', 'li', 'blockquote', 'div'].includes(tag))
    return false
  if (tag === 'div' && element.querySelector('p, li, blockquote, h1, h2, h3, h4, h5, h6'))
    return false
  return storyCaptionHasText(element.innerHTML)
}

function storyCaptionFirstTextBlockAfter(html: string, startIndex = 0): string | null {
  STORY_CAPTION_TEXT_BLOCK_PATTERN.lastIndex = startIndex
  let match = STORY_CAPTION_TEXT_BLOCK_PATTERN.exec(html)
  while (match) {
    const block = match[0]
    if (storyCaptionHasText(block))
      return block
    match = STORY_CAPTION_TEXT_BLOCK_PATTERN.exec(html)
  }
  return null
}

function storyCaptionCompactPreviewWithDom(source: string): string | null {
  const doc = new DOMParser().parseFromString(`<div data-story-caption-root>${source}</div>`, 'text/html')
  const root = doc.querySelector('[data-story-caption-root]')
  if (!root)
    return null

  storyCaptionRemoveMedia(root)
  storyCaptionCollapseConsecutiveBreaksInDom(root)

  const blocks = [...root.querySelectorAll(STORY_CAPTION_BLOCK_SELECTOR)]
  const heading = blocks.find(el => /^H[1-6]$/.test(el.tagName))
  if (heading) {
    const parts = [heading.outerHTML]
    const headingIndex = blocks.indexOf(heading)
    for (let index = headingIndex + 1; index < blocks.length; index += 1) {
      const element = blocks[index]!
      if (heading.contains(element))
        continue
      if (/^H[1-6]$/.test(element.tagName))
        break
      if (!storyCaptionIsTextBlock(element))
        continue
      parts.push(element.outerHTML)
      break
    }
    return parts.join('')
  }

  const html = root.innerHTML.trim()
  return storyCaptionHasText(html) ? html : null
}

function storyCaptionCompactPreviewWithRegex(source: string): string | null {
  const cleaned = storyCaptionStripMedia(source)
  const headingMatch = cleaned.match(STORY_CAPTION_HEADING_PATTERN)
  if (headingMatch?.index != null) {
    const parts = [headingMatch[0]]
    const searchStart = headingMatch.index + headingMatch[0].length
    const firstTextBlock = storyCaptionFirstTextBlockAfter(cleaned, searchStart)
    if (firstTextBlock)
      parts.push(firstTextBlock)
    return storyCaptionCollapseConsecutiveBreaks(parts.join(''))
  }

  const trimmed = cleaned.trim()
  if (!storyCaptionHasText(trimmed))
    return null
  return storyCaptionCollapseConsecutiveBreaks(trimmed)
}

/**
 * Anteprima compatta mobile: titolo + primo blocco testuale se presente un heading,
 * altrimenti il contenuto testuale iniziale (max 2 righe via CSS). Salta immagini e media.
 * Mantiene formattazione inline e <br>; normalizza <br> consecutivi in uno solo.
 */
export function storyCaptionCompactPreview(html: string | null | undefined): string | null {
  const source = storyHtmlContent(html)
  if (!source)
    return null

  if (typeof DOMParser !== 'undefined') {
    try {
      return storyCaptionCompactPreviewWithDom(source)
    }
    catch {
      return storyCaptionCompactPreviewWithRegex(source)
    }
  }

  return storyCaptionCompactPreviewWithRegex(source)
}

export function storyCaptionCompactPreviewHasTitle(html: string | null | undefined): boolean {
  return html != null && /<h[1-6]\b/i.test(html)
}

/** Plain text per attributi accessibilità (alt/title): strip tag HTML. */
export function storyPlainText(text: string | null | undefined): string | null {
  const html = storyHtmlContent(text)
  if (!html)
    return null

  const plain = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return plain || null
}
