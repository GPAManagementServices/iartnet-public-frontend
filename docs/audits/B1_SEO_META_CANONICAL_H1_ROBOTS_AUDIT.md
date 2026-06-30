# Fase B1 — Audit SEO meta/canonical/H1/robots

## 1. Scope

| Campo | Valore |
|---|---|
| Tipo audit | Read-only, nessuna modifica codice applicativo |
| Ambiente | Produzione `https://iartnet.it` |
| Data/ora esecuzione | 2026-06-06T14:26:52Z (UTC) |
| Repository ispezionato (solo lettura) | `iartnet_frontend` |
| Narrazioni | Auditate come pagine pubbliche; **nessuna** raccomandazione di blocco/nascondimento |
| Strumenti | Node.js 22 builtin (`fetch`), script temporaneo `C:\Users\salva\AppData\Local\Temp\iartnet_b1_audit.mjs` |
| Output grezzo | `C:\Users\salva\AppData\Local\Temp\iartnet_b1_audit.json` (fuori repository) |
| User-Agent | `Mozilla/5.0 compatible; iArtNET-B1-SEO-Audit/1.0` |
| Limite campione | 40 URL HTML max; 28 pagine HTML verificate (escluse 4 entry XML erroneamente campionate come HTML) |

**Git status pre-audit:**

```text
## main...origin/main
```

**Conferma vincoli:** nessun file applicativo modificato durante l’audit. L’unica modifica al working tree è questo report.

---

## 2. Executive summary

### OK principali

- **HTTPS apex canonico:** tutte le pagine HTML verificate rispondono su `https://iartnet.it` senza redirect verso `www`.
- **Canonical assoluti coerenti:** 26/26 pagine HTML 200 hanno canonical `https://iartnet.it/...` allineato alla Final URL normalizzata (0 mismatch canonical).
- **Indexability base:** nessun `noindex` in meta robots o X-Robots-Tag sulle pagine HTML 200 del campione.
- **robots.txt:** `User-agent: *` con `Disallow:` vuoto; sitemap dichiarata `https://iartnet.it/sitemap_index.xml`.
- **Sitemap index:** `sitemap.xml` → 307 → `sitemap_index.xml` (200); 4 child sitemap raggiungibili.
- **Fase A1/A1-bis confermate in PROD:** `cms.xml` 618 loc, 0 occorrenze `/it/`; `pages.xml` 6 loc hub.
- **CMS detail pages:** project, activity, institution detail campionati hanno title, canonical e H1 coerenti con il contenuto SSR.
- **Pagine legali esistenti:** `/privacy-policy`, `/terms-of-use` → 200, H1 coerente.

### Critical findings

| ID | Finding |
|---|---|
| B1-001 | **People detail mismatch:** `/people/daniel-cosa-luca` ha title/canonical da dettaglio persona ma SSR renderizza lista People (H1 = "People", body = altre persone). |
| B1-002 | **`/accessibility` 404:** pagina legal richiesta nello scope non esiste in produzione. |

### High findings

| ID | Finding |
|---|---|
| B1-003 | **Homepage H1 vuoto:** `<h1></h1>` presente ma senza testo; claim principale in `<h2>`. |
| B1-004 | **Meta description assente** su 18/28 pagine HTML campione (~64%). |
| B1-005 | **Narrative SSR senza H1:** `/narratives/mozart-...` → 0 H1 in HTML SSR. |
| B1-006 | **Digital object SSR senza H1:** 4/4 digital-object campionati → 0 H1. |
| B1-007 | **Placeholder `/lorem-ipsum` in sitemap e indicizzabile:** presente in `cms.xml`, 200 OK, contenuto Lorem ipsum. |

### Medium findings

| ID | Finding |
|---|---|
| B1-008 | **`/outputs` 404** — route reale del sito è `/output` (200). |
| B1-009 | **`/digital-object.xml` 404** — path legacy; sitemap reale `__sitemap__/ingestion-digital-objects.xml`. |
| B1-010 | **`/__sitemap__/en.xml` e `/it.xml` 404** — residui pre-Fase A1 o riferimenti obsoleti. |
| B1-011 | **Homepage title generico** (`iArtNET` senza claim). |
| B1-012 | **Digital object title = stable ID** (es. `2011 2012 435 | iArtNET`), non titolo descrittivo del record. |
| B1-013 | **`/search` indicizzabile** (index,follow) ma esclusa dalla sitemap — coerente con config ma da valutare in B2. |

