/**
 * Plaine & Easie come oggetto JSON per Verovio
 * (@see https://book.verovio.org/toolkit-reference/input-formats.html#plaine-and-easie)
 */
export interface PaeIncipit {
  clef: string
  keysig?: string
  timesig?: string
  data: string
}

export function hasPaeIncipitData(pae: Pick<PaeIncipit, 'data'>): boolean {
  const { data } = pae
  return data !== '' && data != null && data !== 'no_data'
}
