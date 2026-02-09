

# Finance Module - Complete Implementation

## Overview

Build a complete Finance Management System with a new `finance` role, 10+ modules, and all associated database tables, UI components, and navigation. Create account for **Ivy Ann P. Dargantes** (ivyan@stfxsa.org / 123456).

## Phase 1: Database & Role Setup

### 1A. Add `finance` to `app_role` enum

```sql
ALTER TYPE public.app_role ADD VALUE 'finance';
```

### 1B. Create Finance User Account

Use the `create-users` edge function (updated to support `create_finance` action) to create:
- Email: `ivyan@stfxsa.org`
- Password: `123456`
- Full Name: `Ivy Ann P. Dargantes`
- Role: `finance`

Also grant school access to STFXSA via `user_school_access`.

### 1C. Create Database Tables (15 tables)

| Table | Purpose |
|-------|---------|
| `fee_catalog` | Master list of fee items (tuition, misc, books, etc.) |
| `fee_templates` | Fee templates per SY/grade level/strand |
| `fee_template_items` | Items linked to each template |
| `student_assessments` | Per-student fee assessment (generated from template) |
| `assessment_items` | Individual fee line items per assessment |
| `payments` | Payment records (cash, bank, e-wallet, etc.) |
| `payment_proofs` | Uploaded proof images/PDFs |
| `payment_plans` | Installment schedules |
| `payment_plan_installments` | Individual installment due dates/amounts |
| `discounts` | Discount/scholarship definitions |
| `student_discounts` | Discounts applied to specific students |
| `finance_clearance` | Clearance status per student per SY |
| `clearance_rules` | Configurable clearance rules |
| `finance_settings` | School-level finance configuration |
| `finance_audit_logs` | Finance-specific audit trail |

All tables will have:
- `school_id` for multi-tenant separation
- `academic_year_id` where applicable
- Proper RLS policies restricting access to `finance` and `admin` roles
- Timestamps and audit fields

### Key Table Schemas

**fee_catalog:**
```
id, school_id, name, description, category (tuition/misc/books/uniform/lab/id/other),
amount, is_mandatory, is_recurring, is_active, created_at, updated_at
```

**student_assessments:**
```
id, student_id, school_id, academic_year_id, template_id, total_amount,
discount_amount, net_amount, total_paid, balance, status (pending/partial/paid/overpaid),
assessed_by, assessed_at, created_at, updated_at
```

**payments:**
```
id, assessment_id, student_id, school_id, academic_year_id, amount, payment_method
(cash/bank_deposit/online_transfer/e_wallet/card), reference_number, or_number,
receipt_type (OR/AR), payment_date, received_by, status (pending/verified/voided),
void_reason, voided_by, voided_at, notes, created_at, updated_at
```

**payment_plans:**
```
id, assessment_id, student_id, school_id, plan_type (monthly/quarterly),
total_installments, grace_period_days, late_fee_type (fixed/percentage/per_day),
late_fee_amount, created_by, created_at
```

**discounts:**
```
id, school_id, name, type (percentage/fixed/coverage), value, applies_to (all/specific_fees),
fee_item_ids[], max_cap, stackable, requires_approval, required_documents[],
valid_from, valid_until, is_active, created_at
```

**finance_clearance:**
```
id, student_id, school_id, academic_year_id, is_cleared, cleared_at, cleared_by,
balance_threshold, blocks_exams, blocks_grades, blocks_enrollment,
auto_generated, created_at, updated_at
```

**finance_settings:**
```
id, school_id, academic_year_id, default_payment_terms, late_fee_enabled,
late_fee_type, late_fee_amount, refund_policy, or_number_format, or_next_number,
ar_number_format, ar_next_number, convenience_fee_mode (absorb/pass),
convenience_fee_amount, clearance_threshold, auto_clearance, created_at, updated_at
```

**finance_audit_logs:**
```
id, school_id, user_id, action, table_name, record_id, old_values (jsonb),
new_values (jsonb), reason, ip_address, created_at
```

### RLS Policy Strategy

- `finance` and `admin` roles get full CRUD on all finance tables
- `registrar` gets SELECT on assessments, clearance (read-only view)
- `student` gets SELECT on own assessments, payments, clearance via `user_credentials` join
- `parent` gets SELECT on linked children's data
- All INSERT/UPDATE/DELETE restricted to `finance` + `admin`

## Phase 2: Edge Function Updates

### Update `create-users` function
Add `create_finance` action to create finance user accounts, following the same pattern as `create_admin`/`create_registrar`.

## Phase 3: Frontend - Auth & Navigation

### 3A. Update AuthContext
- Add `'finance'` to the `AppRole` type union

### 3B. Update DashboardLayout navigation
- Add `finance` role to `getNavGroupsForRole()` with sidebar groups:
  - **Portal Home**
  - **Billing** (Fees Setup, Assessments, Discounts & Scholarships)
  - **Payments** (Cashier, Payment Plans, Payment Verification)
  - **Accounts** (Student Ledger, Clearance)
  - **Reports** (Collections, Outstanding, Revenue)
  - **Settings** (Finance Settings, Audit Logs)

