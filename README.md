# Store Management Dashboard

A full-stack **Store Management Dashboard** for internal store operations — inventory, customers, cart checkout, orders, and admin analytics. Staff use this application to manage products and place sales on behalf of customers. It is a back-office / POS-style tool, not a public e-commerce storefront.

This repository is the **Angular frontend**. The companion .NET API lives in [ProductAPI](https://github.com/malakmahersoliman/ProductAPI).

---

## Overview

| | |
|---|---|
| **Type** | Internal store / back-office dashboard |
| **Frontend** | Angular 21 (standalone components) |
| **Backend** | ASP.NET Core 10 REST API ([ProductAPI](https://github.com/malakmahersoliman/ProductAPI)) |
| **Database** | SQL Server (via backend) |
| **Auth** | JWT Bearer tokens with role-based access |

### What you can do

- **Browse & search products** — filter by category, availability, and stock level
- **Manage catalog** (SuperAdmin) — create, edit, and delete products and categories
- **Manage customers** — maintain customer records used at checkout
- **Cart & checkout** — build an order from products, select a customer, and submit
- **Track orders** — view order history and details; admins can update status, delete, and manage all orders
- **Dashboard** (SuperAdmin) — aggregated stats for products, orders, customers, and users
- **Sales reports** (SuperAdmin) — date-range sales report with print support
- **User management** (SuperAdmin) — create and list staff accounts

---

## Architecture

```
┌─────────────────────────────────────┐
│   Store Management Dashboard        │
│   Angular SPA  ·  localhost:4200    │
│                                     │
│   Pages · Components · Services     │
│   Guards · Interceptors · Models    │
└──────────────┬──────────────────────┘
               │  HTTP + JWT
               ▼
┌─────────────────────────────────────┐
│   ProductAPI (.NET)                 │
│   localhost:5023/api                │
│                                     │
│   Controllers → MediatR (CQRS)      │
│   EF Core → SQL Server              │
└─────────────────────────────────────┘
```

### Frontend structure

```
src/app/
├── pages/           # Feature pages (lazy-loaded routes)
├── components/      # Reusable UI (navbar, product-card, pagination, filters)
├── services/        # HTTP clients and cart state
├── models/          # TypeScript interfaces and DTOs
├── guards/          # AuthGuard, RoleGuard
├── interceptors/    # JWT attachment and 401 handling
└── app.routes.ts    # Route definitions
```

### Key patterns

- **Standalone components** — no NgModules; lazy-loaded via `loadComponent`
- **Reactive forms** — login, product/customer forms, cart checkout
- **Angular signals** — cart state (`CartService`) with computed totals
- **RxJS** — HTTP observables; `shareReplay` caching for customers/categories
- **Route guards** — `AuthGuard` (logged in), `RoleGuard` (SuperAdmin only)
- **HTTP interceptor** — attaches `Authorization: Bearer <token>`; redirects on 401

---

## Roles & access

| Feature | User | SuperAdmin |
|---------|:----:|:----------:|
| View products & product details | ✓ | ✓ |
| Create / edit / delete products | | ✓ |
| Manage categories (page) | | ✓ |
| Filter products by category (dropdown) | ✓ | ✓ |
| View customers | ✓ | ✓ |
| Create / edit customers | ✓ | ✓ |
| Delete customers | | ✓ |
| Cart & checkout | ✓ | ✓ |
| View orders list | ✓ | ✓ |
| View order details (read-only) | ✓ | ✓ |
| Update / delete orders | | ✓ |
| Dashboard statistics | | ✓ |
| Sales reports | | ✓ |
| User management | | ✓ |

> **Note:** Regular users see their own orders in the list (filtered by the API). SuperAdmins see all orders and get admin action buttons. Category names are available to all staff via the product filter; only SuperAdmins can open the Categories management page.

---

## Routes

| Path | Description | Guard |
|------|-------------|-------|
| `/login` | Sign in | — |
| `/dashboard` | Admin statistics | Auth + Role |
| `/categories` | Category management | Auth + Role |
| `/products` | Product catalog | Auth |
| `/products/new` | Add product | Auth + Role |
| `/products/:id` | Product details | Auth |
| `/products/:id/edit` | Edit product | Auth + Role |
| `/customers` | Customer list | Auth |
| `/customers/new` | Add customer | Auth |
| `/customers/:id/edit` | Edit customer | Auth |
| `/cart` | Shopping cart & checkout | Auth |
| `/orders` | Order list | Auth |
| `/orders/:id` | Order details | Auth |
| `/orders/new` | Redirects to `/cart` | — |
| `/reports` | Sales report | Auth + Role |
| `/users` | User list | Auth + Role |
| `/users/new` | Create user | Auth + Role |

---

## Services

| Service | API base | Purpose |
|---------|----------|---------|
| `AuthService` | `/api/auth` | Login, session (localStorage) |
| `ProductService` | `/api/products` | Product CRUD, pagination, filters |
| `CategoryService` | `/api/categories` | Category CRUD (cached) |
| `CustomerService` | `/api/customers` | Customer CRUD (cached) |
| `OrderService` | `/api/orders` | Orders list, create, status update |
| `StatisticsService` | `/api/statistics` | Dashboard aggregates |
| `ReportService` | `/api/reports` | Sales reports by date range |
| `UserService` | `/api/users` | User list and create |
| `CartService` | — (local) | Cart state, localStorage persistence |

API URL is configured in `src/environments/environment.ts`:

```typescript
apiUrl: 'http://localhost:5023/api'
```

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [ProductAPI](https://github.com/malakmahersoliman/ProductAPI) running on `http://localhost:5023`
- SQL Server configured for the backend

### Install & run

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200). The app redirects to `/login`.

### Build

```bash
npm run build
```

Output: `dist/product-dashboard/`

### Tests

```bash
npm test
```

Uses [Vitest](https://vitest.dev/) via Angular's unit test builder.

---

## Typical workflow

1. **Log in** with email and password → JWT stored in `localStorage`
2. **Browse products** → add items to cart (quantities respect stock)
3. **Open cart** → select customer, payment method, place order
4. **Backend** validates stock, decrements inventory, creates order in a transaction
5. **Orders page** shows history (users see their own; admins see all and can manage status)
6. **Dashboard** (admin) shows store-wide metrics; **Reports** generates printable sales summaries

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Angular 21 |
| Language | TypeScript 5.9 |
| HTTP | `@angular/common/http` |
| Forms | Reactive Forms |
| State | Signals (cart), RxJS (HTTP) |
| Routing | Angular Router (lazy loading) |
| Testing | Vitest |
| Styling | Custom CSS design system (`src/styles.css`) |

---

## Related repository

**Backend:** [ProductAPI](https://github.com/malakmahersoliman/ProductAPI) — ASP.NET Core REST API with JWT auth, EF Core, MediatR CQRS, and FluentValidation.

Both projects together form the **Store Management Dashboard** full-stack application.
