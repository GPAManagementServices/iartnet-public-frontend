# IARTNET Frontend

Public Nuxt 3 (SSR/Nitro) portal for the IARTNET platform (Accademia di Brera).

## Prerequisites

- Node.js 20+
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env
```

Configure `NUXT_PUBLIC_*` URLs for CMS, ingestion, and IIIF (see `.env.example`).

## Development

```bash
pnpm run dev
```

## Production build

```bash
pnpm run build
```

## Suite

Part of IARTNET multi-repo suite — see `iartnet-suite` for architecture and deployment order.

## License

GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).

Copyright (c) 2026 Accademia di Brera / GPA Management Services. See [LICENSE](LICENSE).

Node/pnpm dependency licenses: [THIRD_PARTY-NPM.md](THIRD_PARTY-NPM.md).
