/**
 * Helper per l'estrazione sicura di campi da record ICCD.
 * Usato da AboutTheWorkData, TitleData, MetadatiData e MetaData.
 */
export function existsField(record: Record<string, unknown> | null | undefined, field: string): boolean {
  return record != null && Object.hasOwn(record, field)
}

export function fieldIsArray(record: Record<string, unknown>, field: string): boolean {
  return Array.isArray(record[field])
}

export function cleanData(data: string): string {
  return data.replace('|', ' ')
}
