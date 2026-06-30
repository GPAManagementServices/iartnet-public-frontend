<template>
  <AlertDialogRoot v-bind="forwarded">
    <AlertDialogTrigger as-child>
      <slot name="trigger" />
    </AlertDialogTrigger>

    <AlertDialogPortal>
      <AlertDialogOverlay class="AlertDialogOverlay" />
      <AlertDialogContent
        class="AlertDialogContent"
        :class="[position && `AlertDialogContent--${position}`]"
        v-bind="$attrs"
        :style="{ maxWidth: `${maxWidth}px` }"
        :aria-describedby="!description && !$slots?.description ? undefined : description!"
      >
        <VisuallyHidden v-if="hideTitle">
          <AlertDialogTitle> {{ title }} </AlertDialogTitle>
        </VisuallyHidden>
        <header v-else-if="!hideTitle || description || $slots?.description">
          <AlertDialogTitle class="AlertDialogTitle">
            {{ title }}
          </AlertDialogTitle>
          <AlertDialogDescription
            v-if="description || $slots?.description"
            class="AlertDialogDescription"
          >
            <slot name="description">
              {{ description }}
            </slot>
          </AlertDialogDescription>
        </header>

        <slot />

        <div class="AlertDialogActions">
          <slot name="action">
            <AlertDialogCancel as-child>
              <UiButton
                color="gray"
                variant="primary"
                size="sm"
                :aria-label="$t('cancel')"
                :label="$t('cancel')"
              />
            </AlertDialogCancel>
          </slot>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<script setup lang="ts">
import type { DialogRootEmits, DialogRootProps } from 'reka-ui'
import { reactivePick } from '@vueuse/core'
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  useForwardPropsEmits,
  VisuallyHidden,
} from 'reka-ui'

defineOptions({ name: 'UiAlertDialog', inheritAttrs: false })

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  hideTitle?: boolean
  maxWidth?: number
  position?: 'top' | 'left' | 'right' | 'bottom' | 'bottom-left'
} & DialogRootProps>(), {
  modal: true,
  title: '',
  description: '',
  maxWidth: 480,
})

const emits = defineEmits<DialogRootEmits>()
const forwarded = useForwardPropsEmits(reactivePick(props, 'defaultOpen', 'modal', 'open'), emits)
</script>

<style lang="postcss">
.AlertDialogOverlay {
  background-color: var(--black-a9);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.AlertDialogContent {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 480px;
  max-height: 85vh;
  padding: var(--app-margin);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);

  &--bottom {
    top: auto;
    bottom: var(--app-margin);
    left: 50%;
    transform: translateX(-50%);
    animation-name: contentShowBottom;
  }

  &--bottom-left {
    top: auto;
    bottom: var(--app-margin);
    left: var(--app-margin);
    transform: none;
    animation-name: contentShowBottomLeft;
  }
}
.AlertDialogContent:focus {
  outline: none;
}

.AlertDialogTitle {
  margin: 0;
  color: var(--text-color);
  font-size: var(--text-large);
  font-weight: var(--bold);
}

.AlertDialogDescription {
  margin-bottom: var(--app-margin);
  color: var(--text-secondary);
  font-size: var(--text-small);
  line-height: 1.4;
}

.AlertDialogActions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

@keyframes overlayShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes contentShow {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes contentShowBottom {
  from {
    opacity: 0;
    transform: translate(-50%, 10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

@keyframes contentShowBottomLeft {
  from {
    opacity: 0;
    transform: translate(0, 10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}
</style>
