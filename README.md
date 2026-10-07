# Love At Home website

An initial, maintainable website foundation for Love At Home, a Sydney home-care provider. The project pairs a responsive React homepage with a lightweight Express enquiry API in one repository.

## Stack

- Frontend: React, TypeScript and Vite
- Backend: Node.js, Express and TypeScript
- Shared: enquiry data contracts and service options

## Local development

Requirements: Node.js 22 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the Express server at `http://localhost:3001`.

To preview a completed frontend build locally:

```bash
npm run build
npm run preview
```

## Environment variables

Copy `.env.example` to `.env` and populate values only when integrations are ready:

- `PORT`: Express port; defaults to `3001`
- `GOOGLE_SHEET_ID`: target lead-tracker spreadsheet
- `GOOGLE_SHEET_NAME`: target tab; defaults to `Leads`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google service account identity
- `GOOGLE_PRIVATE_KEY`: Google service account private key
- `HOSTINGER_MAIL_API_KEY`: mailbox-scoped Hostinger Mail API token
- `HOSTINGER_MAILBOX`: sending mailbox address
- `LEAD_NOTIFICATION_EMAIL`: enquiry notification recipient

Never commit `.env` or credentials.

## Build and run

```bash
npm run typecheck
npm run build
NODE_ENV=production npm start
```

The server build copies the Vite output into `server/dist/public`. The production Express process serves that colocated frontend artifact and the `/api` routes from one Node.js application.

## Architecture

```text
client/
  public/             SEO and favicon placeholders
  src/
    components/       Reusable UI building blocks
    data/             Editable homepage content
    pages/            Page composition
    sections/         Larger interactive sections
    styles/           Global design tokens and responsive styles
server/
  src/
    routes/           HTTP endpoints
    services/         Google Sheets and email boundaries
    validation/       Server-side request validation
shared/
  src/                Shared TypeScript contracts and service options
```

The homepage content is separated from component logic where practical so approved pricing, services and staff profiles can be added without restructuring the page.

## Enquiry flow

`POST /api/enquiries` requires a UUID `Idempotency-Key` header. The client creates it only after local validation, retains it across failed retries, and clears it after a fully successful submission. The API checks column T before appending: an existing Submission ID with identical material enquiry content reuses the stored Lead ID and retries the Hostinger notification without creating another row. Reusing the key with changed content returns `409 Conflict` rather than silently ignoring the correction.

The `Leads` tab must have this additional final column before deployment:

```text
T: Submission ID
```

The complete mapping is therefore 20 columns, A:T. Google Sheets remains the source of truth. The server serialises concurrent requests for the same key within one Node process, but Google Sheets does not provide an atomic unique constraint across multiple server processes. Two identical requests handled concurrently by separate instances still have a small read-before-append race window; eliminating that would require a transactional persistence layer or a different Sheet-side coordination mechanism.

Notification delivery state is not stored. If Hostinger accepts an email but the HTTP response is lost, a retry can send a second notification email. This Week 2 limitation can duplicate a notification, but it cannot create a second lead row.

## Future deployment

The intended production path is GitHub → Hostinger Managed Node.js Hosting → the Love At Home domain. Hostinger is hosting infrastructure only; this codebase does not use Hostinger Website Builder. Production hosting has not been configured or deployed.

Use these Hostinger production settings:

| Setting | Value |
| --- | --- |
| Node | `22.x` |
| Root | `./` |
| Install | `npm ci --include=dev` |
| Build | `npm run build` |
| Entry | `server/dist/index.js` |
| Output directory | Leave blank |
| Environment | `NODE_ENV=production` |

TypeScript, Vite and the other compilation tools intentionally remain development dependencies because the running server does not need them. A production-mode npm install omits development dependencies by default, so the explicit `--include=dev` is required during the Hostinger build phase. The production-build GitHub Actions workflow uses the same install and root build commands, checks the packaged server and frontend artifacts, and smoke-tests the health endpoint and static homepage without integration credentials.

## GitHub Pages client preview

`npm run build:pages` creates a static client-only review build at `client/dist` with the repository base path `/LoveAtHome/`. This build adds `noindex,nofollow` and changes the enquiry form to a clearly labelled preview response without making an API request. The workflow in `.github/workflows/deploy-pages.yml` deploys only this directory; the Express backend and backend environment variables are not included.

## Still required

- Approved Love At Home photography
- Team names, roles, qualifications, introductions and languages
- Approved featured rates and full pricing destination
- Public phone number and email address
- Public credentials, testimonials or reviews approved for use
- Final privacy policy and production domain
- Google Sheet credentials and final append implementation
- Selected email provider and notification implementation
- Production Open Graph image, canonical URL, robots and sitemap domain
- Future bilingual translations and internationalisation wiring
