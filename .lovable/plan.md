

# Allow Admin to Reset Password for All User Roles

## Problem
The "Reset Password" button in the credentials table only appears for **student** accounts (`cred.role === 'student'`). Admins cannot reset passwords for other admins, registrars, or teachers from this interface.

## Root Cause
Line 620 in `UserManagement.tsx` has a conditional check:
```
cred.role === 'student' && cred.user_id
```
This hides the reset button for non-student roles.

## Solution
Two small changes:

### 1. `src/components/admin/UserManagement.tsx`
- **Remove the `cred.role === 'student'` condition** from line 620, keeping only the `cred.user_id` check
- Change from: `{cred.role === 'student' && cred.user_id && (`
- Change to: `{cred.user_id && (`
- This makes the reset password button visible for admin, registrar, teacher, and student credentials alike

### 2. `supabase/functions/create-users/index.ts` (no changes needed)
The `reset_student_password` action already works generically -- it calls `supabase.auth.admin.updateUserById()` which works for any user regardless of role. No backend changes required.

## Result
All users with credentials (admin, registrar, teacher, student) will have the reset password button in the Actions column. Clicking it resets the password to "123456" and updates the credentials table, same as it does for students today.

