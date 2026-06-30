interface CulturalHeritageAuthor {
  autore: string
  titolo: string
  sottotitolo: string
}

interface CulturalHeritageTitle {
  titolo: string
  sottotitolo1: string
  sottotitolo2: string
}

export interface CulturalHeritageItem {
  id: string
  title: CulturalHeritageAuthor | CulturalHeritageTitle | string
  description?: string
  coverImage: string
  tags: string[] | null
  link: string
  type: 'featured' | 'normal' | 'wide'
  badge?: string
  published: boolean
}

export interface CulturalHeritageTitlePlain {
  kind: 'plain'
  text: string
}

export interface CulturalHeritageTitleParts1 {
  kind: 'parts1'
  autore: string
  titolo: string
  location: string
}

export interface CulturalHeritageTitleParts2 {
  kind: 'parts2'
  titolo: string
  sottotitolo1: string
  sottotitolo2: string
}

export type CulturalHeritageTitleView = CulturalHeritageTitlePlain | CulturalHeritageTitleParts1 | CulturalHeritageTitleParts2

export function culturalHeritageTitleView(
  title: CulturalHeritageItem['title'],
): CulturalHeritageTitleView {
  if (typeof title === 'string') {
    return { kind: 'plain', text: title.trim() }
  }
  if ('autore' in title) {
    return {
      kind: 'parts1',
      autore: title.autore.trim(),
      titolo: title.titolo.trim(),
      location: title.sottotitolo.trim(),
    }
  }
  return {
    kind: 'parts2',
    titolo: title.titolo.trim(),
    sottotitolo1: title.sottotitolo1.trim(),
    sottotitolo2: title.sottotitolo2.trim(),
  }
}

function culturalHeritageTitleStringFromView(view: CulturalHeritageTitleView): string {
  switch (view.kind) {
    case 'plain':
      return view.text
    case 'parts1': {
      const { autore, titolo, location } = view
      return [autore, titolo, location]
        .filter(s => s.length > 0)
        .join(' — ')
    }
    case 'parts2': {
      const { titolo, sottotitolo1, sottotitolo2 } = view
      return [titolo, sottotitolo1, sottotitolo2]
        .filter(s => s.length > 0)
        .join(' — ')
    }
  }
}

export function culturalHeritageTitleString(
  title: CulturalHeritageItem['title'],
): string {
  return culturalHeritageTitleStringFromView(culturalHeritageTitleView(title))
}

