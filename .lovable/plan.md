

# Mobile Bottom Navigation Bar for Student Portal

## Overview

Add a sticky bottom navigation bar that appears only on mobile screens for student users. This replaces the hamburger menu sidebar pattern with a more app-like mobile experience, while keeping the sidebar for desktop.

## What Will Change

### New Component
**`src/components/layout/StudentBottomNav.tsx`** -- A fixed bottom navigation bar with 5 key items:
- Dashboard (Home icon)
- Grades (GraduationCap icon)
- Library (BookOpen icon)
- Assignments (ClipboardList icon)
- Profile (User icon)

Features:
- Sticky at screen bottom, visible only on mobile (below `lg` breakpoint) and only for student role
- Active state with filled icon + colored indicator dot/pill
- Smooth framer-motion scale and opacity animations on tap
- Safe area padding for notched devices (env(safe-area-inset-bottom))
- Backdrop blur glass effect background

### Modified Files

**`src/components/layout/DashboardLayout.tsx`**
- Import and render `StudentBottomNav` inside the layout when `role === 'student'`
- Hide the mobile hamburger header for students (they use bottom nav instead)
- Add bottom padding to main content area on mobile for students so content is not hidden behind the nav bar

**`src/components/portals/StudentPortal.tsx`**
- Hide the logout button from the header (move it to a "More" option or keep it in sidebar only)
- The header becomes simpler on mobile since navigation is handled by bottom nav

## Technical Details

### Bottom Nav Component Structure

```text
StudentBottomNav (fixed bottom-0, z-50, lg:hidden)
+-- Glass background (backdrop-blur, border-top)
+-- 5 nav items in flex row
    +-- Each item: icon + label (10px text)
    +-- Active: primary color + scale animation + indicator pill
    +-- Inactive: muted color
+-- Safe area spacer (env(safe-area-inset-bottom))
```

### Navigation Mapping

The bottom nav maps to these existing tab IDs:
- Dashboard -> `portal` (student dashboard)
- Grades -> `student-grades`
- Library -> `library`
- Assignments -> `student-assignments`
- Profile -> `student-profile`

Additional sections (Schedule, Attendance, Exams, Announcements, Subjects) remain accessible via the sidebar which can still be opened from a hamburger icon in the top header.

### Mobile Header Adjustment

For students on mobile, the top header will be simplified -- still showing school name and a hamburger menu for accessing the full sidebar with all sections. The bottom nav handles the 5 most-used items for quick access.

### CSS Considerations

- Bottom padding on `<main>` for student mobile: `pb-20` (80px to clear the nav bar)
- Print media query: hide bottom nav (`@media print { .student-bottom-nav { display: none } }`)
- The nav bar height will be approximately 64px + safe area inset

### Animation Details

- Active item: `scale(1.1)` with spring animation on icon
- Tap feedback: `scale(0.9)` whileTap
- Active indicator: small pill/dot that slides with `layoutId` animation between items
- Page transition: content fades when switching sections

