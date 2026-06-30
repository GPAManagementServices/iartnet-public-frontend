<template>
  <template v-if="!isAdditionalFieldEmpty">
    <div class="field" :class="{ stacked: props.useStacked }">
      <span
        v-if="!props.doNotShowLabel"
        class="label"
        :class="{ 'label--campoAggiuntivo': props.campoAggiuntivo }"
      >
        <span v-if="props.campoAggiuntivo" class="label__badge" aria-hidden="true">
          <img :src="campoAggiuntivoIcon" alt="" class="label__badgeIcon">
        </span>
        <span class="label__text">{{ props.label }}</span>
      </span>
      <div class="valueCol" :class="{ 'valueCol--full': props.doNotShowLabel }">
        <div ref="wrapperEl" class="valueWrapper">
          <div
            ref="valueEl"
            class="value"
            :class="{ clamped: showClamped }"
          >
            <a
              v-if="props.valueAsExternalLink && externalLinkHref"
              class="value__link"
              :href="externalLinkHref"
              target="_blank"
              rel="noopener noreferrer"
            >{{ props.value.trim() }}</a>
            <span v-else v-html="sanitizeHtml(props.value)" />
          </div>
        </div>
        <button
          v-if="props.useSeeMore && hasOverflow"
          type="button"
          class="toggleBtn"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? $t('OSD-ReadLess') : $t('OSD-ReadMore') }}
        </button>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import campoAggiuntivoIcon from '@/assets/icons/osd-campo-aggiuntivo.svg'
import { GetDataUtils } from '@/utils/GetDataUtils'

const props = withDefaults(defineProps<OsdMetaFieldProps>(), {
  campoAggiuntivo: false,
  useSeeMore: false,
  useStacked: false,
  doNotShowLabel: false,
  doNotShowIfEmpty: true,
  valueAsExternalLink: false,
})
const NEWLINE_TO_BR_REGEX = /\n/g
export interface OsdMetaFieldProps {
  label: string
  value: string
  campoAggiuntivo?: boolean
  useSeeMore?: boolean
  useStacked?: boolean
  doNotShowLabel?: boolean
  doNotShowIfEmpty?: boolean
  /** Rende il valore un link esterno cliccabile (target _blank). */
  valueAsExternalLink?: boolean
}

function toExternalHref(raw: string): string {
  const v = raw.trim()
  if (!v)
    return ''
  if (/^http?:\/\//i.test(v))
    return v
  return `http://${v}`
}

const externalLinkHref = computed(() => {
  if (!props.valueAsExternalLink)
    return ''
  const v = props.value?.trim()
  if (!v || v.toUpperCase() === GetDataUtils.NO_DATA.toUpperCase())
    return ''
  return toExternalHref(v)
})

const isAdditionalFieldEmpty = computed(
  () =>
    props.doNotShowIfEmpty
    && (!props.value?.trim() || props.value.toUpperCase() === GetDataUtils.NO_DATA.toUpperCase()),
)

const valueEl = ref<HTMLElement | null>(null)
const wrapperEl = ref<HTMLElement | null>(null)
const hasOverflow = ref(false)
const isExpanded = ref(false)

const showClamped = computed(
  () => props.useSeeMore && hasOverflow.value && !isExpanded.value,
)

function checkOverflow() {
  if (!props.useSeeMore || !valueEl.value || !wrapperEl.value) {
    hasOverflow.value = false
    return
  }
  if (isExpanded.value)
    return
  const el = valueEl.value
  const wrapper = wrapperEl.value
  if (wrapper.offsetWidth <= 0) {
    hasOverflow.value = false
    return
  }
  const cs = getComputedStyle(el)
  const clone = document.createElement('div')
  clone.textContent = props.value
  clone.style.cssText = `
    position:absolute;visibility:hidden;top:0;left:0;
    width:${wrapper.offsetWidth}px;
    font-family:${cs.fontFamily};
    font-size:${cs.fontSize};
    line-height:${cs.lineHeight};
    font-weight:${cs.fontWeight};
    letter-spacing:${cs.letterSpacing};
    word-break:break-word;
  `
  wrapper.appendChild(clone)
  const fullH = clone.offsetHeight
  clone.style.display = '-webkit-box'
  clone.style.setProperty('-webkit-box-orient', 'vertical')
  clone.style.setProperty('-webkit-line-clamp', '3')
  clone.style.overflow = 'hidden'
  const clampedH = clone.offsetHeight
  clone.remove()
  hasOverflow.value = fullH > clampedH + 2
}

let ro: ResizeObserver | null = null

onMounted(() => {
  const run = () =>
    nextTick(() =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => checkOverflow()),
      ),
    )
  run()
  ro = new ResizeObserver(() => run())
  if (wrapperEl.value)
    ro.observe(wrapperEl.value)
})

