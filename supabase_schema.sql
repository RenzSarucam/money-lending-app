-- Run this whole file once in Supabase Dashboard -> SQL Editor -> New query -> Run

-- 1. Profiles (role per logged-in user)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin','user')),
  full_name text,
  created_at timestamptz default now()
);

-- 2. Borrowers (both Arawan and Paluwagan loans)
create table public.borrowers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null, -- linked once borrower signs up
  email text, -- used to auto-link borrower's account when they sign up
  name text not null,
  loan_type text not null check (loan_type in ('arawan','paluwagan')),
  principal numeric not null,
  interest numeric not null, -- percent
  start_date date not null,
  total_amount numeric not null,
  -- arawan-only fields
  term_days int,
  collection_days text check (collection_days in ('daily','monsat')),
  daily_payment numeric,
  -- paluwagan-only fields
  term_months int,
  monthly_payment numeric,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 3. Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  borrower_id uuid not null references public.borrowers(id) on delete cascade,
  amount numeric not null,
  date date not null,
  recorded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 4. Auto-create profile + link borrower by email when someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'user', coalesce(new.raw_user_meta_data->>'full_name', new.email));

  update public.borrowers
  set user_id = new.id
  where lower(email) = lower(new.email) and user_id is null;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Helper to check admin role without RLS recursion
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 6. Enable RLS
alter table public.profiles enable row level security;
alter table public.borrowers enable row level security;
alter table public.payments enable row level security;

-- profiles policies
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- borrowers policies
create policy "borrowers_select" on public.borrowers
  for select using (user_id = auth.uid() or public.is_admin());
create policy "borrowers_insert_admin" on public.borrowers
  for insert with check (public.is_admin());
create policy "borrowers_update_admin" on public.borrowers
  for update using (public.is_admin());
create policy "borrowers_delete_admin" on public.borrowers
  for delete using (public.is_admin());

-- payments policies
create policy "payments_select" on public.payments
  for select using (
    public.is_admin()
    or borrower_id in (select id from public.borrowers where user_id = auth.uid())
  );
create policy "payments_insert_admin" on public.payments
  for insert with check (public.is_admin());
create policy "payments_delete_admin" on public.payments
  for delete using (public.is_admin());

-- After running this file:
-- 1. Sign up your own admin account in the app (Signup page).
-- 2. In Supabase Dashboard -> Table Editor -> profiles, find your row and change role from 'user' to 'admin'.
-- 3. That account can now use the Admin dashboard to add borrowers and record collections.
