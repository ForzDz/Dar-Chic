-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null,
  image_url text,
  stock integer default 0,
  created_at timestamptz default now()
);

-- ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  wilaya text not null,
  commune text not null,
  address text not null,
  delivery_type text not null,
  delivery_fee integer not null,
  subtotal integer not null,
  total integer not null,
  status text default 'nouvelle',
  created_at timestamptz default now()
);

-- ORDER_ITEMS
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  unit_price integer not null
);

-- SÉCURITÉ
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;