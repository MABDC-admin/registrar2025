

# Restore Missing Tabs in Student Profile Modal

## Problem
The `StudentProfileModal` (the popup that opens when clicking a student) only has **4 tabs**: Profile, Subjects, Documents, and Grades (Auto). Meanwhile, the full Student Profile page (`/student/:id`) has **7 tabs** including Academic History, Anecdotal/Behavior, and Transmutation. Two meaningful tabs are missing from the modal.

## Missing Tabs
1. **Academic History** -- Shows grade level, school history, enrolled subjects with grades per academic year
2. **Anecdotal/Behavior** -- Shows incident records (bullying, tardiness, positive behavior, etc.) with full CRUD support

The "Transmutation" tab from the full page is already represented in the modal as "Grades (Auto)," so that is not missing.

## Plan

### 1. Add "Academic History" tab to StudentProfileModal
- Add a new `TabsTrigger` with value `"academic"` using the `BookOpen` icon and label "Academic History"
- Add a corresponding content panel that displays:
  - Current grade level and school
  - Grades table (subject, Q1-Q4, final grade, academic year) fetched from `student_grades`
  - Previous school info
- Reuse the same data-fetching pattern already present in `StudentProfile.tsx` (lines 249-285)

### 2. Add "Anecdotal/Behavior" tab to StudentProfileModal
- Add a new `TabsTrigger` with value `"anecdotal"` using the `AlertTriangle` icon and label "Anecdotal/Behavior"
- Add a corresponding content panel that displays:
  - List of incidents from `student_incidents` table
  - Add/Edit/Delete incident capability (replicating the full profile page logic)
  - Category badges, status indicators, and date display

### 3. Tab ordering (matching full profile page)
The final tab order in the modal will be:
1. Profile (personal info)
2. Academic History (NEW)
3. Subjects
4. Documents
5. Anecdotal/Behavior (NEW)
6. Grades (Auto)

### 4. Styling consistency
- All new tabs use the same `rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500` styling
- Content panels wrapped in the same `motion.div` with fade animation
- Incident cards use the same colorful category badges from the full profile page

## Technical Details

### File changes
- **Modified**: `src/components/students/StudentProfileModal.tsx`
  - Import `AlertTriangle`, `BookOpen`, `FileText` icons
  - Add state for incidents, incident form, and incident modal
  - Add `useEffect` hooks to fetch grades and incidents from database
  - Add incident CRUD handlers (save, edit, delete)
  - Add two new `TabsTrigger` entries in correct order
  - Add two new content panels with animated wrappers
  - Add incident form dialog (reuse pattern from `StudentProfile.tsx`)

### No new files needed
All components and utilities already exist. The implementation copies proven patterns from `StudentProfile.tsx` into the modal.

### No database changes needed
The `student_grades`, `student_incidents`, and `subjects` tables already exist with appropriate RLS policies.

