

# Fix: Registrar Cannot See Other Users in Chat

## Problem
The registrar (and teacher) roles cannot see other users when creating a new chat conversation. This is caused by overly restrictive RLS (Row-Level Security) policies on two tables:

1. **profiles table** -- Only admins can view all profiles; everyone else can only see their own profile
2. **user_roles table** -- Only admins can view all roles; everyone else can only see their own role

When the chat dialog queries these tables to list available contacts, the registrar gets empty results.

## Solution
Add SELECT policies so that teachers and registrars can also view profiles and roles of other staff members (admin, teacher, registrar).

## Technical Details

### Database Migration
Add two new RLS policies:

**1. Allow teachers and registrars to view all profiles:**
```sql
CREATE POLICY "Staff can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'registrar'::app_role)
);
```

**2. Allow teachers and registrars to view user roles:**
```sql
CREATE POLICY "Staff can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'registrar'::app_role)
);
```

### Why This Is Safe
- These policies use the existing `has_role()` security definer function, avoiding recursion
- Only authenticated users with verified staff roles (teacher/registrar) gain access
- Student and parent roles remain restricted to viewing only their own data
- No code changes are needed -- the existing `NewChatDialog.tsx` queries will work correctly once the policies allow data access

### No Frontend Changes Required
The `NewChatDialog` component already queries `user_roles` and `profiles` correctly. The fix is purely at the database policy level.

