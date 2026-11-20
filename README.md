# Store Rating Management System

A full-stack, enterprise-grade web application that allows customers to explore registered stores, submit and modify ratings on a scale of 1 to 5, and enables store owners and system administrators to manage stores, users, and analyze customer feedback with role-based access control (RBAC).

Built based on the **FullStack Intern Coding Challenge** specification.

---

## 🚀 Technology Stack

### Frontend
- **React.js (v18)** – Modern component-driven UI
- **Vite** – High-performance build tool and dev server
- **Tailwind CSS** – Utility-first CSS framework for clean, responsive design
- **React Router DOM (v6)** – Declarative client-side routing & route protection
- **Axios** – HTTP client with request/response interceptors for JWT
- **React Hook Form** – Performant form state and submission handling
- **Zod** – Schema-based type-safe validation
- **Lucide React** – Clean, modern UI iconography

### Backend
- **Node.js** & **Express.js** – RESTful API architecture
- **JWT (JSON Web Tokens)** – Stateless session authentication
- **bcryptjs** – Secure password hashing with salt rounds
- **Zod** – Request body and query validation middleware

### Database & ORM
- **MySQL** (v8.0+) – Relational database with UUID keys, ENUMs, foreign keys, and unique constraints
- **Prisma ORM** – Type-safe database client, schema migrations, and dynamic aggregations

---

## 👥 User Roles & Access Control

All users authenticate through a **single common login page (`/login`)**. After successful login, users are automatically routed to their designated dashboard according to their database-stored role:

1. **System Administrator (`SYSTEM_ADMIN`)**
   - **Dashboard**: Displays real-time database-driven platform metrics (Total Users, Total Stores, Total Ratings Submitted).
   - **Manage Stores**: List registered stores, dynamic overall ratings, owner associations, search by store name/email/address, ascending/descending column sorting, and pagination.
   - **Add Store**: Register new stores with name, contact email, address, and optional store owner association.
   - **Manage Users**: View all platform users (administrators, normal users, store owners), filter by name, email, address, role, sort ascending/descending, view user details (including store rating if the user is a store owner).
   - **Add User**: Create admin, normal user, or store owner accounts with strict validations.
   - **Change Password**: Update credentials securely.
   - **Logout**: Invalidate session.

2. **Normal User (`NORMAL_USER`)**
   - **Registration**: Self-service signup (`/register`) with automatic assignment to `NORMAL_USER` role.
   - **Dashboard**: Overview of available stores and feedback stats.
   - **Browse Stores**: Search stores by name and address, sort by rating/name/address, view overall star ratings, and view the user's submitted rating.
   - **Submit & Modify Ratings**: Interactive 1–5 star rating modal. *Business Rule*: Users can submit only one rating per store; submitting again updates the existing rating (enforced via database unique constraint on `(userId, storeId)` and Prisma `upsert`).
   - **My Ratings**: View all stores rated by the user with option to edit.
   - **Change Password & Logout**.

3. **Store Owner (`STORE_OWNER`)**
   - **Dashboard**: Live average rating of their owned store (dynamically aggregated from MySQL), total reviews received, and 1-to-5 star rating distribution bar chart.
   - **Store Ratings**: View list of verified customers who rated their store (User Name, Email, Rating, Date) with search and sorting. *Security*: Store owners can strictly access only ratings belonging to their store.
   - **Change Password & Logout**.

---

## 🔐 Form Validation Rules

Enforced on both **Frontend (React Hook Form + Zod)** and **Backend (Express + Zod Middleware)**:

| Field | Rule | Error Message / Enforcement |
|---|---|---|
| **Name** | Min 7 chars, Max 60 chars | "Name must be at least 7 characters long" (max 60) |
| **Address** | Max 400 chars (optional for customer sign-up) | "Address must not exceed 400 characters" |
| **Password** | 8 to 16 chars, ≥1 uppercase, ≥1 special character | "8-16 characters, must include at least one uppercase letter and one special character" |
| **Email** | Standard RFC email format | "Please enter a valid email address" |
| **Rating** | Integer 1 to 5 | "Rating must be an integer between 1 and 5" |

---

## 📦 Project Structure

