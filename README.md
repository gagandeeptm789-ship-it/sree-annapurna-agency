# SREE ANNAPURNA AGENCY — FMCG Wholesale & Distribution Platform

A complete, production-ready full-stack platform for **Sree Annapurna Agency**, an authorized wholesale distributor and stockist for premier FMCG brands including **Swastik Pickles & Masalas**, **Rala Food Specialists**, **Monkey 555**, **Monkey VVV**, **Aruna Masala**, and **Deeppam Aarti**.

---

## ⚠️ Windows PowerShell Notice: Fixing `npm.ps1` Execution Error

If you encountered the following error in your terminal:
```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

### ✅ Permanent Solution (Run once in PowerShell):
Run this single command in your PowerShell terminal:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
*Press `Y` when prompted. This allows local scripts created on your computer (like `npm`, `npx`, `nodemon`) to run safely.*

### ⚡ Quick Alternative (Without changing settings):
Add `.cmd` to any npm command:
```powershell
npm.cmd install
npm.cmd run dev:frontend
npm.cmd run dev:backend
```

---

## 🏛️ Project Architecture & Directory Structure

The project has been organized into a modular three-tier architecture:

```text
business app/
│
├── frontend/                     # React 18 + Vite + TypeScript storefront & UI
│   ├── src/                      # Source code (components, pages, context, data)
│   ├── public/                   # Static packaged product SVGs & brand emblems
│   │   ├── images/brands/        # 6 genuine brand emblem SVGs
│   │   └── images/products/      # 33 verified packaged product SVGs
│   ├── package.json              # Frontend dependencies and build scripts
│   ├── vite.config.ts            # Vite bundler configuration (with /api proxy)
│   ├── tsconfig.json             # TypeScript root config
│   ├── .env.example              # Frontend environment template
│   └── .env                      # Local frontend environment variables
│
├── backend/                      # Node.js + Express 5 API Server
│   ├── src/
│   │   ├── config/               # Database connection (db.js)
│   │   ├── models/               # Mongoose schemas (Product, Brand, Order)
│   │   ├── controllers/          # Business logic handlers
│   │   ├── routes/               # API endpoint routers (/api/products, /api/brands, /api/orders)
│   │   ├── middleware/           # Centralized error handler
│   │   └── server.js             # Express application & server listener
│   ├── package.json              # Express, Mongoose, CORS, Dotenv, Nodemon
│   ├── .env.example              # Backend environment template
│   └── .env                      # Local backend environment variables (PORT, MONGODB_URI)
│
├── database/                     # Schemas, Seed data, and Migrations
│   ├── README.md                 # Database setup and Atlas guide
│   ├── schemas/                  # Document schemas (brand, product, order)
│   ├── seed/
│   │   ├── brands.json           # 6 verified FMCG brands
│   │   ├── products.json         # 33 genuine packaged products
│   │   └── seed.js               # Atlas automated seed script
│   └── scripts/
│       └── export-seed.js        # Backup & export utility
│
├── package.json                  # Root orchestration & convenience commands
├── .gitignore                    # Full-stack Git ignore rules
└── README.md                     # Master documentation (this file)
```

---

## 🚀 Quick Start Guide

### 1. Convenience Commands (From Project Root)

| Command | Action |
| :--- | :--- |
| `npm run dev:frontend` | Starts Vite frontend dev server at `http://localhost:5173` |
| `npm run dev:backend` | Starts Express backend server with hot-reload at `http://localhost:5000` |
| `npm run build:frontend` | Compiles TypeScript and builds optimized production bundle in `frontend/dist/` |
| `npm run start:backend` | Starts production backend Express server |
| `npm run seed:db` | Populates MongoDB Atlas with all 33 products and 6 brands |
| `npm run install:all` | Installs dependencies for both frontend and backend |

---

### 2. Running Frontend Separately

```bash
cd frontend
npm run dev
```
- Storefront URL: `http://localhost:5173/`
- Products Catalog: `http://localhost:5173/shop`
- Customer Cart: `http://localhost:5173/cart`
- Customer Checkout: `http://localhost:5173/checkout`
- Customer Order Tracking: `http://localhost:5173/account/orders`
- Owner Admin Panel: `http://localhost:5173/admin`

---

### 3. Running Backend Separately

```bash
cd backend
npm run dev
```
- API Base URL: `http://localhost:5000`
- Health Check: `GET http://localhost:5000/api/health`
- Products API: `GET http://localhost:5000/api/products`
- Brands API: `GET http://localhost:5000/api/brands`
- Orders API: `GET / POST http://localhost:5000/api/orders`

---

## 🍃 MongoDB Atlas Configuration & Seeding

1. Open `backend/.env` and paste your MongoDB connection string:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sree_annapurna?retryWrites=true&w=majority
   ```
2. Run the seed script:
   ```bash
   npm run seed:db
   ```
3. The script will automatically load all **6 verified brands** and **33 packaged products** into your Atlas collections with zero fake operational records.

---

## 🔒 Security & Separation of Panels

- **Customer Website (`/`, `/shop`, `/cart`, `/checkout`, `/account/orders`)**:
  - Customers place orders, view order confirmations, and track only their own orders.
  - Customers are **never** redirected to administrative dashboards upon checkout.
- **Owner / Admin Dashboard (`/admin`, `/admin/orders`)**:
  - Dedicated operations console for viewing incoming orders, updating fulfillment statuses (Pending → Confirmed → Processing → Dispatched → Delivered), and managing products.

1. Open `backend/.env` and paste your MongoDB connection string:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sree_annapurna?retryWrites=true&w=majority
   ```
2. Run the seed script:
   ```bash
   npm run seed:db
   ```
3. The script will automatically load all **6 verified brands** and **33 packaged products** into your Atlas collections with zero fake operational records.

---

## 🔒 Security & Separation of Panels

- **Customer Website (`/`, `/shop`, `/cart`, `/checkout`, `/account/orders`)**:
  - Customers place orders, view order confirmations, and track only their own orders.
  - Customers are **never** redirected to administrative dashboards upon checkout.
- **Owner / Admin Dashboard (`/admin`, `/admin/orders`)**:
  - Dedicated operations console for viewing incoming orders, updating fulfillment statuses (Pending → Confirmed → Processing → Dispatched → Delivered), and managing products.

