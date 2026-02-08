

# Student QR Code Generation with Edge Function

## Overview
Create a backend function that generates QR codes containing student LRN and password data, display them in the student detail panel next to the avatar, and set up real-time change detection for automatic regeneration when credentials change.

## Architecture

```text
user_credentials table (password changes)
        |
        v
  Realtime subscription (postgres_changes)
        |
        v
  Frontend detects change --> calls edge function
        |
        v
  generate-student-qr edge function
  (fetches LRN + password, generates QR data URL)
        |
        v
  QR code displayed in StudentDetailPanel avatar section
```

## What Changes

### 1. New Edge Function: `generate-student-qr`
**File:** `supabase/functions/generate-student-qr/index.ts`

- Accepts `student_id` as input
- Fetches the student's LRN from `students` table and password from `user_credentials` table
- Generates a QR code data URL containing a JSON payload: `{ lrn, password, generated_at }`
- Uses the `qrcode` npm package (server-side generation)
- Returns the base64 QR image data URL
- Includes CORS headers
- No caching headers (ensures fresh data on every call since password may change)

### 2. New Hook: `useStudentQRCode`
**File:** `src/hooks/useStudentQRCode.ts`

- Takes `studentId` as parameter
- Calls the edge function to get QR data URL
- Sets up a Supabase Realtime subscription on `user_credentials` table filtered by `student_id`
- When a password change event is detected (`UPDATE`), automatically re-fetches the QR code
- Returns `{ qrCodeUrl, isLoading, error }`

### 3. Modify StudentDetailPanel
**File:** `src/components/students/StudentDetailPanel.tsx`

- Import and use the `useStudentQRCode` hook
- In the dark header banner, position the QR code to the right of the avatar section
- Layout: `[Avatar] [Student Info] ... [QR Code]`
- QR code displayed as a small image (~80x80px) with a subtle white border
- Shows a loading skeleton while generating
- Tooltip on hover: "Scan for student credentials"

### 4. Database: Enable Realtime on `user_credentials`
- Add `user_credentials` to the realtime publication so the frontend can subscribe to password change events

## Data Flow

1. Student detail panel mounts with a student
2. `useStudentQRCode(student.id)` fires, calling the edge function
3. Edge function queries `students.lrn` and `user_credentials.temp_password` for the student
4. QR code is generated server-side with payload `{ lrn: "...", password: "..." }`
5. Data URL returned to frontend and displayed
6. Realtime subscription listens for `UPDATE` on `user_credentials` where `student_id` matches
7. On password change event, hook re-invokes the edge function to get a fresh QR code

## QR Code Content Format
```json
{
  "lrn": "123456789012",
  "password": "123456",
  "school": "MABDC",
  "generated": "2026-02-08T12:00:00Z"
}
```

## What Does NOT Change
- Database schema (no new columns or tables)
- Other student views (profile card, LIS detail)
- Authentication flow
- Existing QR code generation in enrollment wizard (that remains separate)

## Technical Details

### Edge Function Implementation
- Uses `npm:qrcode` for server-side QR generation
- Creates Supabase client with service role key to read credentials securely
- Returns `{ qr_data_url: "data:image/png;base64,..." }`
- Error handling for missing student or missing credentials

### Config Update
- Add `[functions.generate-student-qr]` with `verify_jwt = false` to `supabase/config.toml`

### Realtime Subscription
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_credentials;
```

### Files to Create
- `supabase/functions/generate-student-qr/index.ts`
- `src/hooks/useStudentQRCode.ts`

### Files to Modify
- `src/components/students/StudentDetailPanel.tsx` (add QR display in header)
- `supabase/config.toml` (add function config)

