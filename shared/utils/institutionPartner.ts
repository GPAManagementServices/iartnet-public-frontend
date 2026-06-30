/**
 * Allineato a `server/api/institutions/index.get.ts`: lead + project partner (non associate-member).
 */
export const PROJECT_PARTNER_CATEGORY_SLUGS = new Set([
  'lead-institution',
  'istituzione-principale',
  'project-partner',
  'partner-di-progetto',
])

const DIACRITICS_STRIP = /\p{M}/gu

function normInstText(s: string | undefined): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_STRIP, '')
}

export function institutionHasProjectPartnerCategory(inst: {
  categories?: { slug: string }[] | undefined
}): boolean {
  return (inst.categories ?? []).some(c => PROJECT_PARTNER_CATEGORY_SLUGS.has(c.slug))
}

/**
 * Istituzioni senza categoria partner non hanno blocco nella pagina People.
 * Se l’API non espone `categories`, si escludono comunque casi noti non-partner (CMS / dati incompleti).
 */
function isExplicitNonPartnerInstitution(inst: {
  name?: string
  slug?: string
  slug_en?: string
  slug_it?: string
}): boolean {
  const blob = normInstText(inst.name)
    + normInstText(inst.slug)
    + normInstText(inst.slug_en)
    + normInstText(inst.slug_it)
  if (blob.includes('operameet') || (blob.includes('opera') && blob.includes('meet') && blob.includes('agency')))
    return true
  if (
    blob.includes('musikhochschulen')
    && (blob.includes('conservatoire') || blob.includes('conservatori') || blob.includes('europe'))
  ) {
    return true
  }
  if (
    blob.includes('aec')
    && (blob.includes('conservatoire') || blob.includes('conservatori') || blob.includes('musikhochschulen'))
  ) {
    return true
  }
  return false
}

export function isInstitutionShownOnPeoplePage(inst: {
  categories?: { slug: string }[] | undefined
  name?: string
  slug?: string
  slug_en?: string
  slug_it?: string
}): boolean {
  const cats = inst.categories
  if (cats && cats.length > 0) {
    return institutionHasProjectPartnerCategory(inst)
  }
  return !isExplicitNonPartnerInstitution(inst)
}
