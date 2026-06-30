# Come contribuire a IARTNET Frontend

Grazie per l’interesse nel contribuire. Segui queste linee guida per PR e commit.

## Setup

```bash
pnpm install
pnpm run dev
```

Vedi [README.md](README.md) per dettagli.

## Convenzioni

### Commit

Usa [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nuova funzionalità
- `fix:` correzione bug
- `refactor:` refactoring senza cambio di comportamento
- `docs:` documentazione
- `chore:` manutenzione (build, tooling, dipendenze)
- `test:` test

Esempi: `feat(people): add filters`, `fix(api): handle empty response`.

### Pull Request

1. Crea un branch da `main` (es. `feat/nome-feature` o `fix/issue-123`).
2. Includi nel PR:
   - Riferimento a requisito/user story/ticket (o ID interno), se applicabile.
   - Elenco dei file principali modificati, test aggiunti e come verificare.
   - Se ci sono migrazioni o cambi di comportamento: istruzioni di rollout/rollback e criteri di accettazione.
3. Assicurati che il lint passi: `pnpm run lint` (eventualmente `pnpm run lint:fix`).

### Architettura

- Rispetta i confini del dominio; non modificare concetti core senza un ADR.
- Le integrazioni esterne (API, import, storage) restano isolate in servizi dedicati.
- Preferisci modifiche piccole e verificabili: una PR = una slice verticale.

## Domande

Apri una [Issue](https://github.com/GPAManagementServices/iartnet_frontend/issues) per domande o proposte.
