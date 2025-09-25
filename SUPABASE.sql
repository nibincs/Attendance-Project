-- Supabase SQL: schema + RLS policies for Geolocation Attendance App
-- Run this in Supabase SQL editor or include in migrations

-- 1) Profiles table (holds role and profile data linked to auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  role text not null check (role in ('admin','advisor','student')),
  student_name text,
  roll_no text,
  class_name text,
  inst_name text,
  fcm_token text,
  created_at timestamptz default now()
);

-- 2) Advisors table (optional: store geofence per advisor)
create table if not exists advisors (
  id uuid references auth.users(id) primary key,
  class_name text,
  geofence_lat double precision,
  geofence_lng double precision,
  geofence_radius int default 200,
  breaks jsonb,
  updated_at timestamptz default now()
);

-- 3) Attendance table
create table if not exists attendance (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  user_name text,
  class_name text,
  date date,
  in_at timestamptz,
  out_at timestamptz,
  in_lat double precision,
  in_lng double precision,
  out_lat double precision,
  out_lng double precision,
  hours double precision,
  created_at timestamptz default now()
);

-- 4) Requests table (manual overrides)
create table if not exists requests (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  student_name text,
  class_name text,
  reason text,
  from_time timestamptz,
  to_time timestamptz,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_attendance_user on attendance(user_id);
create index if not exists idx_attendance_class_date on attendance(class_name, date);
create index if not exists idx_requests_class_status on requests(class_name, status);

-- Enable Row Level Security (RLS) on sensitive tables
alter table profiles enable row level security;
alter table advisors enable row level security;
alter table attendance enable row level security;
alter table requests enable row level security;

-- Policies
-- profiles: owner can read/write their profile; admins can read all
create policy "profiles_owner_insert" on profiles for insert
  with check (auth.uid() = id);
create policy "profiles_owner_select" on profiles for select
  using (auth.uid() = id or exists (select 1 from profiles p2 where p2.id = auth.uid() and p2.role = 'admin'));
create policy "profiles_owner_update" on profiles for update
  using (auth.uid() = id);
create policy "profiles_owner_delete" on profiles for delete
  using (false);

-- advisors: advisor (owner) can insert/update their advisor row; admins can read
create policy "advisors_owner_upsert" on advisors for all
  using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

-- attendance: students can insert their own records; students can select their own records;
-- advisors for the same class and admins can select all class records; advisors and admins can update
create policy "attendance_insert_own" on attendance for insert
  with check (auth.uid() = user_id);

create policy "attendance_select_owner_or_admin_or_advisor" on attendance for select
  using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'advisor' and p.class_name = attendance.class_name)
  );

create policy "attendance_update_admin_or_owner" on attendance for update
  using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','advisor'))
  );

-- requests: students can create their own; students can read own; advisor of same class and admins can read and update (approve/reject)
create policy "requests_insert_own" on requests for insert
  with check (auth.uid() = user_id);

create policy "requests_select_owner_or_advisor_or_admin" on requests for select
  using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'advisor' and p.class_name = requests.class_name)
  );

create policy "requests_update_advisor_or_admin" on requests for update
  using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','advisor') and (p.role = 'admin' or p.class_name = requests.class_name))
  )
  with check (true);

-- Helpful function: allow an admin to be created manually using profiles table (do this via dashboard)

-- End of SUPABASE.sql
