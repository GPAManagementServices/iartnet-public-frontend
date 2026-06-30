<template>
  <div>
    <HeaderMain
      :divider="false"
      :breadcrumb="[{ label: $t('Homepage'), icon: 'arrow-left', to: $localePath('index') }]"
      title="A Platform for Cultural Heritage and Artistic Research"
    >
      <figure>
        <!-- alt="lorem ipsum dolor sit amet" -->
        <img class="app-rounded" :src="heroImage">
      </figure>
      <section class="app-content">
        <p>
          The IartNET platform represents the digital backbone of a PNRR project devoted to enhancing international accessibility of cultural heritage and artistic research at Italian higher arts education institutions. Conceived as an open-access and interoperable environment, it integrates archives, libraries, museums, and research materials, supporting the international reach and collaborative networks of art academies and conservatories — including the fields of art, conservation, design, music, acting, and dance.
        </p>
      </section>
    </HeaderMain>

    <AppBlock divider class="app-padding content">
      <template #header>
        <h2 class="title">
          {{ $t('Numbers') }}
        </h2>
      </template>
      <OutputNumbersSection />
    </AppBlock>

    <AppBlock divider class="app-padding content">
      <template #header>
        <h2 class="title">
          System's Architecture
        </h2>
      </template>

      <section class="app-content">
        <p> At the heart of the system lies a robust database architecture designed to ensure both consistency and flexibility. A central DB master collects and normalizes essential metadata from diverse institutional sources, following standards such as Dublin Core and Europeana Data Model. Around it, a series of DB mirrors serve as intermediate repositories for importing, verifying, and harmonizing external datasets in multiple formats before their publication. This modular approach allows for controlled data enrichment, the inclusion of multimedia resources, and the preservation of authoritative links to source systems. </p>

        <ul class="grid-list">
          <GridListItem :icon="{ collection: 'app', name: 'modular' }">
            Modular
          </GridListItem>
          <GridListItem :icon="{ collection: 'app', name: 'interoperable' }">
            Interoperable
          </GridListItem>
          <GridListItem :icon="{ collection: 'app', name: 'user' }">
            Human-curated
          </GridListItem>
        </ul>
      </section>
    </AppBlock>

    <AppBlock divider class="app-padding content">
      <template #header>
        <h2 class="title">
          A complete editorial workflow
        </h2>
      </template>

      <section class="app-content">
        <p> The back-office is the operational and editorial core of the platform. Reserved for administrators and content editors, it supports the entire workflow — from data import and validation to enrichment and publication — while enabling the creation of thematic storytelling paths that connect materials across institutions. It also manages multimedia uploads, multilingual content, and user communications within a structured, secure environment. </p>

        <ul class="grid-list">
          <GridListItem :icon="{ collection: 'app', name: 'search' }">
            Data validation
          </GridListItem>
          <GridListItem :icon="{ collection: 'app', name: 'document' }">
            Content enrichment
          </GridListItem>
          <GridListItem :icon="{ collection: 'app', name: 'shield' }">
            Secure environment
          </GridListItem>
        </ul>
      </section>
    </AppBlock>

    <AppBlock divider class="app-padding content">
      <template #header>
        <h2 class="title">
          An engaging experience
        </h2>
      </template>

      <section class="app-content">
        <p> The front-end is the public interface of IartNET, designed to offer an engaging, accessible, and multilingual experience. Visitors can explore collections through advanced search tools, thematic filters, and narrative itineraries enriched with images, videos, and documents. Partner institutions are presented through dedicated sections that highlight their contributions and research activities across art, conservation, design, music, acting, and dance. Built with open-source technologies and compliant with international accessibility standards, the portal ensures long-term sustainability, scalability, and visibility for the participating institutions and their cultural assets. </p>

        <ul class="grid-list">
          <GridListItem :icon="{ collection: 'app', name: 'accessibility' }">
            Accessible
          </GridListItem>
          <GridListItem :icon="{ collection: 'app', name: 'code' }">
            Open-source
          </GridListItem>
          <GridListItem :icon="{ collection: 'app', name: 'globe' }">
            Multilingual
          </GridListItem>
        </ul>
      </section>
    </AppBlock>
  </div>
</template>

<script setup lang="ts">
const TRAILING_SLASH_RE = /\/$/

const config = useRuntimeConfig()
const heroImage = computed(() => {
  const base = String(config.public.baseUrl || '').replace(TRAILING_SLASH_RE, '')
  return `${base}/storage/media/nuovo-deposito-gessi.webp`
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
  margin-block: 96px;

  p,
  li {
    max-width: 60ch;
    margin-left: auto;
    font-size: var(--text);
  }

  p + p {
    margin-top: 1em;
  }

  &:not(.numbers-section) li {
    border-top: 1px solid #aaa;
    padding-top: 0.5em;
    padding-bottom: 1em;
  }
}

.grid-list {
  font-size: var(--text);
  display: flex;
  justify-content: flex-end;
  gap: var(--app-gap);
  max-width: 60ch;
  margin-left: auto;
  margin-top: 48px;

  & > * {
    flex: 1;
  }
}
</style>