```text
StoreRatingApp/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── common/         # Navbar, Sidebar, StarRating, Modal, Pagination, LoadingSpinner
│   │   ├── context/            # AuthContext (JWT & User state), ToastContext
│   │   ├── hooks/              # useAuth, useToast custom hooks
│   │   ├── layouts/            # DashboardLayout (Role-aware sidebar & header)
│   │   ├── pages/              # Role-specific and auth pages
│   │   │   ├── admin/          # AdminDashboard, AdminStoreList, AdminAddStore, AdminUserList, AdminAddUser
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── common/         # ChangePasswordPage, NotFoundPage
│   │   │   ├── owner/          # OwnerDashboard, OwnerRatings
│   │   │   └── user/           # UserDashboard, BrowseStores, MyRatings
│   │   ├── routes/             # AppRoutes, ProtectedRoute (RBAC guards)
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Axios API modules (auth, admin, store, rating, owner)
│   │   ├── App.jsx             # Root application component
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # Application entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Express.js REST API Backend
│   ├── prisma/
│   │   ├── migrations/         # MySQL Prisma migrations
│   │   ├── schema.prisma       # Database schema (MySQL provider, UUIDs, Foreign Keys, Indexes)
│   │   └── seed.js             # Seed script (Admin, Owners, Users, Stores, Ratings)
│   ├── src/
│   │   ├── controllers/        # auth, admin, store, rating, owner controllers
│   │   ├── middleware/         # JWT authenticate, authorize RBAC, validate, errorHandler
│   │   ├── routes/             # auth, admin, store, rating, owner routes
│   │   ├── utils/              # jwt helpers, bcrypt password hashing
│   │   ├── validators/         # Zod schemas for backend request validation
│   │   ├── prisma.js           # Prisma client singleton
│   │   └── server.js           # Express app setup and route mounting
│   ├── .env                    # Backend environment configuration
│   ├── .env.example
│   ├── package.json
│   └── test-all-features.js    # Automated 16-point test suite
│
├── README.md                   # Complete documentation
└── .gitignore
```

---

## ⚙️ Installation & Setup Instructions

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **MySQL**: v8.0 or higher running on port `3306`

### 2. Configure MySQL Database
Log into MySQL and create the `storerating` database:
```sql
CREATE DATABASE IF NOT EXISTS storerating CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL="mysql://root:your_password@localhost:3306/storerating"
   JWT_SECRET="super-secret-jwt-key-store-rating-2024"
   JWT_EXPIRES_IN="7d"
   NODE_ENV="development"
   ```
   *(Note: If your MySQL password contains special characters like `@`, URL-encode it, e.g. `%40`.)*

4. Run Prisma database migrations:
   ```bash
   npx prisma migrate dev
   # or for production deployment:
   # npx prisma migrate deploy
   ```
5. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
6. Seed initial data (admin, store owners, users, stores, ratings):
   ```bash
   npm run prisma:seed
   ```
7. Start backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *Backend will run on `http://localhost:5000`.*

### 4. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`.*

---

## 🔑 Sample Development Login Credentials

All users log in through the **common login page**: `http://localhost:5173/login`.

| Role | Email | Password | Pre-linked Store |
|---|---|---|---|
| **System Administrator** | `admin@storerating.com` | `Password@123` | N/A (Admin of all) |
| **Store Owner (Alice)** | `alice.owner@store.com` | `Password@123` | Apex Super Tech Electronics |
| **Store Owner (Robert)** | `robert.owner@store.com` | `Password@123` | Green Valley Organic Foods |
| **Store Owner (Clara)** | `clara.owner@store.com` | `Password@123` | Heritage Books and Stationery |
| **Normal User (David)** | `david.user@example.com` | `Password@123` | N/A (Customer) |
| **Normal User (Emma)** | `emma.user@example.com` | `Password@123` | N/A (Customer) |

*(Quick 1-click Demo Account buttons are also provided directly on the Login screen for testing convenience.)*

---

## 🧪 Automated Testing

The project includes an end-to-end automated verification script covering all functionalities:

```bash
cd server
node test-all-features.js
```

### Verified Test Cases:
1. Normal user registration with name, optional address, and password rules.
2. Common login for all three roles (`SYSTEM_ADMIN`, `NORMAL_USER`, `STORE_OWNER`).
3. Dynamic admin dashboard statistics (Users, Stores, Ratings) from MySQL.
4. Admin creating users (Admin, Normal User, Store Owner).
5. Admin creating stores and associating store owner accounts.
6. Admin viewing store and user listings.
7. Search and filtering (Name, Email, Address, Role).
8. Ascending and descending dynamic sorting on backend data.
9. Normal user submitting 1–5 star ratings.
10. Normal user modifying submitted ratings.
11. Duplicate rating prevention via database unique constraint on `(userId, storeId)`.
12. Dynamic average rating calculation via database aggregation (no duplicate storage).
13. Store owner viewing customer reviews for their store.
14. Store owner data isolation (blocked from administrative routes).
15. Password change with current password validation and new password strength checks.
16. Input validation rejection for invalid emails, short names, weak passwords, and out-of-range ratings.
17. Unauthorized access prevention without valid JWT.
