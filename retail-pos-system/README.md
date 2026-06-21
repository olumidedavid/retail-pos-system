# Retail POS System

A modern Point of Sale and Inventory Management System for small retail businesses. This public version uses demo branding only and is suitable for portfolio, learning, and GitHub presentation.

## Developed By

**David Olumide IPAYE**  
Full-stack web application project using **Next.js, TypeScript, Supabase, and Vercel**.

## Project Overview

Retail POS System helps a shop manage products, stock, sales, cashier activities, receipts, expenses, and reports from a browser-based dashboard.

It is useful for businesses such as:

- Phone and accessories stores
- Computer/accessory shops
- Supermarkets and mini-marts
- Stationery shops
- Small retail outlets

## Key Features

- Admin and cashier login
- Product inventory management
- Add, edit, delete, and restock products
- Automatic stock deduction after sales
- Cashier sales interface
- Customer name on receipt
- 58mm and 80mm thermal receipt layout
- Sales receipts and invoice numbers
- Date-range sales reports
- Cashier performance reports
- Stock balance and stock value reports
- Expense tracking
- Shop and receipt settings
- Admin-only cleanup for demo/test data

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend/Database:** Supabase
- **Hosting:** Vercel
- **Styling:** CSS
- **Icons:** Lucide React

## Environment Variables

Create a `.env.local` file using the example below:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Do not commit `.env.local` to GitHub.

## Installation

```bash
git clone https://github.com/your-username/retail-pos-system.git
cd retail-pos-system
npm install
npm run dev
```

Open the local development URL shown in your terminal.

## Supabase Database Setup

Run this SQL in Supabase SQL Editor for a fresh demo setup.

```sql
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password text not null,
  full_name text not null,
  role text not null check (role in ('admin','cashier')),
  is_active boolean default true,
  created_at timestamp default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  model text,
  category text default 'General',
  cost_price numeric default 0,
  selling_price numeric default 0,
  stock integer default 0,
  low_stock_alert integer default 3,
  created_at timestamp default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null,
  cashier_id uuid references app_users(id),
  cashier_name text,
  customer_name text default 'Walk-in Customer',
  total numeric not null default 0,
  payment_method text,
  created_at timestamp default now()
);

alter table sales add column if not exists customer_name text default 'Walk-in Customer';

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade,
  product_id uuid references products(id),
  product_code text,
  product_name text,
  quantity integer not null,
  unit_price numeric not null,
  total numeric not null,
  created_at timestamp default now()
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  movement_type text,
  quantity integer,
  note text,
  created_by text,
  created_at timestamp default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  amount numeric not null,
  description text,
  created_at timestamp default now()
);

create table if not exists store_settings (
  id integer primary key default 1,
  shop_name text not null default 'DEMO RETAIL POS',
  address text default '',
  phone text default '',
  receipt_footer text default 'Thank you for your patronage.',
  receipt_width_mm integer default 58,
  updated_at timestamp default now()
);

insert into store_settings (id,shop_name,address,phone,receipt_footer,receipt_width_mm)
values (1,'DEMO RETAIL POS','','','Thank you for your patronage.',58)
on conflict (id) do nothing;

insert into app_users (username,password,full_name,role,is_active)
values ('admin','Admin@123','Demo Administrator','admin',true)
on conflict (username)
do update set password='Admin@123', role='admin', is_active=true;

notify pgrst, 'reload schema';
```

## Demo Login

```text
Username: admin
Password: Admin@123
```

Change the default password before using the system for real business operations.

## Important Security Notice

This public repository is a demo/portfolio version. For production use, improve authentication by using Supabase Auth or password hashing, and configure proper database Row Level Security policies.

## Suggested Screenshots for GitHub

Add screenshots to a `/screenshots` folder and update this README later:

- Login page
- Admin dashboard
- Product management
- Cashier sales page
- Receipt page
- Reports page

## Future Improvements

- Secure authentication with Supabase Auth
- Barcode scanner support
- PDF/Excel report export
- Low-stock email alerts
- Multi-branch support
- Audit logs
- Cloud backup dashboard

## License

This project is licensed under the MIT License.
