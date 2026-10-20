# Decision log

## How AI was used

I used Cursor as a coding assistant while building this. Architecture and feature boundaries were mine. AI helped with boilerplate, repetitive wiring, and first drafts of tests; I reviewed every change, rewrote what did not fit, and ran typecheck, lint, and the Playwright suite myself.

Suggestions that did not earn their keep were cut: TanStack Query for save pending state, a second validation pass on export, and other layers that only duplicated the Zustand draft or the contracts schemas.

## Next.js instead of React Router

The brief allows React Router 7 in framework mode or Next.js with a server runtime. I started with React Router because the brief names loaders and actions. I switched to the Next.js 16 App Router once the API was done, because I know that model and I don't know React Router's framework mode well enough to defend it in review.

The server boundary did not change. A Server Component still loads the first configuration, and server code still holds the API key.

## Server Actions, no Route Handler

The editor is one page. Save, reload, and overwrite are Server Actions. Each one checks its input, calls the private Axios client, and returns a small result union (`saved`, `invalid`, `conflict`, `not_found`). Unexpected failures throw.

A Route Handler would only forward those same calls. It would also be a second place to get the API key wrong, so there isn't one. Axios stays on the server for the same reason: the browser talks to Next.js, and Next.js talks to Express.

## Zustand, then no TanStack Query

The draft, the last saved snapshot, and validation live in a Zustand store created for the page. Immer keeps the section updates readable. Selectors subscribe a control to its own slice, so a keystroke does not rerender the whole screen.

TanStack Query was added to track pending mutations. It didn't earn the dependency. The draft is the source of truth until save, so there was no server cache to keep fresh, and `useTransition` already exposes pending. The hook switches on the action result and opens the conflict dialog itself.

## What I didn't add

**Hey API.** The configuration client has get, create, and update. A generated SDK would track an OpenAPI file for three calls. The OpenAPI document is still published at `/docs` for people calling the service.

**React Hook Form.** The Zustand document is the form. A form library would keep a second copy and a second error map. Shared fields write into the store, and the contracts schema validates the document.

**A table per section.** The screen is saved and loaded as one document. `jsonb` stores that document. Splitting sections into rows would add joins and an order column without a query that needs them. A new section type is a variant on the shared Zod union, plus an editor and a preview.

## Concurrency

`PUT` updates the row only when `version` still matches, in one statement. A mismatch is `409`. The dialog lets you load the server copy or save your draft over it. Overwrite is a server action that reads the current version, then saves. If the row was deleted, that action creates it. Choosing Overwrite means your draft wins.

## With more time

- Autosave with a clear pending and failed state, still using the version check.
- A list of configurations instead of the single `default` id.
- A login for the editor. The API key protects the service, not the person using the page.
- Image upload instead of pasting a URL, with a size and type limit.
- Undo and redo for section edits, separate from the saved version.