### Low / warning

| ID | Finding |
|---|---|
| B1-014 | **X-Robots-Tag `index,follow` su risposte 404** (`/outputs`, `/accessibility`). |
| B1-015 | **Meta description molto brevi** su alcune activity/institution (es. Firenze). |
| B1-016 | **`sitemap_index.xml` espone X-Robots-Tag HTML** (`index,follow`) — atipico per XML, impatto SEO trascurabile. |

**Conteggio finding:** Critical 2 · High 5 · Medium 6 · Low 3 · **Totale 16**

---

## 3. Tabella audit URL HTML

Legenda note accorciate: `no-desc` = meta description assente; `h1-empty` = H1 vuoto; `h1-abs` = H1 assente; `mismatch` = contenuto non coerente con URL/title.

| Source | URL requested | HTTP | Final URL | X-Robots | meta robots | title | title | desc | canonical | canon | H1# | H1 text | H1 | mismatch | note |
|---|---|---:|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|
| manual | `/` | 200 | `/` | index,follow | index,follow | iArtNET | WARN | WARN | `https://iartnet.it/` | OK | 1 | *(vuoto)* | KO | OK | no-desc; h1-empty; title generico |
| manual | `/projects` | 200 | `/projects` | index,follow | index,follow | Projects \| iArtNET | OK | WARN | `/projects` | OK | 1 | Research projects | OK | OK | no-desc |
| manual | `/activities` | 200 | `/activities` | index,follow | index,follow | Activities \| iArtNET | OK | OK | `/activities` | OK | 1 | Activities | OK | OK | |
| manual | `/institutions` | 200 | `/institutions` | index,follow | index,follow | Institutions \| iArtNET | OK | WARN | `/institutions` | OK | 1 | Institutions | OK | OK | no-desc |
| manual | `/people` | 200 | `/people` | index,follow | index,follow | People \| iArtNET | OK | WARN | `/people` | OK | 1 | People | OK | OK | no-desc |
| manual | `/outputs` | 404 | `/outputs` | index,follow | — | *(assente)* | N/A | N/A | *(assente)* | N/A | 0 | — | N/A | N/A | pagina non esiste; vedi `/output` |
| manual | `/search` | 200 | `/search` | index,follow | index,follow | Search \| iArtNET | OK | WARN | `/search` | OK | 1 | Try the search bar below: | OK | OK | no-desc |
| manual | `/projects/digital-archives-of-art-teaching-collections` | 200 | *(uguale)* | index,follow | index,follow | Digital Archives of Art Teaching Collections \| iArtNET | OK | WARN | *(coerente)* | OK | 1 | Digital Archives of Art Teaching Collections | OK | OK | no-desc |
| manual | `/institutions/accademia-delle-belle-arti-di-firenze` | 200 | *(uguale)* | index,follow | index,follow | Accademia delle Belle Arti di Firenze \| iArtNET | OK | WARN | *(coerente)* | OK | 1 | Accademia delle Belle Arti di Firenze | OK | OK | desc breve |
| manual | `/activities/disorienting-the-gaze-rewriting-the-minor-archive` | 200 | *(uguale)* | index,follow | index,follow | Disorienting the Gaze, Rewriting the Minor Archive \| iArtNET | OK | OK | *(coerente)* | OK | 1 | Disorienting the Gaze, Rewriting the Minor Archive | OK | OK | |
| manual | `/people/daniel-cosa-luca` | 200 | *(uguale)* | index,follow | index,follow | Daniel Cosa Luca \| iArtNET | OK | WARN | `/people/daniel-cosa-luca` | OK | 1 | People | OK | **KO** | mismatch; no-desc; vedi §6 |
| manual | `/narratives/mozart-and-the-masonic-interpretation-of-the-magic-flute` | 200 | *(uguale)* | index,follow | index,follow | Mozart and the Masonic Interpretation of the Magic Flute \| iArtNET | OK | WARN | *(coerente)* | OK | 0 | — | KO | OK | no-desc; h1-abs SSR; vedi §7 |
| manual | `/privacy-policy` | 200 | *(uguale)* | index,follow | index,follow | Privacy Policy \| iArtNET | OK | WARN | `/privacy-policy` | OK | 1 | Privacy Policy | OK | OK | no-desc |
| manual | `/terms-of-use` | 200 | *(uguale)* | index,follow | index,follow | Terms of Use \| iArtNET | OK | WARN | `/terms-of-use` | OK | 1 | Terms of Use | OK | OK | no-desc |
| manual | `/accessibility` | 404 | `/accessibility` | index,follow | — | *(assente)* | N/A | N/A | *(assente)* | N/A | 0 | — | N/A | N/A | pagina legal assente |
| sitemap | `/activities/a-photographer-an-art-collector-and-the-exciting-discovery-of-color-reproductions` | 200 | *(uguale)* | index,follow | index,follow | A Photographer, an Art Collector… \| iArtNET | OK | OK | *(coerente)* | OK | 1 | A Photographer, an Art Collector… | OK | OK | da cms.xml |
| sitemap | `/digital-object/2011-2012-435` | 200 | *(uguale)* | index,follow | index,follow | 2011 2012 435 \| iArtNET | OK | WARN | *(coerente)* | OK | 0 | — | KO | OK | no-desc; h1-abs; title = ID |
| sitemap | `/about` | 200 | `/about` | index,follow | index,follow | About \| iArtNET | OK | WARN | `/about` | OK | 1 | Bringing together historical collections | OK | OK | da pages.xml; no-desc |
| sitemap | `/lorem-ipsum` | 200 | `/lorem-ipsum` | index,follow | index,follow | Lorem Ipsum \| iArtNET | OK | WARN | `/lorem-ipsum` | OK | 1 | Lorem ipsum dolor sit amet | OK | OK | placeholder in cms.xml |
| sitemap | `/activities/artificial-intelligenceartistic-innovation` | 200 | *(uguale)* | index,follow | index,follow | Artificial intelligence/Artistic Innovation \| iArtNET | OK | OK | *(coerente)* | OK | 1 | Artificial intelligence / Artistic Innovation | OK | OK | da cms.xml |
| sitemap | `/activities/artistic-research-in-italy` | 200 | *(uguale)* | index,follow | index,follow | Artistic Research in Italy \| iArtNET | OK | WARN | *(coerente)* | OK | 1 | Artistic Research in Italy | OK | OK | desc breve |
| sitemap | `/activities/cataloguing-photography` | 200 | *(uguale)* | index,follow | index,follow | Cataloguing Photography \| iArtNET | OK | OK | *(coerente)* | OK | 1 | Cataloguing Photography | OK | OK | |
| sitemap | `/activities/code-as-material-creative-coding-foundations-for-artistic-and-design-practices` | 200 | *(uguale)* | index,follow | index,follow | Code as Material: Creative Coding… \| iArtNET | OK | OK | *(coerente)* | OK | 1 | Code as Material | OK | OK | |
| sitemap | `/activities/cross-sector-skills-in-the-cultural-and-creative-industries-technologies-research-methodologies-and-approaches-to-digital-technology` | 200 | *(uguale)* | index,follow | index,follow | Cross-Sector skills in the Cultural… \| iArtNET | OK | OK | *(coerente)* | OK | 1 | Cross-Sector skills in the Cultural… | OK | OK | |
| sitemap | `/activities/design-and-planning-of-international-artistic-research` | 200 | *(uguale)* | index,follow | index,follow | Design and Planning of International Artistic Research \| iArtNET | OK | WARN | *(coerente)* | OK | 1 | Design and Planning of International Artistic Research | OK | OK | desc breve |
| sitemap | `/digital-object/2011-2012-455` | 200 | *(uguale)* | index,follow | index,follow | 2011 2012 455 \| iArtNET | OK | WARN | *(coerente)* | OK | 0 | — | KO | OK | h1-abs |
| sitemap | `/digital-object/2011-2012-1210` | 200 | *(uguale)* | index,follow | index,follow | 2011 2012 1210 \| iArtNET | OK | WARN | *(coerente)* | OK | 0 | — | KO | OK | h1-abs |
| sitemap | `/digital-object/2011-2012-1211` | 200 | *(uguale)* | index,follow | index,follow | 2011 2012 1211 \| iArtNET | OK | WARN | *(coerente)* | OK | 0 | — | KO | OK | h1-abs |

