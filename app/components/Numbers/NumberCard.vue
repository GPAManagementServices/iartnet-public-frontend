<template>
  <article class="number-card" :aria-label="ariaLabel">
    <div class="number-card__header">
      <p class="number-card__label">
        {{ label }}
      </p>
      <p v-if="description" class="number-card__description">
        {{ description }}
      </p>
    </div>
    <p class="number-card__value">
      {{ formattedValue }}
    </p>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number | string
  description?: string
}>()

const formattedValue = computed(() => {
  if (typeof props.value === 'string')
    return props.value

  return new Intl.NumberFormat().format(props.value)
})

const ariaLabel = computed(() => {
  const base = `${props.label}: ${formattedValue.value}`
  return props.description ? `${base}. ${props.description}` : base
})
</script>

<style lang="postcss" scoped>
.number-card {
  --number-card-padding: 10px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: var(--number-card-padding);
  background-color: var(--ui-neutral-background);
  border: 1px solid var(--ui-neutral-border);
  border-radius: 10px;

  @media (max-width: 767px) {
    min-height: 200px;
  }

  @media (min-width: 768px) {
    --number-card-padding: 12px;
    aspect-ratio: 3 / 2;
  }
}

.number-card__header {
  position: absolute;
  top: var(--number-card-padding);
  left: var(--number-card-padding);
  max-width: calc(100% - 2 * var(--number-card-padding));
}

.number-card__label {
  margin: 0;
  font-size: var(--text-small);
  font-weight: var(--bold);
  line-height: 1.3;
  color: var(--gray-12);
}

.number-card__description {
  margin: 4px 0 0;
  font-size: var(--text-mini);
  font-weight: var(--regular);
  line-height: 1.3;
  color: var(--gray-8);
}

.number-card__value {
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: var(--regular);
  line-height: 1;
  color: var(--gray-12);
  text-align: center;
}
</style>
