# Inventory Management System — Foundation

This is the **foundation layer** of the full system: project setup, Supabase
schema, authentication, and role-based access control, wired end-to-end.
Every later module (Inventory, Receiving, Orders, Warehouse, Sales, Returns,
Reports) plugs into this same pattern.

```
inventory-system/
├── backend/     Node.js + Express API
└── frontend/    React + Vite app
```

## 1. Set up Supabase

1. Open your Supabase project → **SQL Editor**.
2. Run `backend/database/001_foundation_schema.sql`. This creates:
   - `roles`, `users`, `user_roles`, `audit_logs`
   - Row Level Security policies (reads are RLS-protected; writes go through
     the backend's service-role key, so role changes can't be made directly
     from the browser).
3. In **Project Settings → API**, copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this secret — backend only)

## 2. Backend

```bash
cd backend
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev             # http://localhost:4000
```

Endpoints included in this foundation:

| Method | Path                | Access          | Purpose                    |
|--------|---------------------|-----------------|-----------------------------|
| POST   | /api/auth/signup    | public          | Create account (default role: operational_staff) |
| POST   | /api/auth/signin    | public          | Sign in, returns session + roles |
| POST   | /api/auth/signout   | authenticated   | Sign out                   |
| GET    | /api/auth/me        | authenticated   | Current user + roles       |
| GET    | /api/users          | admin, manager  | List users                 |
| PATCH  | /api/users/:id/active | admin         | Activate/deactivate a user |
| GET    | /api/roles          | admin, manager  | List roles                 |
| POST   | /api/roles/assign   | admin           | Assign a role to a user    |
| POST   | /api/roles/remove   | admin           | Remove a role from a user  |

## 3. Frontend

```bash
cd frontend
cp .env.example .env   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev              # http://localhost:5173
```

What's wired up:
- Sign up / sign in / sign out against the backend, session held by Supabase Auth client-side.
- `AuthContext` exposes `user`, `roles`, `hasRole()`.
- `ProtectedRoute` (must be logged in) and `RoleRoute` (must have an allowed role).
- Sidebar navigation filters itself by role (`src/utils/permissions.js`).
- `/users` page (admin-only): toggle roles per user, activate/deactivate accounts.

## 4. First admin user

New sign-ups default to `operational_staff`. To create your first admin,
after signing up once, run this in the Supabase SQL editor:

```sql
insert into user_roles (user_id, role_id)
select u.id, r.id
from users u, roles r
where u.email = 'you@example.com' and r.name = 'admin';
```

## 5. What's next

Each remaining module (Inventory, Receiving, Barcode, Orders, Warehouse,
Sales, Returns, Reports) follows the same layered pattern already in place:

```
Route → Middleware (auth + role) → Controller → Service → Supabase
```

Add a migration file per module (e.g. `002_inventory_schema.sql`), a
service/controller/route trio in the backend, and a page/service pair in the
frontend, then register the route in `app.js` and the nav item in
`permissions.js`.
"# RedIndianCustoms" 