**Redirect chain osservate (pagine HTML):** nessuna pagina HTML del campione ha redirect; tutte rispondono 200 diretto su URL richiesto.

**Nota campionamento sitemap:** lo script ha inizialmente incluso 4 URL XML (`/__sitemap__/*.xml`) nel batch HTML per errore di campionamento; esclusi dalla tabella sopra. Campione sitemap HTML utile: 13 URL.

---

## 4. Findings dettagliati

### B1-001 — People detail: title/canonical dettaglio, SSR lista People

- **Severità:** Critical
- **URL coinvolti:** `https://iartnet.it/people/daniel-cosa-luca`
- **Evidenza:**
  - HTTP 200, redirect chain vuota
  - `<title>Daniel Cosa Luca | iArtNET</title>`
  - `<link rel="canonical" href="https://iartnet.it/people/daniel-cosa-luca">`
  - Unico H1 SSR: `People` (da `HeaderMain title="People"` in `people.vue`)
  - Main content hint SSR: inizia con «Academic Coordinator Nicoletta Leonardi…» — contenuto lista, non profilo Daniel Cosa Luca
  - `PersonDetailContent` (con H1 nome persona) è nel pannello dialog, non nel markup SSR principale
- **Impatto SEO:** Google può indicizzare URL/canonical/title da pagina persona ma valutare contenuto come pagina lista People → segnali contrastanti, rischio thin/duplicate content e rich result degradati.
- **Causa probabile:** architettura route annidata (`people/[slug].vue` shell vuota + dialog client-side); assenza `useCmsDetailSeo` / head dinamico per people detail; H1 lista sempre attivo.
- **File probabili B2:** `app/pages/people.vue`, `app/pages/people/[slug].vue`, `app/components/People/PersonDetailContent.vue`, eventuale nuovo composable SEO people
- **Raccomandazione B2:** SSR del dettaglio persona (o almeno H1/title/description/body coerenti) su URL `/people/{slug}`; non nascondere la pagina.
- **Stato:** Da correggere in B2

