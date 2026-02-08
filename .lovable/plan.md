

# School Reports Hub -- Implementation Plan

## Overview

Replace the existing lightweight `ReportsManagement` component (which only manages report card/certificate templates) with a comprehensive **Reports Hub** page. This new page will serve as a centralized reporting center where admins, teachers, and limited-access users (students/parents) can generate, preview, and export school-wide data summaries.

## What Will Be Built

### Page Structure

The Reports Hub will have three main areas:

1. **Header Bar** -- Title, subtitle, and quick-action export/print buttons
2. **Sticky Filters Panel** -- School Year, Quarter, Grade Level, Section, Student search, Teacher, Date range, Status toggles
3. **Main Content** -- Left sidebar with report category cards, right panel for report preview with tables/charts and a "Generate" button

### Report Categories

**A) Enrollment and Student Reports**
- Enrollment Summary (by grade/section, new vs returning)
- Student Masterlist (filterable, exportable)
- Student Profile Report (full profile + guardian info)
- Drop/Transfer List

**B) Academic and Grades Reports**
- Class Grade Summary (per subject, per section)
- Student Report Card (DepEd SF9-style, reusing existing `generateSF9`)
- At-Risk Learners Report (grades below 75 threshold)

**C) Attendance Reports**
- Daily Attendance Summary (per section)
- Student Attendance Detail (date range)
- Tardiness/Absences Leaderboard (admin/teacher only)

**D) Teacher and Class Reports**
- Teacher Load Report (subjects, sections)
- Class List per Teacher

**E) System and Compliance**
- Data Completeness Report (missing student info, missing grades)
- Export Audit Log (from `data_exports` table)

### Access Control (RBAC)

- **Admin**: Full access to all report categories and exports
- **Registrar**: Full access (same as admin for reports)
- **Teacher**: Academic and Attendance reports for their assigned classes/subjects only
- **Student**: Own grades and attendance only (limited view)
- **Parent**: Linked children's grades and attendance only (limited view)

### Data Visualization

Three charts that update based on filters:
- **Enrollment by Grade** (bar chart using Recharts)
- **Attendance Trend** (line chart)
- **Grade Distribution** (pie chart -- passing vs at-risk)

### Export and Print

- **PDF Export**: Using existing `jsPDF` + `jspdf-autotable` libraries
- **Excel/CSV Export**: Using existing `xlsx` and `papaparse` libraries
- **Print**: Browser print with print-friendly CSS
- **Audit Logging**: Every export logs to `data_exports` table

### Report Templates (Save and Re-run)

- Save current filter configuration + selected report type as a named template
- Templates stored in `localStorage` (no new DB table needed for MVP)
- Quick-run from a sidebar dropdown

## Technical Details

### Files to Create

- `src/components/reports/ReportsHub.tsx` -- Main page component with layout, filters, and category selector
- `src/components/reports/ReportFilters.tsx` -- Sticky filters panel component
- `src/components/reports/ReportPreview.tsx` -- Right-side preview renderer with tables/charts
- `src/components/reports/ReportCategoryCard.tsx` -- Left-side category card component
- `src/components/reports/reportGenerators.ts` -- Data fetching and PDF/Excel generation logic per report type
- `src/components/reports/reportTypes.ts` -- Type definitions and report category constants
- `src/components/reports/ReportCharts.tsx` -- Recharts-based visualization components
- `src/components/reports/SavedTemplates.tsx` -- Template save/load sidebar

### Files to Modify

- `src/pages/Index.tsx` -- Replace `ReportsManagement` import with `ReportsHub`, update the tab render to allow teacher/student/parent access with role-based restrictions
- `src/components/layout/DashboardLayout.tsx` -- Add `reports` nav item for teacher role (already present for admin/registrar)

### Database Queries (No New Tables Needed)

All reports will query existing tables:

- **Enrollment**: `students` table filtered by `school_id`, `academic_year_id`, `level`
- **Grades**: `student_grades` joined with `students` and `subjects`
- **Attendance**: `student_attendance` joined with `students`
- **Teachers**: `teachers` table joined with `student_subjects` for load info
- **Audit**: `data_exports` table for export history
- **Completeness**: `students` table checking for NULL fields

### Component Architecture

```text
ReportsHub
+-- Header (title + quick actions: Export PDF, Export Excel, Print)
+-- ReportFilters (sticky)
|   +-- School Year select (required)
|   +-- Quarter select
|   +-- Grade Level select
|   +-- Student search (debounced)
|   +-- Teacher select
|   +-- Date range picker
|   +-- Status toggles
+-- Main Content (two-column)
|   +-- Left: ReportCategoryCard list
|   |   +-- Enrollment and Students
|   |   +-- Academic and Grades
|   |   +-- Attendance
|   |   +-- Teacher and Class
|   |   +-- System and Compliance
|   +-- Right: ReportPreview
|       +-- ReportCharts (conditional)
|       +-- Data table (server-filtered, paginated)
|       +-- Generate / Export buttons
|       +-- Print-friendly layout with school header + signatures
+-- SavedTemplates (dropdown in header)
```

### Export Flow

1. User selects report category and sub-type
2. User applies filters
3. Clicks "Generate" -- data fetched from database with filters applied
4. Preview renders in-app with table + optional charts
5. User can then Export PDF, Export Excel/CSV, or Print
6. Each export action logs to `data_exports` table with user ID, file name, record count

### Performance Considerations

- Server-side filtering via Supabase query parameters (no client-side filtering of large datasets)
- Pagination for large result sets (50 rows per page)
- Debounced student search input (300ms)
- Loading skeletons during data fetch
- Empty states with filter adjustment suggestions

### Print Layout

Each printed report will include:
- School name, logo placeholder, school year, generated date/time
- Signature areas (Principal, Adviser) where relevant
- CSS page breaks for multi-page reports
- `@media print` styles for clean output

