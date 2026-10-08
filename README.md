# Ricemania

Ordering site for Ricemania, a Sri Lankan rice and curry kitchen in Colombo.
Customers browse the menu, build an order and follow it through the kitchen;
staff manage the menu and move orders along from an admin panel.

Built with Next.js 16 (App Router), MongoDB via Mongoose, and Tailwind CSS v4.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI and JWT_SECRET
npm run dev
```

The site runs on <http://localhost:3002>.

### Environment

| Variable      | Purpose                                                     |
| ------------- | ----------------------------------------------------------- |
| `MONGODB_URI` | Mongo connection string (Atlas, local, or the compose host) |
| `JWT_SECRET`  | Signs auth tokens — `openssl rand -base64 32`               |

## Creating the first admin

Registration always creates a customer account. To promote one to admin:

```bash
node scripts/make-admin.mjs you@example.com
```

Sign out and back in afterwards so the new role is picked up. Admins see an
**Admin Panel** button in the header and land on `/admin` after signing in.

## Structure

```
app/
├─ (site)/          public site — home, menu, checkout, orders, about, contact
├─ admin/           admin panel — dashboard, orders, foods, categories
├─ api/             route handlers (auth, foods, categories, cart, orders, upload)
├─ components/      shared UI
├─ lib/             API client, server-side data reads, formatting, types
├─ models/          Mongoose schemas
└─ providers/       auth, cart and toast context
```

Food photos uploaded from the admin panel are written to `public/uploads`
and served from `/uploads/...`. Dishes without a photo fall back to a
generated illustration, so the menu never shows a broken image.

## Availability

The kitchen cooks to order, so dishes are not inventory-counted. Each dish is
simply **serving** or **off today**, flipped from a switch on the admin menu
table. A dish that is off shows as unavailable on the site and cannot be added
to a cart or ordered — including one already sitting in someone's cart.

## Order lifecycle

`pending → approved → preparing → ready → completed`, with `cancelled`
reachable from `pending` and `approved`. The admin UI only offers transitions
the API allows.

## Deploying

```bash
docker compose up --build
```

Compose reads `.env.local` from the host and keeps uploaded images in a
named volume so they survive rebuilds.

## Checks

```bash
npx tsc --noEmit    # types
npm run lint        # eslint
npm run build       # production build
```