### B1-002 — Pagina legal `/accessibility` assente (404)

- **Severità:** Critical
- **URL coinvolti:** `https://iartnet.it/accessibility`
- **Evidenza:** HTTP 404; body JSON Nuxt error; nessun title/canonical/H1
- **Impatto SEO:** link footer/legal rotti; pagina compliance non raggiungibile; GSC può segnalare soft-404 se linkata internamente
- **Causa probabile:** pagina CMS non creata o slug diverso
- **File probabili B2:** `app/pages/[slug].vue`, CMS backoffice pagine statiche, footer links
- **Raccomandazione B2:** creare pagina accessibility o correggere link interni verso slug esistente
- **Stato:** Da correggere in B2

### B1-003 — Homepage: H1 vuoto, claim in H2

- **Severità:** High
- **URL coinvolti:** `https://iartnet.it/`
- **Evidenza:**
  - `<h1 class="title"></h1>` (vuoto) — `index.vue` passa `title=""` a `HeaderHomepage`
  - Primo H2: «An international platform for artistic research and cultural heritage at Italian higher arts education institutions»
  - Title: `iArtNET` (generico)
  - Meta description: assente
- **Impatto SEO:** gerarchia heading non ottimale; claim principale non in H1; snippet SERP povero senza description
- **Causa probabile:** `app/pages/index.vue` riga `<HeaderHomepage title="" />`; claim volutamente in `<h2 class="temp-title">`
- **File probabili B2:** `app/pages/index.vue`, `app/components/Header/Homepage.vue`
- **Raccomandazione B2:** popolare H1 con claim principale; spostare sezioni secondarie su H2/H3; aggiungere meta description
- **Stato:** Da correggere in B2

### B1-004 — Meta description assente su larga parte del sito

- **Severità:** High
- **URL coinvolti:** 18/28 pagine campione, incl. homepage, projects, people, search, narratives, digital-object, legal pages
- **Evidenza:** `<meta name="description" content="...">` assente o vuoto nel HTML SSR
- **Impatto SEO:** snippet SERP autogenerati; minore controllo CTR
- **Causa probabile:** `useCmsDetailSeo` usato solo su alcune route; homepage/people/narratives/digital-object/legal senza description
- **File probabili B2:** `app/composables/useCmsDetailSeo.ts`, pagine senza composable, CMS `meta_description`
- **Raccomandazione B2:** description per tipo pagina (hub, detail, homepage, legal)
- **Stato:** Da correggere in B2

