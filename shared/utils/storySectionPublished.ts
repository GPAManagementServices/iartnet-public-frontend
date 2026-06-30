/** Sezione/item story visibile: solo `published === false` lo nasconde. */
export function isStorySectionVisible(item: { published?: boolean }): boolean {
  return item.published !== false
}
