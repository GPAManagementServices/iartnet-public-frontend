# Backoffice Laravel / Filament — Activity attachments (PDF)

Prompt da condividere con il team che cura API e pannello Filament per allineare il contratto al frontend Nuxt.

---

## Contesto

Il frontend **usa esclusivamente** il campo **`attachments`** (array) sulla risorsa Activity. Il campo stringa **`attachment`** (path singolo legacy), se ancora presente nel JSON, **non viene letto** dall’interfaccia: nessun fallback tra i due.

L’etichetta mostrata in UI e nel titolo del dialog PDF è:

1. `attachments[].title` se valorizzato (trim non vuoto),
2. altrimenti il **nome file** ricavato da `path` (ultimo segmento dopo `/`, URI-decoded),
3. altrimenti l’ultimo segmento dell’`url`,
4. altrimenti una stringa generica `"Document"`.

## Contratto atteso (`GET /v1/activities/{id}` e payload per slug)

- **`attachments`**: array (può essere vuoto). Ogni elemento:

| Campo       | Tipo           | Obbligatorio | Note |
|------------|----------------|--------------|------|
| `id`       | int            | sì           | Stabile per chiavi Vue |
| `url`      | string (URL)   | sì           | URL **assoluto** raggiungibile dal browser del visitatore (produzione: dominio pubblico HTTPS, non solo `localhost`) |
| `path`     | string         | sì           | Path storage relativo (es. `activities/attachments/foo.pdf`) — usato per fallback nome file |
| `title`    | string \| null | no           | Titolo editoriale; se `null`/vuoto → fallback nome file |
| `mimeType` | string         | sì           | Per i PDF il frontend filtra `application/pdf` |

- **`attachment`** (stringa path): opzionale per retrocompatibilità storage; **non richiesto** dal frontend e **ignorato** per la lista documenti.

## Requisiti infrastrutturali

1. **Accesso HTTP (evitare 403 su `/storage/...`)**: i file sotto `storage` devono essere serviti dal web server (es. symlink `public/storage` in Laravel, regole Nginx per `storage` o route firmata). Un **403 Forbidden** diretto su `GET /storage/activities/attachments/…` impedisce a PDF.js di caricare il documento dal browser.
2. **CORS**: se il PDF è servito da un host diverso dal sito Nuxt, la risposta deve consentire `GET` da origine frontend (o esporre i file dietro stesso dominio / proxy).
3. **Content-Type**: `application/pdf` per gli URL in `attachments` di tipo PDF.
4. **Sicurezza**: URL firmati o token se necessario; evitare path interni non pubblicabili in `url`.

## Suggerimenti Filament

- Relazione / repeater **Attachments** con upload su disk pubblico o URL generato via accessor che rispecchia l’ambiente (APP_URL in prod).
- Campo **title** opzionale per ogni file; in assenza, il nome file originale è sufficiente per l’UX.
- Non basare l’editor solo sul campo singolo `attachment` se il prodotto richiede più PDF per activity.

## Verifica rapida (QA)

- Activity senza `attachments` o array vuoto → nessun blocco “Documenti” in pagina dettaglio.
- Activity con 2+ PDF → carosello anteprime + apertura dialog per ciascuno.
- PDF con `title: null` → in UI compare il nome file da `path`/`url`.

---

*Riferimento implementazione frontend: `ActivityAttachmentsSection.client.vue`, `shared/utils/activityAttachment.ts`, tipo `ActivityAttachment` in `shared/types/api.ts`.*
