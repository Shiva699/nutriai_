export function sanitizeAIText(text: string) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/^[-*_]{3,}$/gm, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
