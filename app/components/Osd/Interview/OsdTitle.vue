<template>
  <div class="osdTitle">
    <div class="title">
      {{ props.data.titolo }}
    </div>
    <div class="author">
      {{ props.data.titolo2 }}
    </div>    
  </div>
</template>

<script setup lang="ts">
import type { INTERVIEW_TitleDataTarget } from '~/utils/TitleData'

interface OsdTitleProps {
  data: INTERVIEW_TitleDataTarget
}
const props = defineProps<OsdTitleProps>()
</script>

<style lang="postcss" scoped>
.osdTitle {
  width: 100%;
  /*max-width: 40vw;*/
  opacity: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  .title {
    font-weight: 700;
    font-style: normal;
    font-size: 48px;
    line-height: 100%;
    letter-spacing: 0%;
  }

  .author {
    font-weight: 600;
    font-style: normal;
    font-size: 32px;
    line-height: 140%;
    letter-spacing: 0%;
    color: var(--gray-6);
  }
}

@media (max-width: 768px) {
  .osdTitle {
    max-width: 100%;
    padding: 0 1rem;
  }
}
</style>
