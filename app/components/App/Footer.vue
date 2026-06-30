<template>
  <footer class="app-footer">
    <!-- Main Content Section -->
    <div class="footer-main app-padding">
      <!-- Logo -->
      <NuxtLink :to="$localePath('index')" class="footer-logo" aria-label="Homepage">
        <img src="/images/iartnet-logo.png" style="height: 32px;" aria-label="iArtNET">
      </NuxtLink>

      <div class="footer-content">
        <!-- Left Column: Description & Funding -->
        <div class="footer-brand">
          <p class="footer-description">
            {{ $t('Footer description') }}
          </p>
          <p class="footer-funding">
            {{ $t('Funded by the European Union') }}<br>
            {{ $t('Missione 4 Componente 1') }} CUP D43C24000580001
          </p>
        </div>

        <!-- Navigation + Accessibility + Actions -->
        <div class="footer-nav-wrapper">
          <div class="footer-nav-row">
            <div class="footer-nav">
              <!-- Explore Column -->
              <nav class="nav-column">
                <h3 class="nav-title">
                  {{ $t('Explore') }}
                </h3>
                <ul class="nav-list">
                  <li>
                    <UiLink :to="$localePath('projects')">
                      {{ $t('Research projects') }}
                    </UiLink>
                  </li>
                  <li>
                    <UiLink :to="$localePath('search')">
                      {{ $t('Search Database') }}
                    </UiLink>
                  </li>
                  <li v-if="false">
                    <UiLink :to="$localePath('narratives')">
                      {{ $t('Narratives') }}
                    </UiLink>
                  </li>
                  <li>
                    <UiLink :to="$localePath('activities')">
                      {{ $t('Activities') }}
                    </UiLink>
                  </li>
                </ul>
              </nav>

              <!-- About Column -->
              <nav class="nav-column">
                <h3 class="nav-title">
                  <UiLink :to="$localePath('about')">
                    {{ $t('About') }}
                  </UiLink>
                </h3>
                <ul class="nav-list">
                  <li>
                    <UiLink :to="$localePath('institutions')">
                      {{ $t('Institutions') }}
                    </UiLink>
                  </li>
                  <li>
                    <UiLink :to="$localePath('people')">
                      {{ $t('People') }}
                    </UiLink>
                  </li>
                  <li>
                    <UiLink :to="$localePath('output')">
                      {{ $t('Output') }}
                    </UiLink>
                  </li>
                  <li v-if="false">
                    <UiLink>
                      {{ $t('FAQ') }}
                    </UiLink>
                  </li>
                </ul>
              </nav>

              <!-- Legal Column -->
              <nav class="nav-column">
                <h3 class="nav-title">
                  {{ $t('Legal') }}
                </h3>
                <ul class="nav-list">
                  <li>
                    <UiLink :to="$localePath({ name: 'slug', params: { slug: 'accessibility' } })">
                      {{ $t('Accessibility') }}
                    </UiLink>
                  </li>
                  <li>
                    <!-- :to="$localePath({ name: 'slug', params: { slug: 'cookie-settings' } })" -->
                    <UiLink @click="isOpen = true">
                      {{ $t('Cookie Settings') }}
                    </UiLink>
                  </li>
                  <li>
                    <UiLink :to="$localePath({ name: 'slug', params: { slug: 'privacy-policy' } })">
                      {{ $t('Privacy Policy') }}
                    </UiLink>
                  </li>

                  <li>
                    <UiLink :to="$localePath({ name: 'slug', params: { slug: 'terms-of-use' } })">
                      {{ $t('Terms of Use') }}
                    </UiLink>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- Language + Scroll to Top -->
            <div class="footer-actions">
              <UiButton
                variant="outline"
                rounded
                icon="chevron-up"
                aria-label="Scroll to top"
                class="scroll-top"
                @click="scrollToTop"
              />
            </div>
          </div>

          <p class="footer-accessibility">
            {{ $t('We strive to make our website accessible') }}
            <NuxtLink to="mailto:dpo@pec.accademiadibrera.milano.it">
              {{ $t('Let us know') }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>

    <!-- Logos -->
    <div class="footer-logos app-padding">
      <img src="/images/eu-funded-logo.png" alt="Funded by EU - Logo" style="height: calc(30px * var(--factor, 1));">
      <img src="/images/mur-logo.png" alt="Ministero Università e Ricerca - Logo" style="height: calc(25px * var(--factor, 1));">
      <img src="/images/italiadomani-logo.png" alt="Italiadomani - Logo" style="height: calc(32px * var(--factor, 1));">
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom app-padding">
      <p class="copyright">
        <span v-if="appVersion">{{ appVersion }} · </span>
        {{ $t('All rights reserved') }} © {{ new Date().getFullYear() }}
      </p>
      <nav class="footer-links">
        <!-- :to="$localePath({ name: 'slug', params: { slug: 'accessibility' } })" -->
        <UiLink>
          {{ $t('Accessibility') }}
        </UiLink>
        <!-- :to="$localePath({ name: 'slug', params: { slug: 'cookie-settings' } })" -->
        <UiLink @click="isOpen = true">
          {{ $t('Cookie Settings') }}
        </UiLink>
      </nav>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const { isOpen } = useCookieSettings()
const runtimeConfig = useRuntimeConfig()
const appVersion = runtimeConfig?.public?.version ?? ''

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="postcss">
.app-footer {
  margin-top: 48px;
  border-top: 1px solid var(--ui-neutral-border);
  background: var(--ui-neutral-background);
  color: var(--ui-neutral-text);
  font-size: var(--text-small);
}

/* Main Content Section */
.footer-main {
  padding-top: 48px;
  padding-bottom: 48px;
}

.footer-logo {
  display: block;
  margin-bottom: 32px;
}

.footer-logo img {
  height: 32px;
  width: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}

@media (min-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }
}

@media (min-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 64px;
  }
}

/* Navigation + Accessibility Wrapper */
.footer-nav-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.footer-nav-row {
  display: flex;
  justify-content: space-between;
  gap: 32px;
}

/* Brand Column */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.footer-description {
  font-size: var(--text-small);
  line-height: 1.6;
  max-width: 480px;
}

.footer-funding {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--text-small);
}

/* Navigation Columns */
.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
}

.nav-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 120px;
  gap: 12px;
}

.nav-title {
  font-size: var(--text);
  margin: 0;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.nav-list a {
  color: var(--ui-neutral-text);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--ui-accent-solid);
  }
}

.footer-accessibility {
  display: none;
  line-height: 1.6;

  a {
    color: var(--ui-neutral-text);
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: var(--ui-accent-solid);
    }
  }
}

/* Footer Actions (Language + Scroll to Top) */
.footer-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.scroll-top {
  margin-top: auto;
  width: 48px;
  min-height: 48px;
  justify-content: center;
  align-items: center;
}
/* Logos */
.footer-logos {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: var(--app-gap);
  padding-block: 24px;
  @supports not (padding-block: 0) {
    padding-top: 24px;
    padding-bottom: 24px;
  }

  @media (min-width: 768px) {
    --factor: 1.2;
  }
}

@media (min-width: 768px) {
  .footer-logos {
    justify-content: space-around;
  }
}

/* Bottom Bar */
.footer-bottom {
  border-top: 1px solid var(--ui-neutral-border);
  padding-top: 12px;
  padding-bottom: 12px;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.footer-links {
  display: flex;
  gap: 24px;

  a {
    color: var(--ui-neutral-text);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--ui-accent-solid);
    }
  }
}
</style>
