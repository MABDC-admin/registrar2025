
# Comprehensive Student Portal Enhancement Plan

## Current State Analysis

### What Already Exists
| Feature | Status | Table/Component |
|---------|--------|-----------------|
| Dashboard (basic) | Partial | `StudentPortal.tsx` - has quick stats |
| Profile | Complete | `StudentProfileCard.tsx` |
| Grades/Academic | Complete | `student_grades` table, DepEd-compliant GA |
| Subjects | Complete | `student_subjects` table |
| Announcements | Partial | Uses `school_events` table |
| Library | Complete | `books` table, grade-filtered |
| Incidents/Behavior | Complete | `student_incidents` table |
| Documents | Complete | `student_documents` table |

### What Needs to Be Built
| Feature | Priority | New Tables Required |
|---------|----------|---------------------|
| Attendance Tracking | High | `student_attendance` |
| Class Schedule/Timetable | High | `class_schedules` |
| Assignments & Homework | High | `student_assignments`, `assignment_submissions` |
| Exam Schedules | Medium | `exam_schedules` |
| Announcements (enhanced) | Medium | `announcements` (dedicated table) |
| Fees & Payments | Low | `student_fees`, `fee_payments` |
| Communication/Messaging | Low | `messages`, `message_threads` |
| Extracurricular Activities | Low | `student_activities`, `extracurricular_clubs` |
| Career Guidance | Low | Future phase |
| Health & Well-being | Low | Future phase |

---

## Phase 1: Core Student Portal (This Implementation)

### Database Schema - New Tables

#### 1. student_attendance
Tracks daily attendance with school and academic year segregation.

```sql
create table public.student_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade not null,
  school_id uuid references public.schools(id) not null,
  academic_year_id uuid references public.academic_years(id) not null,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  time_in time,
  time_out time,
  remarks text,
  recorded_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, date, academic_year_id)
);

-- RLS: Students view own, Staff manages all
alter table public.student_attendance enable row level security;

create policy "Students view own attendance"
  on public.student_attendance for select using (
    student_id in (
      select uc.student_id from user_credentials uc 
      where uc.user_id = auth.uid()
    )
  );

create policy "Staff manage attendance"
  on public.student_attendance for all using (
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('admin', 'registrar', 'teacher')
    )
  );
```

#### 2. class_schedules
Weekly timetable by grade level and subject.

```sql
create table public.class_schedules (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) not null,
  academic_year_id uuid references public.academic_years(id) not null,
  subject_id uuid references public.subjects(id) not null,
  grade_level text not null,
  section text,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  room text,
  teacher_id uuid references public.teachers(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies for student read, staff manage
alter table public.class_schedules enable row level security;

create policy "Anyone can view schedules"
  on public.class_schedules for select using (true);

create policy "Staff manage schedules"
  on public.class_schedules for all using (
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('admin', 'registrar', 'teacher')
    )
  );
```

#### 3. student_assignments
Assignments/homework by subject and grade level.

```sql
create table public.student_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) not null,
  academic_year_id uuid references public.academic_years(id) not null,
  subject_id uuid references public.subjects(id) not null,
  grade_level text not null,
  title text not null,
  description text,
  instructions text,
  due_date timestamptz not null,
  max_score numeric,
  assignment_type text default 'homework' check (assignment_type in ('homework', 'project', 'quiz', 'essay', 'other')),
  attachments jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.student_assignments(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  submitted_at timestamptz,
  score numeric,
  feedback text,
  status text default 'pending' check (status in ('pending', 'submitted', 'late', 'graded', 'returned')),
  attachments jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(assignment_id, student_id)
);

-- RLS for both tables
alter table public.student_assignments enable row level security;
alter table public.assignment_submissions enable row level security;

create policy "Students view grade-level assignments"
  on public.student_assignments for select using (true);

create policy "Staff manage assignments"
  on public.student_assignments for all using (
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('admin', 'registrar', 'teacher')
    )
  );

create policy "Students view own submissions"
  on public.assignment_submissions for select using (
    student_id in (
      select uc.student_id from user_credentials uc 
      where uc.user_id = auth.uid()
    )
  );

create policy "Students submit own work"
  on public.assignment_submissions for insert with check (
    student_id in (
      select uc.student_id from user_credentials uc 
      where uc.user_id = auth.uid()
    )
  );

create policy "Staff manage submissions"
  on public.assignment_submissions for all using (
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('admin', 'registrar', 'teacher')
    )
  );
```

#### 4. exam_schedules
Exam dates and details.

