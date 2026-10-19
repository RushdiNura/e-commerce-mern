# TechZone — UI/UX + bug-fix pack

Copy each file into the same path in your project (client/… and server/…), then redeploy.

## Why text was invisible (the login problem)
Half the app used `dark:` classes (which follow the visitor's OS dark mode) and half did not.
In OS dark mode the page went near-black while many headings/labels stayed dark grey, and
`<select>` options / browser autofill drew white-on-white. Fix: every colour now comes from
design tokens in `src/index.css` (one light + one dark value, all contrast-checked), dark mode
is a manual toggle in the navbar (remembers choice, defaults to the OS), and inputs, dropdown
options and autofill are styled explicitly.

## Bugs fixed
- Cart called `http://localhost:5000` (broken in production) -> uses the shared API client.
- Login saved `user`, but Navbar/ProtectedRoute/AuthContext read `currentUser` -> you looked logged-out and /admin bounced you to login. One session store now.
- `<Toaster />` was never rendered, so no toast ever appeared (add to cart, errors...). Added.
- Navbar "My Orders" linked to `/myorder` (route is `/my-orders`); product-card title linked to `/products/:id` (doesn't exist). Fixed + old links redirect.
- Order success page crashed (`orders` undefined). Rewritten.
- Cart "Proceed to checkout" went to `/orders`; checkout is now `/checkout`. After ordering, the cart no longer shows a false "Failed to clear cart".
- Reviews on the product page were fake (lost on refresh). Now saved through the API.
- Payment method was always saved as "Card"; now the chosen one is sent.
- Logout never removed the token and called the wrong HTTP method. Fixed.
- Token and email were printed to the browser console. Removed.
- Anyone could sign up as **admin** from the login form. Removed (and blocked on the server, see below).
- Admin: edit/delete buttons only appeared on hover (unusable on phones); new product showed a raw category ID. Fixed.
- Removed the false "confirmation email sent" message, dead footer links, and the TechZone/TechMart name mismatch (`BRAND` in `src/config.js`).

## UI/UX improvements
Dark/light toggle, responsive navbar with mobile menu, hero CTA + category shortcuts, skeleton loaders,
URL-synced search/filter/sort/pagination, product image gallery + quantity picker + breadcrumbs, cart with stock limits and
confirm dialogs, validated checkout with inline errors, order history with status badges, admin stats + search + image previews,
404 page, error boundary, accessible labels/focus states, "server is waking up" message for slow first loads.

## Server files (3 small patches) — redeploy the server too
- `server/routes/productRoutes.js`: removed duplicate review routes that shadowed the real ones (this is why posting/deleting reviews failed).
- `server/controllers/auth.js`: sign-up always creates a normal user (blocks self-made admins).
- `server/controllers/cartController.js`: no more 500 for every cart when an admin deletes a product; also checks stock.

## Seed
`server/seed.js` — from the server folder: `node seed.js` (safe to re-run) or `node seed.js --fresh` (wipes products/categories/carts/orders first).
Creates 4 categories, 14 products with reviews, an admin, a demo customer and 3 demo orders.
Default logins are printed when it finishes — set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in server/.env first, and change the admin password afterwards.

## Hosting
React Router needs a fallback so refreshing /products doesn't 404: `client/public/_redirects` (Netlify) or `client/vercel.json` (Vercel). Keep the one for your host.
Set `VITE_API_URL` in your host's environment settings (a `.env` inside `src/` is not read by Vite; it must be in `client/`).

## Not changed (needs your decision / real work)
- **No payment is actually processed.** Card/PayPal are only recorded on the order (Stripe code exists on the server but isn't connected to the UI).
- No admin screen for orders, and no email sending.
- `FloatingCart.jsx`, `Demo.jsx`, `Filters.jsx`, `Checkout.jsx`, `RatingSystem.jsx`, `OrderContext.jsx` are no longer used; you can delete them.
