

# Add Delete Account Function to Admin User Management

## Overview
Add a delete button for each account row in the credentials table, with a confirmation dialog. The delete action will remove the auth user, user role, and credential record. This works per-account (any role) and respects the school filter already in place.

## Changes

### 1. Edge Function: `supabase/functions/create-users/index.ts`

Add a new action `delete_account` that:
- Accepts `credentialId` and `userId`
- Deletes the auth user via `supabaseAdmin.auth.admin.deleteUser(userId)` (this cascades to `user_roles` and `profiles` due to foreign key `ON DELETE CASCADE`)
- Deletes the credential record from `user_credentials`
- Returns success/failure response

### 2. Frontend: `src/components/admin/UserManagement.tsx`

- Add state for `deletingAccountId` (tracks which account is being deleted) and `deleteTarget` (credential to delete, for confirmation dialog)
- Add a delete (trash) button in the Actions column for each credential row
- Add a confirmation dialog similar to the existing reset dialog:
  - Shows the account email/name being deleted
  - Requires clicking "Delete Account" to confirm
- `handleDeleteAccount` function calls the edge function with `action: 'delete_account'`
- After successful deletion, refresh credentials list

## Technical Details

### Edge Function Addition (new action handler)
```
action: "delete_account"
inputs: credentialId, userId
steps:
  1. Delete auth user (cascades user_roles, profiles)
  2. Delete user_credentials row
  3. Return { success, message }
```

### UI Flow
1. Admin clicks trash icon on a credential row
2. Confirmation dialog appears: "Delete account for [email/name]?"
3. On confirm, calls edge function
4. On success, toasts and refreshes the list

### Files Modified
- `supabase/functions/create-users/index.ts` -- add `delete_account` action
- `src/components/admin/UserManagement.tsx` -- add delete button, dialog, and handler