export function getCulturalHeritageItems() {
  const config = useRuntimeConfig()
  const baseIIIFUrl = config.public.baseIIIFUrl
  const baseUrl = config.public.baseUrl
  const IIFUlrParameters = 'square/500,500/0/default.jpg'

  const culturalHeritageItems: CulturalHeritageItem[] = [
    {
      id: '1',
      title: {
        autore: 'Giuseppe Bossi',
        titolo: 'La Riconoscenza della Repubblica Italiana a Napoleone, 1801-1802',
        sottotitolo: 'Accademia di Belle arti di Brera',
      },
      description:
        'Believed to have been lost during the Second World War, the painting was rediscovered in 1995 in the Brera Academy\'s storage rooms. It was later restored, returning it to its original splendour. The piece is central to the history of Neoclassical.',
      coverImage:
        '/api/image/media/320cb76b-cfa6-467a-851d-41c77e32264a.jpg?w=500&h=500&fit=crop',
      tags: ['Outside Brera', 'Paintings on Long-Term Loan'],
      link: '/digital-object/OA_4t030-00055',
      type: 'featured',
      published: true,
    },
    {
      id: '2',
      title: {
        autore: 'Giorgio Sommer',
        titolo: 'Napoli. Museo Nazionale. Venere Callipige, 1870-1885',
        sottotitolo: 'Accademia di Belle arti di Brera',
      },
      description: 'This plate belongs to a volume of Il Bel Paese, a remarkable collection of 24 photographic albums forming a comprehensive iconographic survey of Italian landscapes, architecture and works of art.',
      coverImage:
        '/api/image/media/9f91af72-3348-4193-a431-8f11e7faf44b.jpg?w=500&h=500&fit=crop',
      tags: [
        'Shadowed Heritage',
        'Photography as an Infrastructure for Artistic Education and Research in Italy',
      ],
      link: '/digital-object/MIDFICCD_MIDF_8557354352771AI652S303AI652BP21_SC33_0602026_03_03',
      type: 'featured',
      published: true,
    },
    {
      id: '3',
      title: {
        titolo: 'Formazione Laboratorio Laboratori Scala Ansaldo, 2022-2023',
        sottotitolo1: 'photograph by Lonardo Giorgia',
        sottotitolo2: 'Accademia Teatro alla Scala',
      },
      description: 'Photo of the theatrical scenography department at Ansaldo laboratories.',
      coverImage:
        '/api/image/media/99a1ec7e-bf0b-485a-99c5-d0750b97b1c3.jpg?w=500&h=500&fit=crop',
      tags: [
        'ADA - Accademia DIGIT-ART for Culture and Education',
      ],
      link: '/digital-object/2022-2023-6169',
      type: 'featured',
      published: true,
    },
    {
      id: '4',
      title: {
        titolo: 'Andrea Appiani, after Leonardo da Vinci',
        sottotitolo1: 'Study of proportions from Leonardo’s Vitruvian Man, 1770-1775',
        sottotitolo2: 'Accademia di Belle arti di Brera',
      },
      description: 'During his years of training at the school of Antonio De Giorgi at the Ambrosiana (1770), Andrea Appiani approached the study of Leonardo and other old masters.',
      coverImage:
        `${baseUrl}/storage/media/366a7248-8de8-4f30-a49a-a01fdeef738a.jpg`,
      tags: [
        'Andrea Appiani’s Drawings. The Vallardi Album and Other Collections',
      ],
      link: '/digital-object/D_4t060-01883',
      type: 'featured',
      published: true,
    },
    {
      id: '5',
      title: {
        autore: 'Bice Lazzari',
        titolo: 'Composizione astratta colorata, 1950-1951',
        sottotitolo: 'Accademia di Belle arti di Brera',
      },
      description: 'A work encompassing the artistic exploration of Bice Lazzari, a pioneer of twentieth-century Italian abstract art.',
      coverImage:
        `${baseIIIFUrl}/iiif/2/97a0d1cf-f1fd-4f04-b10f-6269041aa23g.tif/${IIFUlrParameters}`,
      tags: [
        'Modern and Contemporary Prints and Drawings at the Brera Academy of Fine Arts',
      ],
      link: '/digital-object/D_4t060-04786',
      type: 'featured',
      published: true,
    },
    {
      id: '6',
      title: {
        autore: 'Anomymous',
        titolo: 'Carlo De Veroli with the plaster cast of Pope Rezzonico\'s bust after Antonio Canova',
        sottotitolo: 'Accademia di Belle Arti di Carrara',
      },
      description:
        'The photograph documents an academic sculpture study, most likely produced within a classroom or studio of the Academy. The young artist portrayed beside the work is Carlo De Veroli (1890–1938), a student of the institution and nephew of the sculptor Arturo Dazzi, an important figure in Italian sculpture between the late nineteenth and early twentieth centuries. At the center of the image stands a plaster bust of a well-known figure, modeled with a strong expressive characterization. The marked facial features, deeply carved eyes, and solemn pose recall the tradition of academic portrait sculpture, in which the study of physiognomy and the rendering of the sitter’s character formed a fundamental component of artistic training. De Veroli is depicted beside the sculpture, establishing an almost dialogic relationship with the work; his hand resting on the base suggests both pride and a sense of engagement with the creative process. The photograph, therefore, also carries documentary value. Beyond recording a student exercise and the level of skill achieved by the young sculptor, it conveys the atmosphere of artistic practice within Italian academies in the early twentieth century, where plaster modeling played a central role in the teaching of sculptural techniques and in the study of portraiture. As such, the image preserves the memory of a formative moment in the artist’s education and reflects the continuity between academic tradition and the personal aspirations of a young sculptor.',
      coverImage:
        `${baseIIIFUrl}/iiif/2/e43e09d3-e28b-4502-a5ad-671b856985c9.jpg/${IIFUlrParameters}`,
      tags: [
        'Shadowed Heritage',
        'Photography as an Infrastructure for Artistic Education and Research in Italy',
      ],
      link: '/digital-object/MIDFICCD_MIDF_7088549891671AI675S309',
      type: 'featured',
      published: true,
    },
    {
      id: '7',
      title: {
        autore: 'Album di Belle arti italiane, 1861 ',
        titolo: '',
        sottotitolo: 'Biblioteca dell\'Accademia di Belle Arti di Carrara',
      },
      description: '',
      coverImage: '', // immagine assente
      tags: [
        'Mapping Knowledge. The Historical Library and Archives at Carrara Academy of Fine Arts',
      ],
      link: '/digital-object/LO10145460',
      type: 'featured',
      published: false,
    },
  ]

  /*
    Placeholder items (previously after first item in array):
    {
      id: '2',
      title: 'Consectetur adipiscing elit sed do eiusmod tempor incididunt',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
      coverImage: 'https://admin.iartnet-staging.it/storage/media/a9b45fba-3170-40d0-b3ac-8b0d523fd0fa.webp',
      tags: ['PHOTOGRAPHY'],
      link: '/projects',
      type: 'normal',
    },
    {
      id: '3',
      title: 'Ut enim ad minim veniam quis nostrud exercitation ullamco',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
      coverImage: 'https://admin.iartnet-staging.it/storage/media/ce9ddb7a-9741-4ba2-92ca-e13f54be516e.webp',
      tags: ['DRAWING'],
      link: '/projects',
      type: 'normal',
    },
    {
      id: '4',
      title: 'Duis aute irure dolor',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.',
      coverImage: 'https://admin.iartnet-staging.it/storage/media/4e4d53e4-9866-47d4-a7e3-e53e11686f4e.webp',
      tags: ['SCULPTURE'],
      link: '/projects',
      type: 'normal',
    },
    {
      id: '5',
      title: 'Excepteur sint occaecat cupidatat',
      description: 'Lorem ipsum dolor sit amet.',
      coverImage: 'https://admin.iartnet-staging.it/storage/media/1234e1fb-98c3-439a-8042-70977885a601.webp',
      tags: ['SCULPTURE'],
      link: '/projects',
      type: 'normal',
    },
    {
      id: '6',
      title: 'Sed ut perspiciatis unde omnis iste natus error',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      coverImage: 'https://admin.iartnet-staging.it/storage/media/58f95ab8-87d0-487b-8691-7c95d841ac80.webp',
      tags: ['SCULPTURE'],
      link: '/projects',
      type: 'normal',
    },
    {
      id: '7',
      title: 'Nemo enim ipsam voluptatem',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
      coverImage: 'https://admin.iartnet-staging.it/storage/media/d2eb2169-4363-4d46-a098-6c0aed25ee8b.webp',
      tags: ['SCULPTURE'],
      link: '/projects',
      type: 'normal',
    },
    {
      id: '8',
      title: 'Quis autem vel eum iure reprehenderit',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.',
      coverImage: 'https://admin.iartnet-staging.it/storage/media/420f080b-698a-41da-b227-cf8db0096971.webp',
      tags: ['SCULPTURE'],
      link: '/projects',
      type: 'normal',
    },
  */

  return culturalHeritageItems
    .filter((x: CulturalHeritageItem) => x.published)
    .map(item => ({ ...item, tags: null }))
}
