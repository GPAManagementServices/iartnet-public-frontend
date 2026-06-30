<template>
  <div>
    <HeaderMain :breadcrumb="[{ label: $t('Homepage'), icon: 'arrow-left', to: $localePath('index') }]" title="Bringing together historical collections and contemporary research">
      <figure>
        <!-- alt="lorem ipsum dolor sit amet" -->
        <img class="app-rounded" :src="heroImage">
      </figure>
      <section class="app-content">
        <p>
          IartNET is an international infrastructure that combines an institutional network with a shared digital environment to support artistic research and cultural heritage across Italian higher arts and music education institutions (AFAM). It links collections, data, and researchers through interoperable systems, fostering international collaboration, alignment with European standards, and the development of advanced postgraduate pathways.
        </p>
      </section>
    </HeaderMain>

    <AppBlock divider class="app-padding content">
      <template #header>
        <h2 class="title">
          Vision & Mission
        </h2>
      </template>
      <section class="app-content">
        <p> <strong>Vision.</strong> IartNET imagines a transnational knowledge space in which Italy’s artistic research and cultural heritage—past and present—circulate openly, connect across disciplines, and contribute to global dialogues on art, culture, and education. </p>
        <p> <strong>Mission.</strong> IartNET builds and maintains the digital and institutional frameworks needed to enable innovation, cultivate communities of practice, and support sustainable, long-term research and education within and beyond the AFAM system.</p>
      </section>
    </AppBlock>

    <AppBlock divider class="app-padding content">
      <template #header>
        <h2 class="title">
          IartNET’s Core Aims
        </h2>
      </template>

      <ul class="grid-list">
        <GridListItem :icon="{ collection: 'app', name: 'eye' }">
          <strong> Enhance digital access</strong>
          <p> by providing open, international visibility to artistic research materials and heritage collections that have long remained difficult to consult.</p>
        </GridListItem>
        <GridListItem :icon="{ collection: 'app', name: 'book' }">
          <strong> Situate AFAM within the long history of Italian artistic practice,</strong>
          <p>foregrounding both continuity and change across disciplines.</p>
        </GridListItem>
        <GridListItem :icon="{ collection: 'app', name: 'share' }">
          <strong> Promote cross-disciplinary exchange</strong>
          <p>between heritage and contemporary creation, fostering shared knowledge, creativity, and future-oriented research. </p>
        </GridListItem>
        <GridListItem :icon="{ collection: 'app', name: 'globe' }">
          <strong> Strengthen international cooperation </strong>
          <p> through a network of Italian and foreign institutions committed to data sharing, EU-aligned standards, and joint internationalization strategies. </p>
        </GridListItem>
        <GridListItem :icon="{ collection: 'app', name: 'institution' }">
          <strong> Develop advanced research pathways</strong>
          <p> by building an international hub that connects supervisors, researchers, and experts, and supports innovative third-cycle and postgraduate programs aligned with the Bologna Process. </p>
        </GridListItem>
      </ul>
    </AppBlock>

    <AppBlock divider class="app-padding content">
      <template #header>
        <h2 class="title">
          Deliverables
        </h2>
      </template>

      <ul class="app-content">
        <li>
          <strong>An international network of higher arts and music education institutions</strong> committed to data sharing, to developing joint projects on cultural heritage and artistic research, and to creating joint postgraduate programs that span preservation, conservation, digitization, and heritage valorization, as well as contemporary artistic and curatorial practices, design, music, and the performing arts.
        </li>
        <li>
          <strong>An interoperable database and a web portal with an English-language interface</strong> that collect, preserve, and provide open-access content on cultural heritage and on current educational, artistic, and research projects at Italian higher arts education institutions.
        </li>
        <li>
          <strong>An international hub for artistic research</strong> offering a much-needed space for the establishment of a research community dedicated to developing cross-disciplinary and inter-institutional artistic research projects, as well as cross-sectoral PhD programs focused on innovation and the creative industries.
        </li>
      </ul>
    </AppBlock>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const heroImage = computed(() => {
  const base = String(config.public.baseUrl || '').replace(/\/$/, '')
  return `${base}/storage/media/scuola-artefici.webp`
})
</script>

<style lang="postcss" scoped>
header {
  figure,
  section {
    margin-block: 64px 8px;
    @supports not (margin-block: 0) {
      margin-top: 64px;
      margin-bottom: 8px;
    }
  }

  figure {
    display: flex;
    flex-direction: column;
    gap: 7px;
    max-width: max(320px, 60vw);
    margin-inline: auto;
    @supports not (margin-inline: 0) {
      margin-left: auto;
      margin-right: auto;
    }

    img {
      max-width: 100%;
      object-fit: contain;
    }

    figcaption {
      font-size: var(--ui-text-small);
    }
  }
}

.ui-block {
  margin-bottom: var(--app-margin);
}

.app-content {
  p,
  li {
    max-width: 60ch;
    margin-left: auto;
    font-size: var(--text);
  }

  p + p {
    margin-top: 1em;
  }

  li {
    border-top: 1px solid #aaa;
    padding-top: 0.5em;
    padding-bottom: 1em;
  }
}

.grid-list {
  --min: 384px;
  display: grid;
  grid-gap: var(--app-gap);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));

  & > * {
    strong {
      display: block;
      font-size: var(--text);
      font-weight: var(--medium);
      line-height: 1.1;
      margin-bottom: 8px;
    }

    p {
      margin-block: 0;
      font-size: var(--text-small);
      line-height: 1.2;
    }
  }
}
</style>
