# Home screen editor

A small editor for a mobile app home screen. The page shows the sections beside a phone preview, and the preview updates as you type. Saving goes through a private configuration API. Reloading the page restores the last save.

The screen is one document made of three section types: an image carousel, a text block, and a call-to-action button. Sections can be added, reordered, and removed.

<img width="418" height="335" alt="image" src="https://github.com/user-attachments/assets/6f8eef01-bad6-4fbb-9805-8785b2a5a8d0" />

## Architecture

The browser never sees the API key. Next.js loads and saves on the server, and only the Express service talks to Postgres.

```mermaid
flowchart LR
  Browser["Browser: editor and Zustand draft"]
  subgraph webApp [apps/web Next.js]
    Page[Server Component]
    Actions[Server Actions]
    Client["Axios client, holds the API key"]
  end
  subgraph apiApp [apps/api Express]
    Auth[API key check]
    Service[configurations service]
  end
  DB[(Postgres jsonb)]
  Contracts[packages/contracts]
  Browser --> Page
  Browser --> Actions
  Page --> Client
  Actions --> Client
  Client -->|"x-api-key, /v1"| Auth --> Service --> DB
  Contracts -.-> webApp
  Contracts -.-> apiApp
```

`packages/contracts` is the shared Zod schema for a configuration, its sections, and the API error body. Both apps import it as TypeScript source.

`version` is the save counter used for optimistic concurrency. `schemaVersion` describes the shape of the document and is stamped on JSON exports.

## Prerequisites

- Node.js 22 (see `.nvmrc`)
- pnpm 11.17 (`corepack enable` uses the version in the root `package.json`)
- Docker, for the database or for the full stack

## Run with Docker

From the repository root:

```sh
docker compose up --build
```

- Editor: http://localhost:3000
- API docs: http://localhost:3001/docs

The API applies migrations and inserts the `default` home screen on startup. Postgres is published on host port **55432** so it does not take a local server on 5432.

`API_KEY` and `CONFIG_SERVICE_API_KEY` default to the placeholder in `.env.example`. Compose reads a root `.env` when you want a different value. The web container always calls the API at `http://api:3001`, not the URL in `.env`.

## Run on the host

```sh
pnpm install
cp .env.example .env
docker compose up postgres -d
pnpm dev
```

On Windows PowerShell, copy the example with `Copy-Item .env.example .env`.

`pnpm dev` starts the API on port 3001 and the web app on port 3000. The API migrates and seeds itself. `pnpm db:migrate` and `pnpm db:seed` are there if you want to run those steps by hand.

To start them separately, use two terminals from the repository root:

```sh
pnpm --filter @reactiv/api dev
pnpm --filter @reactiv/web dev
```

Both commands read the root `.env`. The API is http://localhost:3001 and the editor is http://localhost:3000.

Without Docker, install Postgres 17 and create the role and database the example URL expects. The API creates the table and the default screen. It does not create the database.

```sh
psql -U postgres -c "CREATE USER reactiv WITH PASSWORD 'reactiv';"
psql -U postgres -c "CREATE DATABASE reactiv OWNER reactiv;"
```

A local server listens on port 5432, so point `DATABASE_URL` at it before starting the API. The example file uses 55432, which is the Docker mapping.

```
DATABASE_URL=postgres://reactiv:reactiv@localhost:5432/reactiv
```

## Environment

One `.env` at the repository root. The API and the web app both read that file, including when a script starts inside `apps/api` or `apps/web`. A variable already set in the environment is left as it is.

### Configuration service

| Variable            | Required | Default   | Purpose                                                |
| ------------------- | -------- | --------- | ------------------------------------------------------ |
| `PORT`              | no       | `3001`    | HTTP port                                              |
| `DATABASE_URL`      | yes      |           | Postgres connection URL                                |
| `API_KEY`           | yes      |           | At least 16 characters. Sent by clients as `x-api-key` |
| `LOG_LEVEL`         | no       | `info`    | Pino level                                             |
| `DEFAULT_CONFIG_ID` | no       | `default` | Id seeded on startup                                   |

### Web app

These are server-only. They are not exposed to the browser.

| Variable                 | Required | Default   | Purpose                               |
| ------------------------ | -------- | --------- | ------------------------------------- |
| `CONFIG_SERVICE_URL`     | yes      |           | Base URL of the configuration service |
| `CONFIG_SERVICE_API_KEY` | yes      |           | Same secret as `API_KEY`              |
| `DEFAULT_CONFIG_ID`      | no       | `default` | Configuration loaded by the home page |

## Tests

```sh
pnpm test
pnpm typecheck
pnpm lint
```

`pnpm test` runs Vitest in `packages/contracts`, `apps/api`, and `apps/web`. API integration tests use PGlite, so they do not need Postgres.

The browser suite starts its own API and web servers:

```sh
pnpm --filter @reactiv/web test:e2e
```

Playwright expects Postgres at `127.0.0.1:55432` unless `DATABASE_URL` is already set. `docker compose up postgres -d` provides that database.

## API

Interactive reference: [http://localhost:3001/docs](http://localhost:3001/docs). The OpenAPI document is at `/openapi.json`.

Every `/v1` route requires the header `x-api-key`. `/health`, `/docs`, and `/openapi.json` are public.

| Method | Path                     | Success                                                 |
| ------ | ------------------------ | ------------------------------------------------------- |
| `GET`  | `/health`                | `200` `{ "status": "ok" }`                              |
| `GET`  | `/v1/configurations/:id` | `200` configuration                                     |
| `POST` | `/v1/configurations`     | `201` configuration, `Location: /v1/configurations/:id` |
| `PUT`  | `/v1/configurations/:id` | `200` configuration                                     |

`POST` accepts `{ "id"?: string, "data": { "sections": [...] } }`. `PUT` accepts `{ "version": number, "data": { "sections": [...] } }` and replaces the whole document. The update matches `version` in SQL, so two saves cannot both win.

Errors use one body:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "...",
    "details": [{ "path": "version", "message": "..." }]
  }
}
```

| Status | Code               |
| ------ | ------------------ |
| `400`  | `VALIDATION_ERROR` |
| `401`  | `UNAUTHORIZED`     |
| `404`  | `NOT_FOUND`        |
| `409`  | `CONFLICT`         |
| `413`  | `VALIDATION_ERROR` |
| `500`  | `INTERNAL`         |

`details` lists the fields that failed validation. A malformed body and a body over 1 MB do not include it.

## Storage

The configuration is one row: id, schema version, concurrency version, timestamps, and a `jsonb` document. The editor always reads and writes the whole screen, so the database stores the same document the UI edits.

SQLite would be enough for a single-user demo and would remove the Postgres process. Postgres is a closer match to a configuration service another team would call, and `jsonb` keeps the document queryable without a table per section.

An in-memory repository exists for service tests. It is not the running store.

Normalized section tables would add joins and ordering columns for a document that is only ever saved as a whole. The section `type` union in `packages/contracts` is the extension point: a new section is a schema, an editor, and a preview.

## Assumptions

- There is one home screen, id `default`, created at API startup. The API can store other ids, and the editor does not list them.
- If someone else saved first, the dialog offers **Reload latest** or **Overwrite**. Overwrite keeps your draft and saves it on top of the version stored now. That is last-saved-wins, chosen explicitly.
- Carousel images are `http` or `https` URLs. The app does not upload files.
- An import must be JSON, at most 1 MB, and a schema version this app can migrate. The current export version is 1.
