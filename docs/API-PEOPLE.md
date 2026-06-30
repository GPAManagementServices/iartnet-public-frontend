# API People (frontend)

Il contratto dettagliato vive nel repo **Laravel/Filament** (`docs/API-PEOPLE.md` lato backoffice).

## Endpoint proxy Nuxt

`GET /api/people`

- Query: `locale` (`en` | `it`), opzionale `role` (whitelist backend; es. `research_unit_lead`). In caso di valore non ammesso il backend può rispondere **422**, propagata dal server route.
- Il server chiama `GET /v1/people?grouped=1&paginate=false&locale=…&category_slug=…` (+ `role` se presente).

## Payload normalizzato (`PeoplePagePayload`)

- **`mode: 'grouped'`**: `general_coordination`, `research_unit_leads`, `institutions` — ordine liste come restituito dall’API (non riordinare in UI salvo requisito esplicito).
- **`mode: 'legacy'`**: fallback se `grouped=1` non è disponibile o fallisce — stessa forma storica `iartnet` + `institutions[]`.

## Pagina People — blocchi istituzione (partner)

Solo le istituzioni classificate come **partner di progetto** (stessa logica della pagina Istituzioni, v. `server/api/institutions/index.get.ts`) hanno un blocco dedicato in People:

- categorie ammesse (slug EN o IT): `lead-institution`, `istituzione-principale`, `project-partner`, `partner-di-progetto`.
- Le istituzioni **associate member** o senza tali categorie **non** hanno blocco (restano fuori dalla griglia istituzionale).

Regole aggiuntive in UI:

- **CNAM**: mai blocco istituzione (comportamento storico); resta in anagrafica sulle card dove previsto.
- Se `institution.categories` è **vuoto**, la UI mantiene il blocco salvo esclusioni esplicite per nome/slug (es. OperaMeet Agency, AEC) — v. `shared/utils/institutionPartner.ts`.

In **legacy** mode, i Research Unit Lead ricavati dalle sotto-liste per istituzione rispettano lo stesso filtro di visibilità del blocco.

## Sezione Backup (piè pagina)

Visibile se c’è almeno una voce tra:

1. **`istituzioni_non_visualizzate`**: istituzioni presenti in `institutions[]` ma **senza** blocco (CNAM e/o non partner), con `Nome`, `Slug`, `Motivo`.
2. **`persone_non_visualizzate`**: persone presenti nel payload aggregate ma **non** assegnate ad alcuna sezione visibile (coordinamento globale, RUL, gruppi globali, blocchi istituzione visibili).

Il JSON mostrato in pagina ha la forma:

```json
{
  "istituzioni_non_visualizzate": [ { "Nome": "…", "Slug": "…", "Motivo": "…" } ],
  "persone_non_visualizzate": [ { "Nome": "…", "Ruolo": "…", "Istituzione": "…" } ]
}
```

## Tipi TypeScript

- `shared/types/people.ts` — `PeopleGroupedData`, `PeoplePagePayload`, `InstitutionGroupedWithPeople`
- `shared/types/api.ts` — `Person.role_key`, meta opzionali su `Institution` e pivot `institutions[]` sulla persona
- `shared/utils/peopleRoleMatch.ts` — matching `role_key` ↔ titoli i18n
- `shared/utils/institutionPartner.ts` — categoria partner per People + fallback esclusioni note
