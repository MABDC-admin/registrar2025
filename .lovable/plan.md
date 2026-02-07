

# Fix: Virtual Classes Page Loading Error

## Root Cause
The `schools` database table is missing an entry for "MABDC". Currently it only contains:
- `STFXS` (id: `11111111-...`)
- `STFXSA` (id: `22222222-...`)

When the selected school is "MABDC", the `useSchoolId` hook queries the `schools` table by code, finds nothing, and returns `null`. The Zoom dashboard then has no `schoolId` to fetch settings with, causing the loading failure.

## Fix

### 1. Add MABDC to the `schools` table (database migration)
Insert the missing school record so `useSchoolId` can resolve it:

```sql
INSERT INTO public.schools (id, code, name, is_active)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'MABDC',
  'M.A Brain Development Center',
  true
)
ON CONFLICT DO NOTHING;
```

### 2. Add graceful handling in ZoomDashboard (defensive fix)
Update `ZoomDashboard.tsx` so that when `schoolId` is still loading or null, it shows a proper loading/error state instead of silently failing. This prevents future issues if the hook is slow to resolve.

## Files Changed
- **New migration**: Insert MABDC school record
- **`src/components/zoom/ZoomDashboard.tsx`**: Add loading state while `schoolId` resolves; show friendly message if school not found

