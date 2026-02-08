

# Fix: Chat File Upload "Bucket Not Found" Error

## Problem
When uploading a file in the messaging chat, a 404 "Bucket not found" error is returned. The `chat-attachments` storage bucket exists, but it is missing an **INSERT** policy. Without it, the storage API rejects the upload as if the bucket doesn't exist.

## Solution
Add a storage RLS policy allowing authenticated users to upload files to the `chat-attachments` bucket, restricted to their own UID folder (matching the existing upload path pattern: `${user.id}/${timestamp}.${ext}`).

## Technical Details

### Database Migration

```sql
-- Allow authenticated users to upload to their own folder in chat-attachments
CREATE POLICY "Users can upload chat files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

This ensures:
- Only authenticated users can upload
- Files can only be placed in a folder matching the user's own ID (matching the existing code pattern in `useMessaging.ts`)
- No frontend code changes are needed

