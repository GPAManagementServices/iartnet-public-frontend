<template>
  <header class="header-homepage">
    <div class="header-logos">
      <img src="/images/eu-funded-logo.png" alt="Funded by EU - Logo" style="height: calc(30px * var(--factor, 1));">
      <img src="/images/mur-logo.png" alt="Ministero Università e Ricerca - Logo" style="height: calc(25px * var(--factor, 1));">
      <img src="/images/italiadomani-logo.png" alt="Italiadomani - Logo" style="height: calc(32px * var(--factor, 1));">
      <h1 class="title" v-html="title" />
    </div>
    <CablesCanvas @clicked="handleHeroClick" />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

async function handleHeroClick(href: string) {
  if (!href.startsWith('/digital-object/'))
    return
  await navigateTo(href)
}
</script>

<style lang="postcss" scoped>
.header-homepage {
  position: relative;
  width: 100%;
  background-color: var(--gray-1);
  height: 100vh;
  height: 100dvh;

  .header-logos {
    position: absolute;
    inset-inline: 0;
    @supports not (inset-inline: 0) {
      left: 0;
      right: 0;
    }
    bottom: 0;
    display: flex;
    gap: var(--app-gap);
    align-items: center;
    justify-content: flex-start;
    padding: 24px var(--app-padding);
    mix-blend-mode: multiply;
    z-index: 10;

    @media (min-width: 768px) {
      --factor: 1.2;
    }
  }

  canvas {
    position: absolute;
    inset: 0;
    @supports not (inset: 0) {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    width: 100% !important;
    height: calc(100% - 65px) !important;
    z-index: 10;
  }

  /* div {
    display: flex;
    align-items: flex-end;
    min-height: 90vh;
    padding: 28px 40px;
    position: relative;

    h1 {
      text-align: center;
      max-width: 65ch;
      margin-inline: auto;
      @supports not (margin-inline: 0) {
        margin-left: auto;
        margin-right: auto;
      }
    }
  } */
}
</style>
