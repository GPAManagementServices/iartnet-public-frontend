<template>
  <time v-bind="dataset" :datetime="isoDate" :title>{{ formattedDate }}</time>
</template>

<script setup lang="ts">
export interface NuxtTimeProps {
  locale?: string
  datetimestart: string | number | Date
  datetimeend?: string | number | Date
  localeMatcher?: 'best fit' | 'lookup'
  weekday?: 'long' | 'short' | 'narrow'
  era?: 'long' | 'short' | 'narrow'
  year?: 'numeric' | '2-digit'
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
  day?: 'numeric' | '2-digit'
  hour?: 'numeric' | '2-digit'
  minute?: 'numeric' | '2-digit'
  second?: 'numeric' | '2-digit'
  timeZoneName?: 'short' | 'long' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric'
  formatMatcher?: 'best fit' | 'basic'
  hour12?: boolean
  timeZone?: string

  calendar?: string
  dayPeriod?: 'narrow' | 'short' | 'long'
  numberingSystem?: string

  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24'

  title?: boolean | string
}

const props = withDefaults(defineProps<NuxtTimeProps>(), {
  hour12: undefined,
})

const el = getCurrentInstance()?.vnode.el
const _locale = el?.getAttribute('data-locale')

const nuxtApp = useNuxtApp()

const toDate = (datetime: string | number | Date | undefined, options: { type: 'start' | 'end' }) => {
  const renderedDate = el?.getAttribute(`datetime-${options.type}`)
  if (renderedDate && nuxtApp.isHydrating) {
    return new Date(renderedDate)
  }
  if (!datetime) {
    return new Date()
  }
  return new Date(datetime)
}
const dateStart = computed(() => toDate(props.datetimestart, { type: 'start' }))
const dateEnd = computed(() => props.datetimeend ? toDate(props.datetimeend, { type: 'end' }) : null)

const formatter = computed(() => {
  const { locale: propsLocale, ...rest } = props
  return new Intl.DateTimeFormat(_locale ?? propsLocale, rest)
})

const formattedDate = computed(() => dateEnd.value
  ? (formatter.value as Intl.DateTimeFormat).formatRange(dateStart.value, dateEnd.value)
  : (formatter.value as Intl.DateTimeFormat).format(dateStart.value))

const isoDate = computed(() => {
  const s = dateStart.value.toISOString()
  return dateEnd.value ? `${s}/${dateEnd.value.toISOString()}` : s
})
const title = computed(() => props.title === true ? isoDate.value : typeof props.title === 'string' ? props.title : undefined)
const dataset: Record<string, string | number | boolean | Date | undefined> = {}

if (import.meta.server) {
  for (const prop in props) {
    if (prop !== 'datetime') {
      const value = props?.[prop as keyof typeof props]
      if (value) {
        const propInKebabCase = prop.split(/(?=[A-Z])/).join('-')
        dataset[`data-${propInKebabCase}`] = props?.[prop as keyof typeof props]
      }
    }
  }
  onPrehydrate((el) => {
    const toCamelCase = (name: string, index: number) => {
      if (index > 0) {
        return name[0]!.toUpperCase() + name.slice(1)
      }
      return name
    }

    const [startIso, endIso] = el.getAttribute('datetime')!.split('/', 2) as [string, string | undefined]
    const dateStart = new Date(startIso)
    const dateEnd = endIso ? new Date(endIso) : undefined
    const options: Intl.DateTimeFormatOptions & Intl.RelativeTimeFormatOptions & { locale?: Intl.LocalesArgument, relative?: boolean } = {}
    for (const name of el.getAttributeNames()) {
      if (name.startsWith('data-')) {
        const optionName = name.slice(5).split('-').map(toCamelCase).join('') as keyof (Intl.DateTimeFormatOptions & Intl.RelativeTimeFormatOptions)
        options[optionName] = el.getAttribute(name) as any
      }
    }

    const formatter = new Intl.DateTimeFormat(options.locale, options)
    el.textContent = dateEnd ? formatter.formatRange(dateStart, dateEnd) : formatter.format(dateStart)
  })
}

declare global {
  interface Window {
    _nuxtTimeNow?: number
  }
}
</script>
