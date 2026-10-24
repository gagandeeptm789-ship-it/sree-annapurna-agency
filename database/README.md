# Database Architecture — Sree Annapurna Agency

This directory contains the database schemas, seed datasets, and migration utilities for **Sree Annapurna Agency**.

## Directory Structure

```text
database/
├── README.md               # Database setup and Atlas connection guide
├── schemas/                # JSON Schema specifications
│   ├── brand.schema.json   # Schema for verified brand partners
│   ├── product.schema.json # Schema for packaged product catalogue
│   └── order.schema.json   # Schema for wholesale/retail customer orders
├── seed/                   # Verified business seed data
│   ├── brands.json         # 6 authentic FMCG brand records
│   ├── products.json       # 33 verified packaged products
│   └── seed.js             # Automated Atlas seeding script
└── scripts/
    └── export-seed.js      # Utility to backup current Atlas data into JSON
```

## MongoDB Atlas Setup

1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user with read/write privileges to `sree_annapurna`.
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for development).
4. Copy the connection string into `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sree_annapurna?retryWrites=true&w=majority
   ```

## Seeding the Database

Run from the root or backend directory:

```bash
# From workspace root:
npm run seed:db

# Or from backend/:
npm run seed
```

This will automatically load:
- **6 Genuine Brands**: Swastik Pickles & Masalas, Rala Food Specialists, Monkey 555, Monkey VVV, Aruna Masala, Deeppam Aarti.
- **33 Genuine Products**: All packaged goods across Pickles, Spices, Home care, and Pooja essentials with exact pricing and packaging details.
- **Zero fake records**: No fake orders, customer accounts, or fabricated financial transactions are inserted.

