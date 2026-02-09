

# Enhance School Access Manager with Multiple Access Assignment

## Problem
The current School Access Manager only allows granting access to **one user + one school** at a time. When onboarding multiple teachers (like the 15 STFXSA teachers), this requires repeating the dialog 15 times individually.

## Solution
Replace the single-select user picker with a **multi-select checkbox list** so admins can select multiple users at once and grant them access to the chosen school in one action.

## Changes

### File: `src/components/admin/SchoolAccessManager.tsx`

1. **Replace single user select with multi-select user list**
   - Change `selectedUserId` (string) to `selectedUserIds` (string array)
   - Replace the `<Select>` dropdown with a scrollable checklist of users
   - Add a search/filter box within the user list for quick lookup
   - Add "Select All / Deselect All" toggle buttons

2. **Update the Grant Access mutation to handle batch inserts**
   - Loop through all selected user IDs
   - For each, check if access already exists (skip duplicates)
   - Insert all new access records in one batch
   - Show a summary toast: "Access granted to X users (Y already had access)"

3. **Update the dialog UI**
   - Show a count badge: "X users selected"
   - The School and Role selects remain single-select (one school + one role per batch)
   - Disable the "Grant Access" button until at least one user is selected

### UI Layout of Updated Dialog

```text
+------------------------------------------+
| Grant School Access                       |
| Allow users to access a school's data     |
+------------------------------------------+
| Users                                     |
| [Search users...                       ]  |
| [Select All] [Deselect All]  (3 selected) |
| +--------------------------------------+  |
| | [x] Apple B. Cortes                  |  |
| | [x] Jianne B. Briones               |  |
| | [ ] Loida B. Peteros                 |  |
| | [x] Melody Dawn M. Bisnar           |  |
| | ...                                  |  |
| +--------------------------------------+  |
|                                           |
| School                                    |
| [ MABDC v ]                               |
|                                           |
| Role at School                            |
| [ Teacher v ]                             |
|                                           |
|               [Cancel]  [Grant Access]    |
+------------------------------------------+
```

### Technical Details

- The user list uses a `ScrollArea` (max-height ~200px) with `Checkbox` components from the existing UI library
- Search filters the profile list client-side by name or email
- The batch insert uses a single `.insert([...records])` call for efficiency
- Existing access records are checked via a single query with `.in('user_id', selectedUserIds)` to avoid N+1
- No database changes required -- uses the existing `user_school_access` table

