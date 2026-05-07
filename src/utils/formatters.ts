import i18next from 'i18next'

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-AR',
  pt: 'pt-BR',
  de: 'de-DE',
  fr: 'fr-FR',
}

function getLocale(): string {
  return LOCALE_MAP[i18next.language] ?? 'en-US'
}

export function formatPieceCount(count: number): string {
  return count.toLocaleString(getLocale())
}

export function formatProgress(found: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((found / total) * 100)}%`
}

export function formatProgressFraction(found: number, total: number): string {
  return `${found} / ${total}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(getLocale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatScanResetDate(scanResetDate: Date): string {
  const nextReset = new Date(scanResetDate)
  nextReset.setMonth(nextReset.getMonth() + 1)
  return nextReset.toLocaleDateString(getLocale(), { day: '2-digit', month: 'long' })
}

export function formatPartNum(partNum: string): string {
  return partNum.toUpperCase()
}

export function formatYear(year: number): string {
  return year.toString()
}