```sql
create table public.exam_schedules (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) not null,
  academic_year_id uuid references public.academic_years(id) not null,
  subject_id uuid references public.subjects(id) not null,
  grade_level text not null,
  exam_type text not null check (exam_type in ('quarterly', 'midterm', 'final', 'quiz', 'special')),
  exam_date date not null,
  start_time time,
  end_time time,
  room text,
  quarter int check (quarter between 1 and 4),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.exam_schedules enable row level security;

create policy "Anyone can view exam schedules"
  on public.exam_schedules for select using (true);

create policy "Staff manage exam schedules"
  on public.exam_schedules for all using (
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('admin', 'registrar', 'teacher')
    )
  );
```

#### 5. announcements (enhanced)
Dedicated announcements table with targeting.

```sql
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id),
  academic_year_id uuid references public.academic_years(id),
  title text not null,
  content text not null,
  target_audience text[] default array['all']::text[],
  target_grade_levels text[],
  priority text default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  is_pinned boolean default false,
  published_at timestamptz default now(),
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.announcements enable row level security;

create policy "Anyone can view announcements"
  on public.announcements for select using (true);

create policy "Staff manage announcements"
  on public.announcements for all using (
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('admin', 'registrar')
    )
  );
```

---

### New React Hooks

#### src/hooks/useStudentPortalData.ts
Central hook file for all student portal data needs:

```typescript
// Exports:
useStudentAttendance(studentId, academicYearId)
  - Returns: { data: AttendanceRecord[], summary: AttendanceSummary }
  
useStudentSchedule(gradeLevel, schoolId, academicYearId)
  - Returns: { data: ScheduleItem[], byDay: Map<number, ScheduleItem[]> }
  
useStudentAssignments(studentId, gradeLevel, schoolId, academicYearId)
  - Returns: { pending, submitted, graded, overdue }
  
useExamSchedule(gradeLevel, schoolId, academicYearId)
  - Returns: { upcoming, past }
  
useAnnouncements(schoolId, gradeLevel)
  - Returns: { pinned, regular, count }
```

Each hook will:
- Filter by `school_id` and `academic_year_id` for proper segregation
- Use React Query for caching and background updates
- Include loading and error states

---

### Enhanced StudentPortal Component Structure

```text
src/components/portals/
├── StudentPortal.tsx (main container - refactored)
├── student/
│   ├── StudentDashboard.tsx (overview with quick stats)
│   ├── StudentProfileTab.tsx (enhanced personal info)
│   ├── StudentGradesTab.tsx (with trends chart)
│   ├── StudentSubjectsTab.tsx (enrolled subjects)
│   ├── StudentScheduleTab.tsx (weekly timetable)
│   ├── StudentAttendanceTab.tsx (monthly summary)
│   ├── StudentAssignmentsTab.tsx (pending/submitted/graded)
│   ├── StudentExamsTab.tsx (schedule and results)
│   ├── StudentAnnouncementsTab.tsx (school-wide and grade-specific)
│   ├── StudentLibraryTab.tsx (link to library with grade filter)
│   └── components/
│       ├── QuickStatsCards.tsx
│       ├── UpcomingDeadlines.tsx
│       ├── AttendanceCalendar.tsx
│       ├── AttendanceChart.tsx
│       ├── GradeTrendChart.tsx
│       ├── WeeklyScheduleGrid.tsx
│       ├── AssignmentCard.tsx
│       └── ExamCountdown.tsx
```

---

### UI Design - Student Portal Layout

