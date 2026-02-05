
# Library Integration Plan

## Overview
Integrate the Flipbooks project (from another Lovable project) into this system by:
1. Replacing the Attendance widget with a Library widget
2. Creating a Library page with flipbook content filtered by grade level
3. Implementing role-based access (students see grade-appropriate content, staff see all)

---

## Part 1: Replace Attendance Widget with Library Widget

### File: `src/components/dashboard/DashboardStatsRow.tsx`

**Current State:** 4th widget shows "Attendance" with a percentage  
**New State:** 4th widget shows "Library" with a link/count

**Changes:**
- Replace the Attendance stat with a Library stat
- Add a click handler to navigate to the Library page
- Update the icon to a book/library icon

### File: `src/components/icons/ThreeDIcons.tsx`
- Add a new `LibraryIcon3D` component for the widget

### File: `src/components/portals/AdminPortal.tsx`
- Update DashboardStatsRow props (remove attendanceRate, add libraryAction)

---

## Part 2: Database Schema for Flipbooks

Since the Flipbooks project is in a separate Lovable account, we have two integration options:

### Option A: External Link Integration (Simpler)
- Store flipbook metadata (title, grade level, external URL) in this system
- Link opens the external Flipbooks project in a new tab
- Content is managed in the Flipbooks project

### Option B: Full Data Import (More Complex)
- Copy flipbook data into this system's database
- Store PDFs in this system's storage
- Requires ongoing sync between projects

**Recommended: Option A** - External Link Integration

### Database Table: `flipbooks`
```sql
CREATE TABLE public.flipbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  flipbook_url TEXT NOT NULL, -- External URL to the flipbook
  grade_levels TEXT[] NOT NULL, -- Array of grade levels (e.g., ['Grade 1', 'Grade 2'])
  school TEXT, -- 'MABDC', 'STFXSA', or NULL for both
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.flipbooks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can view active flipbooks
CREATE POLICY "Users can view flipbooks"
  ON public.flipbooks FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Admins can manage flipbooks
CREATE POLICY "Admins can manage flipbooks"
  ON public.flipbooks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

---

## Part 3: Library Page Component

### New File: `src/components/library/LibraryPage.tsx`

**Features:**
- Grid display of flipbook covers/cards
- Grade level filter dropdown
- Search by title
- Click to open flipbook in new tab (or embedded iframe)

**Role-Based Filtering Logic:**
```typescript
// Students: Filter by their grade level only
if (role === 'student' && student?.level) {
  query = query.contains('grade_levels', [student.level]);
}

// Teachers, Registrars, Admins: See all flipbooks
// No additional filter needed
```

**UI Layout:**
```
+------------------------------------------+
|  Library                    [Filter: All ▼] |
|  Browse ebooks for your grade level         |
+------------------------------------------+
|  +--------+  +--------+  +--------+      |
|  |  📚    |  |  📚    |  |  📚    |      |
|  | Cover  |  | Cover  |  | Cover  |      |
|  | Grade 1|  | Grade 2|  | Grade 3|      |
|  +--------+  +--------+  +--------+      |
+------------------------------------------+
```

### New File: `src/components/library/FlipbookCard.tsx`
- Card component showing cover, title, grade level badges
- Click opens the flipbook URL

---

## Part 4: Navigation Integration

### File: `src/components/layout/DashboardLayout.tsx`

Add "Library" navigation item for all roles:
```typescript
// In getNavItemsForRole function
{ id: 'library', icon: BookOpen, label: 'Library' }
```

### File: `src/pages/Index.tsx`

Add route handling for Library:
```typescript
{activeTab === 'library' && <LibraryPage />}
```

---

## Part 5: Widget Click Action

### File: `src/components/dashboard/DashboardStatsRow.tsx`

Make the Library widget clickable:
```typescript
<motion.div
  onClick={() => onNavigate?.('library')}
  className="cursor-pointer hover:scale-105 transition-transform"
  // ... existing props
>
```

---

## Files to Create
- `src/components/library/LibraryPage.tsx`
- `src/components/library/FlipbookCard.tsx`

## Files to Modify
- `src/components/dashboard/DashboardStatsRow.tsx` - Replace Attendance with Library
- `src/components/icons/ThreeDIcons.tsx` - Add LibraryIcon3D
- `src/components/portals/AdminPortal.tsx` - Update props
- `src/components/portals/RegistrarPortal.tsx` - Add Library widget
- `src/components/layout/DashboardLayout.tsx` - Add Library nav item
- `src/pages/Index.tsx` - Add Library tab handler

## Database Migration
- Create `flipbooks` table with RLS policies

---

## Integration with External Flipbooks Project

To populate the Library, you will need to:
1. **Manually add flipbook entries** via an admin interface (to be created)
2. **Or provide the external flipbook URLs** for me to add to the database

The flipbook URL should be the public link from your Flipbooks project (similar to Heyzine's shared links).

---

## Summary

| Role | Library Access |
|------|---------------|
| Student | Only flipbooks matching their grade level |
| Teacher | All flipbooks |
| Registrar | All flipbooks |
| Admin | All flipbooks + can manage/add flipbooks |
| Parent | Flipbooks matching their children's grade levels |
