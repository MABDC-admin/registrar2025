
# Fix: Sidebar Academic Year Not Updating After Activation

## Problem

The sidebar academic year dropdown still shows "2025-2026" even after "2026-2027" was activated as Current. This happens because:

1. `AcademicYearManagement` changes `is_current` in the database but never tells the global `AcademicYearContext` to refresh
2. The old year ID remains cached in `localStorage`, so the dropdown keeps showing the stale value

## Solution

In `AcademicYearManagement.tsx`, import `useAcademicYear` and call its `refetch()` method after any operation that changes academic year data (create, update, set current, archive, delete). This will refresh the sidebar dropdown and auto-select the newly activated year.

### File: `src/components/curriculum/AcademicYearManagement.tsx`

**Changes:**

1. Import `useAcademicYear` from `@/contexts/AcademicYearContext`
2. Destructure `refetch` from the hook
3. After every successful mutation (`handleSave`, `handleSetCurrent`, `handleDelete`, `handleArchive`), call `refetch()` alongside the existing `fetchYears()` call

This ensures the sidebar dropdown immediately reflects the newly activated academic year without requiring a page reload.