- Add `finance` to `roleColors` and `roleLabels` maps

### 3C. Update Icon Maps
- Add finance-specific icon mappings for all new nav items

## Phase 4: Frontend - Finance Portal & Modules (10 Components)

### 4A. `FinancePortal.tsx` - Portal Home Dashboard
- Quick stats: Total Collections Today, Outstanding Balances, Cleared Students %, Pending Verifications
- Quick actions: Accept Payment, Search Student, Generate SOA
- Recent payments list
- Collections chart (daily/weekly)

### 4B. `FeeSetup.tsx` - Fee Catalog & Templates
- Fee catalog CRUD (add/edit/delete fee items)
- Fee templates per SY + grade level
- Assign fee items to templates with amounts
- Mark mandatory vs optional
- One-time vs recurring toggle

### 4C. `StudentAssessments.tsx` - Student Billing
- Auto-generate assessments from fee templates
- Per-student view with all fee line items
- Apply discounts/scholarships
- Assessment status tracking
- Bulk assessment generation by grade level

### 4D. `PaymentCollection.tsx` - Cashier Dashboard
- Fast student search
- Accept payment form (amount, method, reference)
- Generate OR/AR number
- Partial payment support
- Upload proof of payment
- Print receipt
- End-of-day summary view

### 4E. `PaymentPlans.tsx` - Installment Management
- Create payment plans (monthly/quarterly)
- Auto-calculate installment amounts and due dates
- Configure grace periods and late fees
- Track installment status
- Overdue highlighting

### 4F. `StudentLedger.tsx` - Ledger & SOA
- Complete student account view (charges, payments, balance)
- Filterable by SY/quarter
- Printable/downloadable Statement of Account (PDF)
- Running balance calculation
- Parent portal read-only view support

### 4G. `DiscountScholarships.tsx` - Discounts & Scholarships
- CRUD for discount/scholarship types
- Percentage, fixed, or per-item coverage
- Approval workflow (pending/approved/rejected)
- Required documents checklist
- Stacking rules configuration
- Apply to individual students

### 4H. `FinanceClearance.tsx` - Clearance Management
- Per-student clearance status
- Configurable clearance rules (exam permit, grades release, enrollment)
- Auto-clear when balance falls below threshold
- Manual override capability
- Bulk clearance operations
- Generate clearance certificates

### 4I. `FinanceReports.tsx` - Reports & Analytics
- Collections by day/week/month (chart + table)
- Outstanding balances with aging (30/60/90 days)
- Revenue breakdown by fee type
- Student account status summary (cleared/not cleared)
- Export to Excel/CSV
- Printable report layouts

### 4J. `FinanceSettings.tsx` - Settings & Configuration
- Payment terms configuration
- Late fee rules (fixed/percentage/per-day)
- Refund policy settings
- OR/AR numbering format
- Payment channel enable/disable
- Clearance threshold settings
- Convenience fee mode (absorb/pass-through)

### 4K. `FinanceAuditLogs.tsx` - Audit Trail
- Filterable log of all finance actions
- Who/when/why for every adjustment
- Immutable receipt history
- Export capability

## Phase 5: Wire Up in Index.tsx

- Add `FinancePortal` to the `renderPortal()` switch
- Add conditional rendering blocks for all finance tabs (same pattern as existing admin/registrar tabs)
- Finance role gets access to: all finance modules + library + reports

## File Structure

```text
src/components/finance/
  FinancePortal.tsx
  FeeSetup.tsx
  StudentAssessments.tsx
  PaymentCollection.tsx
  PaymentPlans.tsx
  StudentLedger.tsx
  DiscountScholarships.tsx
  FinanceClearance.tsx
  FinanceReports.tsx
  FinanceSettings.tsx
  FinanceAuditLogs.tsx
```

## Technical Details

### Database Migration Summary
- 1 enum alteration (`app_role` + `finance`)
- 15 new tables with RLS
- Appropriate indexes on `school_id`, `student_id`, `academic_year_id`
- Foreign keys to `students`, `schools`, `academic_years`

### Storage
- Use existing `student-documents` bucket or create `payment-proofs` bucket for receipt uploads

### Key Patterns Followed
- Multi-tenant via `school_id` (same as existing)
- Academic year scoping (same as existing)
- RLS with `has_role()` function (same as existing)
- Portal + sidebar navigation pattern (same as existing roles)
- Audit logging pattern (same as existing `audit_logs`)

### User Creation
- Ivy Ann P. Dargantes: `ivyan@stfxsa.org` / `123456` / role: `finance`
- School access: STFXSA (`22222222-2222-2222-2222-222222222222`)

### Implementation Order
1. Database migration (all 15 tables + enum)
2. Edge function update (create_finance action)
3. Create Ivy Ann's account
4. AuthContext + DashboardLayout updates
5. Finance components (Portal first, then modules)
6. Index.tsx wiring