```text
+------------------------------------------------------------------+
|  Welcome, [Student Name]!                           [Log out]     |
|  Level 3 | MABDC | SY 2025-2026                                  |
+------------------------------------------------------------------+
|                                                                   |
|  Quick Stats Row:                                                 |
|  +-----------+ +-----------+ +-----------+ +-----------+         |
|  | Gen. Avg. | | Attendance| | Pending   | | Upcoming  |         |
|  | 87.50     | | 95.5%     | | 3 Tasks   | | 2 Exams   |         |
|  +-----------+ +-----------+ +-----------+ +-----------+         |
|                                                                   |
+------------------------------------------------------------------+
|  Tabs Navigation:                                                 |
|  [Dashboard] [Profile] [Grades] [Schedule] [Attendance]          |
|  [Assignments] [Exams] [Announcements] [Library]                 |
+------------------------------------------------------------------+
|                                                                   |
|  Tab Content Area                                                 |
|                                                                   |
|  Dashboard Tab Example:                                           |
|  +------------------------+ +------------------------+           |
|  | Quarterly Gen. Averages | | Upcoming Deadlines    |           |
|  | Q1: 88 | Q2: 87 | ...  | | - Math HW (Tomorrow)  |           |
|  +------------------------+ | - Science Quiz (3d)   |           |
|                             +------------------------+           |
|  +------------------------+ +------------------------+           |
|  | This Week's Schedule   | | Recent Announcements   |           |
|  | Mon: English, Math...  | | - Parent Meeting 12/20 |           |
|  +------------------------+ +------------------------+           |
|                                                                   |
+------------------------------------------------------------------+
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useStudentPortalData.ts` | Centralized hooks for all portal data |
| `src/components/portals/student/StudentDashboard.tsx` | Dashboard overview component |
| `src/components/portals/student/StudentScheduleTab.tsx` | Weekly timetable view |
| `src/components/portals/student/StudentAttendanceTab.tsx` | Attendance summary & calendar |
| `src/components/portals/student/StudentAssignmentsTab.tsx` | Assignment tracking |
| `src/components/portals/student/StudentExamsTab.tsx` | Exam schedule display |
| `src/components/portals/student/StudentAnnouncementsTab.tsx` | Enhanced announcements |
| `src/components/portals/student/StudentLibraryTab.tsx` | Library integration |
| `src/components/portals/student/components/QuickStatsCards.tsx` | Reusable stats cards |
| `src/components/portals/student/components/WeeklyScheduleGrid.tsx` | Weekly grid component |
| `src/components/portals/student/components/AttendanceCalendar.tsx` | Monthly attendance view |
| `src/components/portals/student/components/UpcomingDeadlines.tsx` | Deadline widget |
| `src/components/portals/student/components/GradeTrendChart.tsx` | Grade progression chart |
| `src/types/studentPortal.ts` | TypeScript interfaces |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/portals/StudentPortal.tsx` | Refactor to use new tab components |
| `src/components/portals/index.ts` | Export new components |

---

### Data Segregation Pattern

All queries will enforce school and academic year filtering:

```typescript
// Example pattern for useStudentAssignments
const useStudentAssignments = (
  studentId: string,
  gradeLevel: string,
  schoolId: string,
  academicYearId: string
) => {
  return useQuery({
    queryKey: ['student-assignments', studentId, schoolId, academicYearId],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_assignments')
        .select(`
          *,
          subjects:subject_id(code, name),
          assignment_submissions!inner(*)
        `)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .eq('grade_level', gradeLevel)
        .eq('assignment_submissions.student_id', studentId)
        .order('due_date', { ascending: true });
      
      return data;
    },
    enabled: !!studentId && !!schoolId && !!academicYearId
  });
};
```

---

### Implementation Order

1. **Database Migration** - Create all new tables with RLS policies
2. **Types Definition** - Create TypeScript interfaces for new data
3. **Hooks Layer** - Implement all data fetching hooks with proper segregation
4. **Dashboard Tab** - Quick overview with stats and widgets
5. **Schedule Tab** - Weekly timetable grid
6. **Attendance Tab** - Monthly calendar with daily status
7. **Assignments Tab** - Pending, submitted, graded assignments
8. **Exams Tab** - Upcoming exam schedule
9. **Announcements Tab** - Enhanced with targeting
10. **Library Tab** - Integration with existing library
11. **Refactor StudentPortal.tsx** - Integrate all new tabs
12. **Parent Portal Enhancement** - Use same components for parent view
13. **Testing** - End-to-end verification

---

### Features by Tab

| Tab | Features |
|-----|----------|
| **Dashboard** | Quick stats, quarterly GA, upcoming deadlines, recent announcements, weekly schedule preview |
| **Profile** | Personal info (read-only), student ID, class details, photo |
| **Grades** | Subject-wise grades, Q1-Q4 breakdown, pass/fail indicators, DepEd descriptors |
| **Schedule** | Weekly timetable grid, subject colors, room info, teacher names |
| **Attendance** | Monthly calendar view, daily status indicators, attendance percentage, absence notes |
| **Assignments** | Pending/submitted/graded tabs, due dates, download attachments, submission status |
| **Exams** | Upcoming exams, past results, exam type badges, countdown timers |
| **Announcements** | Pinned announcements, priority badges, expiry dates, grade-targeted |
| **Library** | Grade-filtered books, search, flipbook viewer integration |

---

### Notes for Both Schools (MABDC & STFXSA)

- All features automatically filter by student's `school_id`
- Academic year filtering ensures current-year-only data
- Grade-level filtering ensures appropriate content visibility
- RLS policies enforce data isolation at the database level
- Same component structure works for both schools

---

### Future Phases (Not in This Implementation)

| Phase | Features |
|-------|----------|
| Phase 2 | Fees & Payments, Parent Portal enhancements |
| Phase 3 | Communication/Messaging, Discussion Forums |
| Phase 4 | Extracurricular Activities, Career Guidance |
| Phase 5 | Health & Well-being, Advanced Notifications |
