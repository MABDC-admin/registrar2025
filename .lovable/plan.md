

# Finance Module Analysis and Fix

## Issue Found

Only **one bug** exists across all 13 finance modules: the `FinanceLearnerPage.tsx` was querying a `status` column that does not exist in the `students` table. This was already fixed in the last edit.

**No other finance modules have column mismatch issues.**

## FeeSetup Clarification

The "Fee Setup" page is a **fee catalog configuration page** -- it manages fee items (tuition, books, uniform, etc.), not student/learner listings. It is working correctly. To view learners with financial data, use the **"Learners"** tab instead.

## Full Module Dependency Map

```text
FinancePortal (Dashboard)
  |-- reads: payments, student_assessments, finance_clearance
  |-- no student joins (aggregates only)
  |
FinanceLearnerPage (Learners tab) [FIXED]
  |-- reads: students (direct query, filtered by school text code)
  |-- reads: student_assessments (joined by student_id)
  |-- BUG WAS HERE: queried non-existent 'status' column on students
  |
FeeSetup (Fee catalog)
  |-- reads/writes: fee_catalog (school_id filtered)
  |-- no student data at all
  |
StudentAssessments
  |-- reads: student_assessments -> students(student_name, lrn, level)
  |-- filtered by school_id + academic_year_id
  |
PaymentCollection (Cashier)
  |-- reads: payments -> students(student_name, lrn)
  |-- writes: payments (new payment records)
  |
StudentLedger
  |-- reads: student_assessments -> students(student_name, lrn, level)
  |-- same pattern as StudentAssessments
  |
FinanceClearance
  |-- reads/writes: finance_clearance -> students(student_name, lrn, level)
  |
PaymentPlans
  |-- reads: payment_plans -> students(student_name, lrn)
  |
DiscountScholarships
  |-- reads/writes: discounts (school_id filtered)
  |-- no student joins
  |
FinanceReports
  |-- reads: payments, student_assessments (aggregates only)
  |-- no student joins
  |
FinanceAuditLogs
  |-- reads: finance_audit_logs -> profiles(full_name)
  |
YearEndClose
  |-- reads: student_assessments -> students(student_name, lrn, level)
  |-- reads: balance_carry_forwards
  |-- writes: student_assessments, assessment_items, balance_carry_forwards, finance_audit_logs
  |
FinanceSettings
  |-- reads/writes: finance_settings (school_id filtered)
  |-- no student data
```

## RLS Access Verified

The finance user (ivyan@stfxsa.org) has:
- `finance` role in `user_roles`
- `user_school_access` entries for both STFXSA and MABDC
- The `students` table has a dedicated RLS policy: "Finance can view students in their schools" which checks `has_role(uid, 'finance')` AND `school_id IN user_school_access`
- Finance tables use `check_finance_access(school_id)` function which checks `user_school_access` for admin/finance roles

## Data Status

- STFXSA: 12 students, 0 fee catalog items
- MABDC: 534 students, 0 fee catalog items (for the STFXSA school_id)

## What Was Already Fixed

The `FinanceLearnerPage` query was changed from:
```
.select('id, student_name, lrn, gender, level, photo_url, school, school_id, status')
```
to:
```
.select('id, student_name, lrn, gender, level, photo_url, school, school_id')
```

## No Further Code Changes Needed

All other modules use correct column references and proper FK joins. The remaining "empty" states (Fee Setup showing no items, Assessments showing no records) are because **no data has been created yet** for those tables -- not because of bugs.

