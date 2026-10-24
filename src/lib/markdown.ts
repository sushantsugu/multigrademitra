export function normalizeMarkdownEscapedNewlines(markdown: string): string {
  return markdown
    .replace(/\\r?\\n(?:[ \t]*\\n)+/g, '\n\n')
    .replace(/\\n(?=[ \t]*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|\$\$|[A-Z]))/g, '\n');
}
