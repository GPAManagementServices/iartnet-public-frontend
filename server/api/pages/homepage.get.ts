import type { CulturalHeritageItem } from '../../utils/culturalHeritages'
import { getHomepageHighlightItems } from '../../utils/homepageHighlights'

const TRAILING_SLASH_RE = /\/$/

const internationalizationItems = [
  {
    id: '1',
    title: 'Magna Aliqua',
    description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.',
    coverImage: 'https://placehold.co/300x400/e8e8e8/e8e8e8',
    tags: ['ERASMUS+'],
    link: '/projects',
    type: 'normal',
  },
  {
    id: '2',
    title: 'Tempor Incididunt',
    description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    coverImage: 'https://placehold.co/300x280/e8e8e8/e8e8e8',
    tags: ['MOBILITY'],
    link: '/projects',
    type: 'normal',
  },
  {
    id: '3',
    title: 'Veniam Quis',
    description: 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.',
    coverImage: 'https://placehold.co/300x350/e8e8e8/e8e8e8',
    tags: ['PARTNERSHIP'],
    link: '/projects',
    type: 'normal',
  },
  {
    id: '4',
    title: 'Dolorem Ipsum',
    description: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam.',
    coverImage: 'https://placehold.co/300x320/e8e8e8/e8e8e8',
    tags: ['EXCHANGE'],
    link: '/projects',
    type: 'normal',
  },
  {
    id: '5',
    title: 'Adipisci Velit',
    description: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet consectetur.',
    coverImage: 'https://placehold.co/300x380/e8e8e8/e8e8e8',
    tags: ['NETWORK'],
    link: '/projects',
    type: 'normal',
  },
  {
    id: '6',
    title: 'Labore Dolore',
    description: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.',
    coverImage: 'https://placehold.co/300x300/e8e8e8/e8e8e8',
    tags: ['FELLOWSHIP'],
    link: '/projects',
    type: 'normal',
  },
  {
    id: '7',
    title: 'Excepturi Sint',
    description: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit.',
    coverImage: 'https://placehold.co/300x360/e8e8e8/e8e8e8',
    tags: ['GRANT'],
    link: '/projects',
    type: 'normal',
  },
  {
    id: '8',
    title: 'Autem Velum',
    description: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.',
    coverImage: 'https://placehold.co/300x340/e8e8e8/e8e8e8',
    tags: ['RESIDENCY'],
    link: '/projects',
    type: 'normal',
  },
]
const narrativeTemplates = [
  {
    id: 1,
    title: 'Lorem ipsum dolor sit amet Gioachino Rossini narrative Francesco Hayez',
    description: 'Lorem ipsum dolor sit amet',
    coverPath: '/storage/media/6b955a23-fc05-4ee0-b5ee-59b5504accaa.webp',
    alt: 'Lorem ipsum dolor',
    tags: ['PAINTING', 'OPERA'],
    link: '/narratives',
  },
  {
    id: 2,
    title: 'Portraits: Marcello Maloberti',
    description: 'Lorem ipsum dolor sit amet',
    coverPath: '/storage/media/58f95ab8-87d0-487b-8691-7c95d841ac80.webp',
    alt: 'Lorem ipsum dolor',
    tags: ['INTERVIEW', 'CONTEMPORARY'],
    link: '/narratives',
  },
  {
    id: 3,
    title: 'Lorem ipsum dolor sit amet graphic design and screenprinting',
    description: 'Lorem ipsum dolor sit amet',
    coverPath: '/storage/media/32bf7877-d342-49a4-96f2-bf3e74a2aad8.webp',
    alt: 'Lorem ipsum dolor',
    tags: ['PUBLICATION', 'ARTIST BOOK'],
    link: '/narratives',
  },
] as const

export default defineEventHandler(async (event) => {
  const { locale } = getQuery(event)
  if (locale !== 'en' && locale !== 'it')
    throw createError({ status: 500, statusText: 'Unspecified locale' })

  const config = useRuntimeConfig(event)
  const base = String(config.public.baseUrl || '').replace(TRAILING_SLASH_RE, '')
  const narratives = narrativeTemplates.map(({ coverPath, ...rest }) => ({
    ...rest,
    coverImage: `${base}${coverPath}`,
  }))
  let culturalHeritageItems: CulturalHeritageItem[] = []

  try {
    culturalHeritageItems = await getHomepageHighlightItems(event, locale)
  }
  catch (error) {
    console.error('[HomepageHighlightsRead] Unexpected error:', error)
  }

  try {
    // const { data: artisticResearch } = await $fetch('/api/projects', { query: { locale } })
    // TODO Wait for API re-implementation
    const { data: artisticResearch } = await $fetch('/api/projects/homepage', { query: { locale } })
    const { data: activities } = await $fetch('/api/activities', { query: { locale } })
    const catalogue = await $fetch('/api/research-catalogue', { query: { locale } })

    return {
      artisticResearch,
      culturalHeritageItems,
      internationalizationItems,
      narratives,
      activities,
      catalogue,
    }
  }
  catch (error) {
    console.error('[HomepageRead] Unexpected error:', error)
    throw createError({
      status: 500,
      statusText: 'A server error occurred when attempting to read the homepage data. Please try again later',
    })
  }
})
