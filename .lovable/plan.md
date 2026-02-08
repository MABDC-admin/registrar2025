

# New Student Page UI - Split Panel Layout

## Overview
Redesign the Students page content area to use a master-detail split-panel layout (student list on left, student detail on right), matching the provided reference image. The sidebar navigation remains completely unchanged. No data is removed -- this is purely a visual/layout restructuring using existing data.

## What Changes

### 1. New View Mode: "Split Panel" in StudentTable
Add a new `viewMode` option ("split") to the existing `StudentTable` component that renders a two-column layout:

**Left Panel (~35% width):**
- "Students" header with search bar
- Scrollable list of students showing: avatar, name, class/level, LRN, year
- Highlighted row for selected student
- Clicking a student selects them (does NOT open a modal)

**Right Panel (~65% width):**
- Dark gradient header banner with student photo, name, level, and LRN
- "Basic Details" card showing: Gender, Date of Birth, Religion (use "-" if not available), Blood Group (use "-"), Address, Father name/contact, Mother name/contact
- Tab bar with: Progress, Attendance, Fees History, School Bus (map to existing data where available; show placeholder for missing modules)
- Progress tab: show a simple line chart of grades if available (using recharts, already installed)

### 2. Modify StudentTable Component
- Add `'split'` to the `ViewMode` type
- Add a split-panel toggle button alongside existing card/compact/table toggles
- When `viewMode === 'split'`, render the two-panel layout instead of the grid/list
- Move the search bar into the left panel header (matching the reference)
- Selected student state managed internally (no modal popup in split view)

### 3. Create StudentDetailPanel Component
New component: `src/components/students/StudentDetailPanel.tsx`
- Receives a `Student` object as prop
- Renders the dark header banner with photo, name, level, LRN
- Renders the Basic Details grid
- Renders the tabbed section (Progress, Attendance, etc.)
- Progress tab uses a simple `recharts` `LineChart` or `AreaChart` for grade visualization
- Attendance tab shows attendance summary (reuses existing attendance data if available)
- Tabs without data show a friendly placeholder

### 4. Styling
- Dark navy/slate gradient for the detail header (matching reference image)
- Clean white card for Basic Details with subtle borders
- Tab navigation with underline-style active indicator
- Responsive: on mobile, collapse to single column (list only, tap opens detail)

## What Does NOT Change
- Sidebar navigation (completely untouched)
- Database schema (no changes)
- Existing student data (no removal)
- Other view modes (cards, compact, table) remain available
- All existing modals (view, edit, delete) still work

## Technical Details

### Files to Create
- `src/components/students/StudentDetailPanel.tsx` -- the right-side detail view

### Files to Modify
- `src/components/students/StudentTable.tsx` -- add split view mode and internal selected-student state

### Data Mapping (Reference Image to Existing Fields)
| UI Label | Data Source |
|----------|------------|
| Photo | `student.photo_url` |
| Name | `student.student_name` |
| Class | `student.level` |
| Student ID | `student.lrn` |
| Gender | `student.gender` |
| Date of Birth | `student.birth_date` |
| Religion | Not in schema -- show "-" |
| Blood Group | Not in schema -- show "-" |
| Address | `student.uae_address` or `student.phil_address` |
| Father | `student.father_name` + `student.father_contact` |
| Mother | `student.mother_maiden_name` + `student.mother_contact` |
| Year | Derived from `student.created_at` or academic year |
| Progress chart | From grades data (if available) |
| Attendance | From attendance records (if available) |

### Component Structure

```text
StudentTable (split mode)
+---------------------------+-------------------------------+
| Left Panel (35%)          | Right Panel (65%)             |
| +-------------------+     | +---------------------------+ |
| | Search bar        |     | | Dark Header Banner        | |
| +-------------------+     | | Photo | Name | Class | ID | |
| | Student Row (sel) |     | +---------------------------+ |
| | Student Row       |     | | Basic Details Card        | |
| | Student Row       |     | | Gender | DOB | Religion   | |
| | Student Row       |     | | Address | Father | Mother | |
| | ...               |     | +---------------------------+ |
| |                   |     | | Tabs: Progress|Attendance | |
| |                   |     | | [Chart / Content]         | |
| +-------------------+     | +---------------------------+ |
+---------------------------+-------------------------------+
```

### Responsive Behavior
- Desktop (>=1024px): side-by-side split panel
- Tablet/Mobile (<1024px): full-width list; tapping a student opens detail as overlay or navigates
