export function computeDate(date: string | undefined | null, time: string | undefined | null) {
  if (!date)
    return undefined

  return `${date.split('T')[0]}T${time ?? '00:00:00'}`
}