### B1-005 — Narrative: assenza H1 in SSR

- **Severità:** High
- **URL coinvolti:** `https://iartnet.it/narratives/mozart-and-the-masonic-interpretation-of-the-magic-flute`
- **Evidenza:** 0 tag `<h1>` nel HTML; title e canonical corretti; main hint contiene testo titolo narrative ma non in H1
- **Impatto SEO:** heading structure debole per pagine editoriali lunghe
- **Causa probabile:** `app/pages/narratives/[slug].vue` wrappato in `<ClientOnly>`; `StoryHeader` H1 renderizzato solo client-side
- **File probabili B2:** `app/pages/narratives/[slug].vue`, `app/components/Narratives/StoryHeader.vue`
- **Raccomandazione B2:** esporre H1 (e meta description) in SSR senza alterare visibilità pubblica
- **Stato:** Da correggere in B2

### B1-006 — Digital object: assenza H1 in SSR

- **Severità:** High
- **URL coinvolti:** `/digital-object/2011-2012-435`, `...-455`, `...-1210`, `...-1211`
- **Evidenza:** 0 H1; contenuto record presente in `<main>` (Type, Title, Context…)
- **Impatto SEO:** pagine record senza heading semantico primario
- **Causa probabile:** componenti OSD card senza `<h1>` nel template SSR
- **File probabili B2:** `app/pages/digital-object/[slug].vue`, `app/components/Osd/**/CardType*.vue`, `app/composables/useOsdCardSeo.ts`
- **Raccomandazione B2:** H1 con titolo record (campo Title) in SSR
- **Stato:** Da correggere in B2

### B1-007 — Placeholder `/lorem-ipsum` in sitemap CMS

- **Severità:** High
- **URL coinvolti:** `https://iartnet.it/lorem-ipsum`
- **Evidenza:** presente in `cms.xml`; 200 OK; H1 «Lorem ipsum dolor sit amet»; contenuto placeholder
- **Impatto SEO:** indicizzazione contenuto non editoriale; rumore in GSC
- **Causa probabile:** pagina CMS test non unpublished/non esclusa da sitemap
- **File probabili B2:** CMS pagina statica, `server/utils/sitemap/fetchCmsUrls.ts`
- **Raccomandazione B2:** unpublish o escludere da sitemap; non lasciare placeholder indicizzabile
- **Stato:** Da correggere in B2

### B1-008 — `/outputs` 404; route reale `/output`

- **Severità:** Medium
- **URL coinvolti:** `/outputs` (404), `/output` (200, verifica aggiuntiva post-campione)
- **Evidenza:** scope richiedeva `/outputs` → 404; `app/pages/output.vue` esiste
- **Impatto SEO:** link errati verso `/outputs` generano 404
- **Causa probabile:** naming singolare/plurale inconsistente
- **File probabili B2:** navigazione/footer, redirect 301 `/outputs` → `/output` se linkato
- **Raccomandazione B2:** allineare URL pubblici e link interni
- **Stato:** Da verificare manualmente (presenza link a `/outputs`)

### B1-009 — `digital-object.xml` 404 (path legacy)

- **Severità:** Medium
- **URL coinvolti:** `https://iartnet.it/digital-object.xml`
- **Evidenza:** 404 JSON; sitemap reale `https://iartnet.it/__sitemap__/ingestion-digital-objects.xml` (3475 loc, 200)
- **Impatto SEO:** riferimenti esterni/documentazione obsoleti
- **Causa probabile:** rename sitemap post-refactor @nuxtjs/sitemap
- **File probabili B2:** documentazione, eventuale redirect nginx
- **Raccomandazione B2:** redirect 301 o aggiornare riferimenti
- **Stato:** Da verificare manualmente

### B1-010 — Sitemap i18n `en.xml` / `it.xml` 404

- **Severità:** Medium
- **URL coinvolti:** `/__sitemap__/en.xml`, `/__sitemap__/it.xml`
- **Evidenza:** 404 JSON «Sitemap "en/it" not found»; coerente con `autoI18n: false` post-Fase A1
- **Impatto SEO:** basso se non referenziate; confusione in audit esterni
- **Causa probabile:** rimozione sitemap i18n intenzionale
- **Raccomandazione B2:** nessuna azione se non linkate; aggiornare documentazione interna
- **Stato:** Nessuna azione (se non referenziate)

