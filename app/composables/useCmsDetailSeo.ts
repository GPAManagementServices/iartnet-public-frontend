import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface CmsDetailSeoSource {
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string | null
}

function trimField(value: string | null | undefined): string {
  return (value ?? '').trim()
}

export function useCmsDetailSeo(source: MaybeRefOrGetter<CmsDetailSeoSource | null | undefined>) {
  const resolved = computed(() => {
    const item = toValue(source)
    if (!item)
      return null

    const title = trimField(item.meta_title)
    const description = trimField(item.meta_description)
    const keywords = trimField(item.keywords)
    return { title, description, keywords }
  })

  useSeoMeta({
    title: () => resolved.value?.title,
    description: () => resolved.value?.description,
    ogTitle: () => resolved.value?.title,
    ogDescription: () => resolved.value?.description,
    keywords: () => resolved.value?.keywords,
  })
}
