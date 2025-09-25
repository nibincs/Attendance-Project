Supabase integration guide for Geolocation Attendance App

This file shows how to configure Supabase, create required tables, and integrate with the frontend files in this repo.

1) Create a Supabase project
- Go to https://app.supabase.com and create a new project.
- Note your project `URL` and `anon` (public) key from the project settings -> API.

2) Add keys to `supabase-config.js`
- Open `supabase-config.js` and replace `SUPABASE_URL` and `SUPABASE_ANON` with your values.

3) Create DB schema
- Open the SQL editor in the Supabase dashboard and run the SQL below.

-- SQL (paste into Supabase SQL editor)

```sql
-- attendance table
create table if not exists attendance (
  id bigserial primary key,
  user_id uuid references auth.users(id),
  user_name text,
  class_name text,
  date date,
  in_at timestamptz,
  out_at timestamptz,
  in_lat double precision,
  in_lng double precision,
  out_lat double precision,
  out_lng double precision,
  hours double precision
);

-- override requests table
create table if not exists requests (
  id bigserial primary key,
  user_id uuid references auth.users(id),
  student_name text,
  class_name text,
  reason text,
  from_time timestamptz,
  to_time timestamptz,
  status text default 'pending',
  created_at timestamptz default now()
);

-- advisors table (optional)
create table if not exists advisors (
  id uuid references auth.users(id) primary key,
  class_name text,
  geofence_lat double precision,
  geofence_lng double precision,
  geofence_radius int
);
```

4) Profiles & metadata
- Supabase's `auth` users support `user_metadata` and `app_metadata`. For roles and extra info you can either
  - store role and class in `user.user_metadata` when signing up, or
  - create a `profiles` table that references `auth.users(id)` and holds role, name, class, rollNo, etc.

Example `profiles` table:
```sql
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  role text,
  student_name text,
  roll_no text,
  class_name text,
  inst_name text
);
```

5) Client integration
- Use `app.supabase.js` (already added in the repo). Replace `app.js` script tag in your HTML pages with `app.supabase.js` (or load both and adapt wiring).
- Example change in `student.html` head/body where script is loaded:
  <script type="module" src="/app.supabase.js"></script>

6) Realtime & notifications
- Supabase offers realtime via publications/subscriptions while the client's page is open. For push notifications (advisors when a student requests override), use Firebase Cloud Messaging (FCM) or other push provider — you'll need to collect a device token and use server-side code to push.

7) Security
- Use Row Level Security (RLS) policies in Supabase to restrict access.
- Example RLS for `attendance` (basic):

```sql
-- enable RLS
alter table attendance enable row level security;

-- allow inserting own attendance
create policy "insert_own" on attendance for insert using (auth.uid() is not null) with check (user_id = auth.uid());

-- allow select for admins or owner (you'll need a way to mark admins in profiles or app_metadata)
-- example: assume profiles.role = 'admin'
create policy "select_owner_or_admin" on attendance for select using (
  auth.role = 'admin' or user_id = auth.uid()
);
```

8) Example flows
- Sign up student: call `supabase.auth.signUp({ email, password }, { data: { role: 'student', className, studentName } })` and optionally insert into `profiles` table.
- Check-in: client calls `supabase.from('attendance').insert(...)` after geofence validation.
- Advisor: subscribe to `requests` table realtime to receive immediate UI updates.

9) Optional: Edge functions & server-side validations
- Supabase Edge Functions let you run server-side JS/TS close to the DB and verify tokens, run geofence validation server-side, and send FCM messages.
- Create an Edge Function to send push when a new `requests` row appears, or use the Realtime webhook to trigger your server.

10) Swap note
- This repo includes both `app.js` (Firebase) and `app.supabase.js`. Choose one integration and update the `<script type="module" src="/app.js"></script>` lines in your HTML files to point to the desired file.

If you'd like, I can:
- Scaffold Supabase `profiles` table and RLS policies in `SUPABASE.sql` file.
- Modify the HTML files to load `app.supabase.js` instead of `app.js` and wire UI event listeners to the new functions.
- Add an Edge Function template to send FCM push notifications on new `requests`.

Which of the above would you like next?
