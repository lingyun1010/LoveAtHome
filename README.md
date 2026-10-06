# Love At Home website

An initial, maintainable website foundation for Love At Home, a Sydney home-care provider. The project pairs a responsive React homepage with a lightweight Express enquiry API in one repository.

## Stack

- Frontend: React, TypeScript and Vite
- Backend: Node.js, Express and TypeScript
- Shared: enquiry data contracts and service options

## Local development

Requirements: Node.js 20 or newer.

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
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google service account identity
- `GOOGLE_PRIVATE_KEY`: Google service account private key
- `LEAD_NOTIFICATION_EMAIL`: enquiry notification recipient
- `EMAIL_FROM`: approved sender address
- `EMAIL_PROVIDER_API_KEY`: API key for the future selected email provider

Never commit `.env` or credentials.

## Build and run

```bash
npm run typecheck
npm run build
NODE_ENV=production npm start
```

The production Express process serves `client/dist` and the `/api` routes from one Node.js application.

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

`POST /api/enquiries` validates the payload, generates a Lead ID and timestamp, maps the enquiry to the 19-column Google Sheet structure, then calls the Sheets and email service interfaces. Google Sheets persistence is the success boundary: the API does not return `201` unless the lead is persisted. Email is a secondary notification after persistence; a notification failure is logged and reported as `notificationSent: false` without asking the visitor to resubmit an already-saved lead. Both integrations remain unimplemented, so the API currently fails safely with `503` rather than reporting a false success.

## Future deployment

The intended production path is GitHub → Hostinger Managed Node.js Hosting → the Love At Home domain. Hostinger is hosting infrastructure only; this codebase does not use Hostinger Website Builder. Production hosting has not been configured or deployed.

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