### B1-011 — Homepage title generico

- **Severità:** Medium
- **URL coinvolti:** `/`
- **Evidenza:** title = `iArtNET` (8 caratteri, brand-only)
- **Impatto SEO:** SERP poco descrittiva
- **Raccomandazione B2:** title con claim + brand
- **Stato:** Da correggere in B2

### B1-012 — Digital object title = stable ID

- **Severità:** Medium
- **URL coinvolti:** digital-object campione
- **Evidenza:** title `2011 2012 435 | iArtNET` mentre main contiene «Title Don Pasquale»
- **Impatto SEO:** SERP non descrittive
- **File probabili B2:** `app/composables/useOsdCardSeo.ts`
- **Stato:** Da correggere in B2

### B1-013 — Search indicizzabile ma fuori sitemap

- **Severità:** Medium
- **URL coinvolti:** `/search`
- **Evidenza:** robots allow; meta index,follow; esclusa in `nuxt.config.ts` sitemap `exclude`
- **Impatto SEO:** policy mista (scopribile via link, non via sitemap)
- **Stato:** Da verificare manualmente (intenzionale?)

### B1-014 — X-Robots index su 404

- **Severità:** Low
- **URL coinvolti:** `/outputs`, `/accessibility`
- **Evidenza:** header `x-robots-tag: index, follow` su 404
- **Stato:** Da correggere in B2 (noindex su error pages)

### B1-015 — Meta description brevi

- **Severità:** Low
- **URL coinvolti:** alcune activity/institution detail
- **Stato:** Da correggere in B2

### B1-016 — X-Robots su sitemap XML

- **Severità:** Low
- **URL coinvolti:** `sitemap_index.xml`
- **Evidenza:** `x-robots-tag: index, follow` su XML
- **Stato:** Nessuna azione

---

## 5. Homepage

| Campo | Valore |
|---|---|
| URL | `https://iartnet.it/` |
| HTTP | 200 |
| title | `iArtNET` |
| meta description | *(assente)* |
| canonical | `https://iartnet.it/` |
| H1 count | 1 |
| H1 text | *(vuoto)* |
| Primi H2 | 1) «An international platform for artistic research…» 2) «Research projects» 3) «Highlights» 4) «Activities» 5) «Research Catalogue» |
| Claim principale | **H2**, non H1 |
| H1 vuoti | **Sì** — tag presente, contenuto stringa vuota |
| Valutazione | **KO H1** · **WARN title/description** · canonical OK · indexability OK |

**Evidenza codice (solo lettura):** `app/pages/index.vue` → `<HeaderHomepage title="" />`; claim in `<h2 class="temp-title">`.

---

## 6. People detail

**URL:** `https://iartnet.it/people/daniel-cosa-luca`

| Campo | Valore |
|---|---|
| HTTP status | 200 |
| Redirect | Nessuno |
| title | `Daniel Cosa Luca \| iArtNET` |
| meta description | *(assente)* |
| canonical | `https://iartnet.it/people/daniel-cosa-luca` |
| H1 | `People` |
| main content hint | «Academic Coordinator Nicoletta Leonardi Accademia di Belle Arti di Brera…» |
| Contenuto effettivo | **Lista People** (SSR), non dettaglio Daniel Cosa Luca |
| Mismatch | **KO confermato** — title/canonical = dettaglio; H1/body = lista |
| Raccomandazione B2 | Rendere coerente SSR per URL dettaglio (H1 nome persona, contenuto profilo, meta description); valutare se title deriva da slug humanized vs API persona |

**Evidenza codice (solo lettura):** `people.vue` sempre `<HeaderMain title="People" />`; `people/[slug].vue` shell vuota; `PersonDetailContent` in dialog.

---

## 7. Narratives

**URL:** `https://iartnet.it/narratives/mozart-and-the-masonic-interpretation-of-the-magic-flute`

| Campo | Valore |
|---|---|
| HTTP status | 200 |
| X-Robots-Tag | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` |
| meta robots | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` |
| title | `Mozart and the Masonic Interpretation of the Magic Flute \| iArtNET` |
| meta description | *(assente)* |
| canonical | `https://iartnet.it/narratives/mozart-and-the-masonic-interpretation-of-the-magic-flute` |
| H1 | *(assente in SSR)* |
| Indexability | **OK** (200, no noindex, robots allow) |

