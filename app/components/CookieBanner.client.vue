<template>
  <UiAlertDialog
    v-if="isOpen"
    :open="isOpen"
    :modal="false"
    :title="$t('cookie-title')"
    position="bottom"
    :max-width="480"
    hide-title
    @update:open="onClose"
  >
    <i18n-t keypath="cookie-description" tag="p" class="text-small">
      <template #link>
        <NuxtLinkLocale class="hover-line" to="/privacy-policy">
          {{ $t('Privacy Policy') }}
        </NuxtLinkLocale>
      </template>
    </i18n-t>

    <template #action>
      <!-- <UiButton variant="outline" :label="$t('cookie.decline')" @click="decline" /> -->
      <UiButton variant="secondary" :label="$t('cookie-accept')" @click="accept" />
    </template>
  </UiAlertDialog>
</template>

<script setup lang="ts">
const { isOpen } = useCookieSettings()
const cookie = useCookie('cookie-consent', {
  maxAge: 60 * 60 * 24 * 365, // 1 year
})

if (!cookie.value)
  isOpen.value = true

function accept() {
  cookie.value = 'all'
  isOpen.value = false
}
function decline() {
  cookie.value = 'none'
  isOpen.value = false
}

function onClose(value: boolean) {
  if (!value)
    decline()
}
</script>