onUnmounted(() => ro?.disconnect())

watch(
  () => [props.value, props.useSeeMore],
  () => {
    isExpanded.value = false
    nextTick(() => checkOverflow())
  },
)

function sanitizeHtml(html: string) {
  return html.replaceAll(NEWLINE_TO_BR_REGEX, '<br />')
}
</script>

<style lang="postcss" scoped>
.field {
  /* usato per centrare l’etichetta sulla mid-line della *prima riga* del .value (desktop a riga) */
  --osd-meta-value-fs: 24px;
  --osd-meta-value-line-height: 1.4;
  --osd-meta-value-first-line-box: calc(var(--osd-meta-value-fs) * var(--osd-meta-value-line-height));

  display: flex;
  width: 100%;
  min-height: 58px;
  gap: 12px;
  padding: 8px 12px 16px 12px;
  border-top: 1px solid rgba(208, 208, 208, 1);
  align-items: flex-start;
  flex-wrap: wrap;

  .label {
    --osd-meta-label-block-h: calc(12px * 1.25);

    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
    width: 270px;
    min-width: 0;
    flex: 0 0 270px;

    .label__text {
      flex: 1;
      min-width: 0;
      font-weight: 500;
      font-size: 12px;
      line-height: 1.25;
      letter-spacing: 0%;
      text-transform: uppercase;
      color: #8d8d8d;
      word-break: break-word;
    }

    &.label--campoAggiuntivo {
      --osd-campo-aggiuntivo-chip-height: 20px;
      --osd-meta-label-block-h: var(--osd-campo-aggiuntivo-chip-height);

      .label__badge {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        height: var(--osd-campo-aggiuntivo-chip-height);
        margin-right: 10px;
        padding: 0 8px;
        background: #e95298;
        border-radius: 12px;
      }

      .label__badgeIcon {
        display: block;
        width: 23px;
        height: 14px;
      }

      .label__text {
        line-height: var(--osd-campo-aggiuntivo-chip-height);
        background: #ffffff;
      }
    }
  }

  .valueCol {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    text-align: left;

    &.valueCol--full {
      flex: 1 1 100%;
      width: 100%;
    }
  }

  .valueWrapper {
    position: relative;
    width: 100%;
  }

  .value {
    /*font-weight: 500;*/
    font-size: var(--osd-meta-value-fs);
    line-height: var(--osd-meta-value-line-height);
    letter-spacing: 0%;
    color: #000000;
    word-break: break-word;
  }

  .value__link {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .value__link:hover {
    color: #4e4e4e;
  }

  .value.clamped {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 calc(100% - 1.2em), transparent 100%);
    mask-image: linear-gradient(to bottom, #000 0%, #000 calc(100% - 1.2em), transparent 100%);
  }

  .toggleBtn {
    margin-top: 16px;
    padding: 4px 8px;
    font-weight: 500;
    font-size: 14px;
    line-height: 12px;
    text-transform: uppercase;
    color: rgba(78, 78, 78, 1);
    background: rgba(230, 230, 230, 1);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    align-self: flex-end;
  }

  .toggleBtn:hover {
    background: #e8e8e8;
  }
}

/*
 * Desktop a riga: etichetta centrata sulla mid-line della *prima riga* del valore
 * (non dell’intera colonna). padding-top = (altezza linea valore − altezza blocco etichetta) / 2.
 */
@media (min-width: 769px) {
  .field:not(.stacked) .label {
    padding-top: calc((var(--osd-meta-value-first-line-box) - var(--osd-meta-label-block-h)) / 2);
  }
}

.stacked {
  flex-direction: column;

  .label {
    width: 100%;
    flex-basis: auto;
    line-height: normal;
    padding-top: 0;
  }

  .valueCol {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .field {
    flex-direction: column;
    align-items: flex-start;
    min-height: min-content;
    padding-bottom: 12px;

    .label {
      width: 100%;
      flex-basis: auto;
      margin-bottom: 4px;
      padding-top: 0;
    }

    .valueCol {
      width: 100%;
    }

    .value {
      width: 100%;
    }
  }
}
</style>