**Nota obbligatoria:** Le Narrazioni sono state solo auditate. Non sono state proposte modifiche per nasconderle, bloccarle o cambiarne il comportamento pubblico.

**Sitemap:** `ingestion-narratives.xml` contiene 1 loc (questa URL, slug editoriale) — coerente con deploy post-Fase A3a parziale o narrative pubblicata con slug.

---

## 8. robots.txt

| Campo | Valore |
|---|---|
| URL | `https://iartnet.it/robots.txt` |
| HTTP status | 200 |
| Content-Type | `text/plain; charset=utf-8` |

**Contenuto completo:**

```text
# START nuxt-robots (indexable)
User-agent: *
Disallow: 

# Block non helpful bots
User-agent: Nuclei
User-agent: WikiDo
User-agent: Riddler
User-agent: PetalBot
User-agent: Zoominfobot
User-agent: Go-http-client
User-agent: Node/simplecrawler
User-agent: CazoodleBot
User-agent: dotbot/1.0
User-agent: Gigabot
User-agent: Barkrowler
User-agent: BLEXBot
User-agent: magpie-crawler
Disallow: /
Disallow: /it/

# Block AI Crawlers
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: Claude-Web
User-agent: anthropic-ai
User-agent: Applebot-Extended
User-agent: Bytespider
User-agent: CCBot
User-agent: cohere-ai
User-agent: Diffbot
User-agent: FacebookBot
User-agent: Google-Extended
User-agent: ImagesiftBot
User-agent: PerplexityBot
User-agent: OmigiliBot
User-agent: Omigili
Disallow: /
Disallow: /it/

Sitemap: https://iartnet.it/sitemap_index.xml
# END nuxt-robots
```

| Regola | Valutazione |
|---|---|
| `/` (Googlebot) | **Allow** — `Disallow:` vuoto per `User-agent: *` |
| `/api` | Non disallowato per Googlebot |
| `/storage` | Non disallowato |
| `/curator` | Non disallowato |
| `/narratives` | **Allow** |
| `/digital-object` | **Allow** |
| `/__sitemap__` | **Allow** |
| `/sitemap.xml` | **Allow** (referenziato in robots) |
| `/it/` | Disallow solo per bot specifici (non `*`) |

**Valutazione:** robots.txt **coerente** per indicizzazione contenuti pubblici principali. Disallow su bot aggressivi/AI non impatta Google Search. Nessun blocco critico su hub/detail/narratives.

---

## 9. Sitemap

| Sitemap URL | HTTP | Content-Type | loc count | Sample loc | Problemi |
|---|---|---:|---|---:|---|
| `/robots.txt` → dichiara | — | — | — | `sitemap_index.xml` | OK |
| `/sitemap.xml` | 307→200 | `text/xml` | 4 (index) | pages, cms, ingestion-digital-objects, ingestion-narratives | Redirect interno a `sitemap_index.xml` |
| `/sitemap_index.xml` | 200 | `text/xml` | 4 | *(come sopra)* | OK |
| `/__sitemap__/pages.xml` | 200 | `text/xml` | **6** | `/`, `/about`, `/activities`, `/institutions`, `/people`, `/projects` | OK post A1-bis |
| `/__sitemap__/cms.xml` | 200 | `text/xml` | **618** | detail CMS, `/lorem-ipsum` | Contiene placeholder; 0 `/it/` |
| `/__sitemap__/ingestion-digital-objects.xml` | 200 | `text/xml` | **3475** | `/digital-object/2011-2012-435` | OK |
| `/__sitemap__/ingestion-narratives.xml` | 200 | `text/xml` | **1** | narrative Mozart slug editoriale | OK (non UUID) |
| `/__sitemap__/en.xml` | **404** | `application/json` | 0 | — | Obsoleto / mai esistito post A1 |
| `/__sitemap__/it.xml` | **404** | `application/json` | 0 | — | Idem |
| `/digital-object.xml` | **404** | `application/json` | 0 | — | Path legacy |

**Coerenza robots ↔ sitemap:** `robots.txt` punta a `sitemap_index.xml` che elenca le 4 child sitemap attive. **Coerente.**

**Controlli aggiuntivi:**

