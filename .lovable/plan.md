

# Enrollment Fix + Admissions Page Plan

## Part 1: Root Cause of "Enrollment failed" Error

The `students` table has two NOT NULL columns with no defaults:
- `school_id` (uuid, NOT NULL)
- `academic_year_id` (uuid, NOT NULL)

**Root cause**: When `selectedYearId` from `AcademicYearContext` is `null` (e.g. academic years haven't loaded yet, or the school code fails to resolve to a UUID), the enrollment form passes `academic_year_id: undefined`, which violates the NOT NULL constraint. The `useCreateStudent` hook does map school text codes to UUIDs, but if the mapping fails or the school code is unrecognized, `school_id` will also be missing.

**Fix**: Add a pre-submit guard in `EnrollmentWizard.tsx` and `EnrollmentForm.tsx` that blocks submission and shows a clear error if `selectedYearId` or the resolved `school_id` is missing. Also log the actual error message from the database instead of the generic "Enrollment failed" text.

## Part 2: New Admissions Page

Create an Admissions workflow within the Learner Records group for Admin and Registrar roles. This captures enrollment applications with an approval status before they become full student records.

### Database Changes

**New table: `admissions`**
- `id` (uuid, PK, default gen_random_uuid())
- `student_name` (text, NOT NULL)
- `lrn` (text, nullable -- may not have one yet)
- `level` (text, NOT NULL)
- `school` (text)
- `school_id` (uuid, NOT NULL)
- `academic_year_id` (uuid, NOT NULL)
- `birth_date` (date)
- `gender` (text)
- `mother_maiden_name` (text)
- `mother_contact` (text)
- `father_name` (text)
- `father_contact` (text)
- `phil_address` (text)
- `uae_address` (text)
- `previous_school` (text)
- `parent_email` (text) -- for notification emails
- `status` (text, default 'pending') -- pending, approved, rejected
- `reviewed_by` (uuid, references auth.users)
- `reviewed_at` (timestamptz)
- `rejection_reason` (text)
- `created_by` (uuid, references auth.users)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

**RLS policies**: Admin and Registrar (via `has_role` and `user_has_school_access`) can SELECT, INSERT, UPDATE. No DELETE (audit trail).

**New table: `admission_audit_logs`**
- `id`, `admission_id`, `action` (submitted/approved/rejected), `performed_by`, `details` (jsonb), `created_at`

### Email Integration

- Require user to add `RESEND_API_KEY` secret
- Create edge function `send-admission-email/index.ts` that sends:
  - **On approval**: Email to parent (from `enrollment@mabdc.com`) confirming acceptance
  - **On approval**: Email to admin notifying of the approval action
- Uses Resend API with sender `Enrollment <enrollment@mabdc.com>`

### Frontend Components

1. **`src/components/admissions/AdmissionsPage.tsx`** -- Main page with:
   - Table of all admission applications (filterable by status: All, Pending, Approved, Rejected)
   - Search by student name or LRN
   - Approve/Reject action buttons with confirmation dialogs
   - Rejection reason input when rejecting
   - On approval: automatically creates the student record in `students` table and sends email notifications

2. **Navigation**: Add `admissions` item to the "Learner Records" group for Admin and Registrar roles in `DashboardLayout.tsx`

3. **Index.tsx**: Add the `admissions` tab rendering `AdmissionsPage`

### Approval Flow

```text
Admission Created (pending)
        |
  Admin/Registrar Reviews
       / \
  Approve  Reject
    |         |
  Create     Log reason
  Student    Send rejection
  Record     email (optional)
    |
  Send approval
  email to parent
  + admin notification
    |
  Log audit entry
```

### Files to Create/Modify

**New files:**
- `src/components/admissions/AdmissionsPage.tsx`
- `supabase/functions/send-admission-email/index.ts`

**Modified files:**
- `src/components/enrollment/EnrollmentWizard.tsx` -- Fix: guard against null school_id/academic_year_id, show actual DB error
- `src/components/enrollment/EnrollmentForm.tsx` -- Same fix
- `src/components/layout/DashboardLayout.tsx` -- Add admissions nav item
- `src/pages/Index.tsx` -- Add admissions tab rendering
- Icon maps in DashboardLayout (add 'admissions' key)

**Database migration:**
- Create `admissions` table with RLS
- Create `admission_audit_logs` table with RLS

### Secret Required

The `RESEND_API_KEY` secret must be added before the email functionality works. The user will be prompted to provide it.

