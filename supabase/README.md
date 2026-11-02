# Supabase Configuration & Storage Setup for Nav AI

This directory contains the database schema migrations, Row Level Security (RLS) policies, and reference seed data for Nav AI.

---

## 1. Running Migrations in Supabase

You can apply the migrations using either the **Supabase Dashboard SQL Editor** or the **Supabase CLI**.

### Option A: Supabase Web Dashboard
1. Log in to your project at [database.new](https://database.new) or [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** from the left navigation.
3. Paste and run the contents of:
   - `migrations/20261101_init_schema.sql` (Creates tables, triggers, indexes, and RLS policies)
   - `migrations/20261101_seed_data.sql` (Inserts reference foods and curated recipes)
4. Confirm in **Table Editor** that the 9 core tables exist:
   `profiles`, `daily_goals`, `food_items`, `meals`, `meal_items`, `recipes`, `recipe_ingredients`, `water_logs`, `weight_logs`.

### Option B: Supabase CLI
```bash
supabase db push
```

---

## 2. Supabase Storage Setup (`meal-images` Bucket)

Nav AI uses a private, owner-scoped storage bucket to securely store meal photographs.

### Step-by-step Bucket Creation:
1. In your Supabase Dashboard, go to **Storage** -> **Create a new bucket**.
2. Name the bucket: `meal-images`.
3. Set **Public bucket** to **OFF** (Keep it private to protect user privacy).
4. Set allowed MIME types: `image/jpeg, image/png, image/webp`.
5. Set maximum upload file size: `10 MB`.
6. Click **Save bucket**.

### Storage Row Level Security (RLS) Policies:
Run the following SQL in the SQL Editor to restrict access so each user can only read, write, and delete files inside their own user folder (`<user_id>/*`):

```sql
-- Allow authenticated users to upload meal photos to their own folder
create policy "Users can upload meal images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meal-images' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view only their own uploaded images
create policy "Users can view own meal images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'meal-images' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own meal images
create policy "Users can delete own meal images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'meal-images' and
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 3. Google OAuth Setup (Optional)
If you wish to enable **Continue with Google**:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Set Authorized redirect URIs to: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`.
4. In your Supabase Dashboard, navigate to **Authentication** -> **Providers** -> **Google**.
5. Enable Google provider, paste your **Client ID** and **Client Secret**, then save.

