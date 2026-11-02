# Supabase Storage Configuration — Nav AI

Nav AI uses a private Supabase Storage bucket for storing user-uploaded meal photographs.

## Bucket Definition

- **Bucket Name:** `meal-images`
- **Public Access:** `DISABLED` (Private bucket)
- **File Size Limit:** `10 MB`
- **Allowed MIME Types:** `image/jpeg`, `image/png`, `image/webp`, `image/heic`

## Object Path Structure

Files are strictly partitioned by authenticated user ID and meal ID:

```
meal-images/{user_id}/{meal_id}/{filename}
```

Example:
```
meal-images/550e8400-e29b-41d4-a716-446655440000/a3c2-d4e5/plate-scan.jpg
```

## Security & Storage Policies

Run these SQL statements in your Supabase SQL Editor if creating the bucket via SQL:

```sql
-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'meal-images',
    'meal-images',
    false,
    10485760, -- 10 MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Allow users to upload their own meal images
CREATE POLICY "Users can upload own meal images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'meal-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Policy: Allow users to view only their own meal images
CREATE POLICY "Users can view own meal images"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'meal-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy: Allow users to update their own meal images
CREATE POLICY "Users can update own meal images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'meal-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Allow users to delete their own meal images
CREATE POLICY "Users can delete own meal images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'meal-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
```

## Guest Privacy

Guest photos are processed transiently in memory for AI recognition and portions calculations. They are stored locally in the guest's browser via IndexedDB and are never permanently persisted to cloud storage until the user creates an account and imports their diary.