| Check | Risultato |
|---|---|
| URL `http://` in sitemap | **0** nel campione (tutti `https://iartnet.it`) |
| URL `www.iartnet.it` | **0** nel campione |
| `/it/` in cms.xml | **0** |
| Sitemap vuote | `ingestion-narratives` non vuota (1 loc); `pages` non vuota (6 loc) |
| URL sitemap campionati non-200 | Pagine HTML da loc cms/digital-object: **200** nel campione |

**Nota:** `/search` non in sitemap (by design `nuxt.config.ts` exclude). `/output` non in `pages.xml` hub (6 URL).

---

## 10. Fix candidate per Fase B2

1. **[Critical] People detail SSR mismatch**
   - Problema: title/canonical dettaglio vs H1/body lista
   - Evidenza B1: §6, B1-001
   - File probabili: `app/pages/people.vue`, `app/pages/people/[slug].vue`, `PersonDetailContent.vue`
   - Tipo: SSR heading + content + `useSeoMeta` per people detail
   - Rischio: medio (cambia HTML SSR route annidata)
   - Test: `curl -s .../people/daniel-cosa-luca | grep -E '<h1|canonical|Daniel'`

2. **[Critical] Pagina `/accessibility`**
   - Problema: 404 su URL legal scope
   - Evidenza B1: B1-002
   - File probabili: CMS static page, `app/pages/[slug].vue`, footer
   - Tipo: contenuto CMS o fix link
   - Rischio: basso
   - Test: HTTP 200 + H1 «Accessibility»

3. **[High] Homepage H1 + meta description + title**
   - Problema: H1 vuoto, claim in H2, no description
   - Evidenza B1: §5, B1-003, B1-011
   - File probabili: `app/pages/index.vue`, `Header/Homepage.vue`
   - Tipo: markup + SEO meta
   - Rischio: basso
   - Test: H1 non vuoto; description presente

4. **[High] Meta description sistemica**
   - Problema: assente su ~64% campione
   - Evidenza B1: B1-004
   - File probabili: composables SEO, pagine hub/legal/narratives
   - Tipo: `useSeoMeta` / CMS fields
   - Rischio: basso
   - Test: spot-check 10 URL

5. **[High] Narrative H1 SSR**
   - Problema: 0 H1 in HTML SSR
   - Evidenza B1: §7, B1-005
   - File probabili: `narratives/[slug].vue`, `StoryHeader.vue`
   - Tipo: SSR heading senza ClientOnly sul solo H1
   - Rischio: medio
   - Test: curl grep `<h1`

6. **[High] Digital object H1 + title descrittivo**
   - Problema: no H1; title = stable ID
   - Evidenza B1: B1-006, B1-012
   - File probabili: `useOsdCardSeo.ts`, CardType components
   - Tipo: SEO + markup
   - Rischio: basso
   - Test: title contiene titolo record

7. **[High] Rimuovere `/lorem-ipsum` da indicizzazione**
   - Problema: placeholder in cms.xml
   - Evidenza B1: B1-007
   - File probabili: CMS, `fetchCmsUrls.ts`
   - Tipo: unpublish o exclude sitemap
   - Rischio: basso
   - Test: 404 o noindex; assente da cms.xml

8. **[Medium] Allineare `/outputs` vs `/output`**
   - Problema: URL scope 404
   - Evidenza B1: B1-008
   - Tipo: redirect o fix link
   - Rischio: basso

9. **[Medium] Legacy `digital-object.xml`**
   - Problema: 404
   - Evidenza B1: B1-009
   - Tipo: redirect nginx o docs
   - Rischio: basso

10. **[Low] noindex su pagine 404**
    - Problema: X-Robots index su 404
    - Evidenza B1: B1-014
    - Tipo: error page headers
    - Rischio: basso

---

## 11. Stato working tree

**Git status post-audit:**

```text
## main...origin/main
?? docs/audits/B1_SEO_META_CANONICAL_H1_ROBOTS_AUDIT.md
```

- **Nessun codice applicativo modificato**
- **Unico file creato:** `docs/audits/B1_SEO_META_CANONICAL_H1_ROBOTS_AUDIT.md`
- **Nessun commit, nessun push, nessun deploy**
- **Comportamento Narrazioni:** invariato (solo audit)

---

*Report generato da Fase B1 read-only — iArtNET PROD 2026-06-06*
