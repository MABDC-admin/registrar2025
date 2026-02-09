

# Fix Finance Role Database Access and CRUD Operations

## Issues Found

1. **Missing icon mappings** -- Finance tab IDs (`fee-setup`, `assessments`, `cashier`, `payment-plans`, `student-ledger`, `discount-scholarships`, `finance-clearance`, `finance-reports`, `finance-settings`, `finance-audit`) are not in the `icon3DMap` or `iconAppleMap` in DashboardLayout. This causes fallback icons.

2. **Admin cannot access finance tabs** -- In `Index.tsx`, all finance tabs check `role === 'finance'` only. Admin should also be able to access them.

3. **Finance `profiles` join in audit logs** -- The `finance_audit_logs` component joins to `profiles` table, but the `profiles` RLS only allows admin SELECT or own profile. Finance role won't see other users' names.

4. **Students table access verification** -- The students SELECT RLS already allows access via `user_school_access`, so the finance user should be able to read STFXSA students. No change needed here.

## Changes

### 1. Database Migration: Add finance role to profiles SELECT RLS

Add a new RLS policy on `profiles` so finance users can read profile names (for audit log display):

```sql
CREATE POLICY "Finance can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'finance'::app_role));
```

### 2. Update `src/components/layout/DashboardLayout.tsx`

Add finance tab IDs to both icon maps (`icon3DMap` and `iconAppleMap`):

```
'fee-setup': SubjectsIcon3D / AppleSubjectsIcon
'assessments': EnrollmentIcon3D / AppleEnrollmentIcon
'cashier': EnterGradeIcon3D / AppleGradesIcon
'payment-plans': ScheduleIcon3D / AppleScheduleIcon
'student-ledger': ReportsIcon3D / AppleReportsIcon
'discount-scholarships': StudentIcon3D / AppleStudentIcon
'finance-clearance': AdminIcon3D / AppleAdminIcon
'finance-reports': ReportsIcon3D / AppleReportsIcon
'finance-settings': AdminIcon3D / AppleAdminIcon
'finance-audit': ImportIcon3D / AppleImportIcon
'billing': ReportsIcon3D / AppleReportsIcon
'payments-group': EnterGradeIcon3D / AppleGradesIcon
'accounts': ProfileIcon3D / AppleProfileIcon
'finance-config': AdminIcon3D / AppleAdminIcon
```

### 3. Update `src/pages/Index.tsx`

Change all finance tab access checks from:
```tsx
role === 'finance'
```
To:
```tsx
(role === 'finance' || role === 'admin')
```

This allows admin to also access finance modules.

### 4. Update `src/components/layout/DashboardLayout.tsx` -- School Switcher for Finance

Allow the finance role to switch schools (same as admin/registrar):
```tsx
const canSwitch = role === 'admin' || role === 'registrar' || role === 'finance';
```

## Technical Details

- 1 database migration (profiles RLS policy for finance)
- 2 frontend files modified (DashboardLayout.tsx, Index.tsx)
- No new files created
- All existing finance tables already have correct RLS for `finance` and `admin` roles
- Students table access works via existing `user_school_access` RLS policy

