# Stadt Assistant Wermelskirchen

Production-ready Next.js 16+ PWA for municipal information and local services.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Usage](#usage)

## Prerequisites

- Node.js 24 LTS
- pnpm 10+

## Quickstart

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000` in your browser.

## Usage

Run quality checks:

```bash
pnpm run lint
pnpm run test
pnpm run build
```

Required environment variables:

- `NODE_ENV`
- `APP_BASE_URL`
- `WASTE_API_BASE_URL`
- `WASTE_API_KEY`
