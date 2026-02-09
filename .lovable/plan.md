

# Enhance Finance Pages: Color Coding, Icons, Filters, Edit, and Print

## Overview

Apply visual and functional improvements across the three main finance pages: **Payment Collection (Cashier)**, **Student Assessments**, and **Payment Plans**.

## Changes

### 1. PaymentCollection.tsx -- Major Enhancements

**Color-coded status badges:**
- `verified` -- green (bg-green-100 text-green-800)
- `pending` -- yellow
- `voided` -- red

**Styled table headers:**
- Add a subtle background color to the TableHeader row (e.g., `bg-muted/50`)

**Money icons:**
- Add `Banknote` icon next to Amount column header
- Add `Wallet` icon next to Method column header
- Add `DollarSign` icon in the page title area

**Grade filter:**
- Fetch payments joined with `students.level`
- Add a grade-level dropdown filter above the table (All, Grade 1-12, etc.)
- Filter the displayed payments by the selected grade

**Edit Payment (void and re-record):**
- Add an "Edit" button (pencil icon) on each payment row
- Opens a dialog showing the payment details pre-filled
- Allows updating amount, method, reference number, and notes
- On save: voids the original payment (sets `status = 'voided'`, `voided_by`, `voided_at`, `void_reason = 'Edited'`) and creates a new corrected payment
- Recalculates the student assessment totals accordingly
- This approach preserves the audit trail instead of silently modifying records

**Print Receipt:**
- Add a "Print" button (printer icon) on each payment row
- Opens a printable receipt in a new window using `window.open` + `document.write`
- Receipt contains: school name, OR number, student name, LRN, amount, payment method, date, received by
- Styled for thermal/A5 printing

### 2. StudentAssessments.tsx -- Visual Polish

**Status badges already have color coding** (lines 18-24) -- no changes needed there.

**Styled table headers:**
- Add `bg-muted/50` to the TableHeader row

**Money icons:**
- Add `Banknote` icon next to Total, Net, Paid, Balance column headers
- Add `DollarSign` or `CircleDollarSign` icon in the page title

**Grade filter:**
- Add a grade-level Select dropdown next to the search input
- Filter assessments by `students.level`

### 3. PaymentPlans.tsx -- Visual Polish

**Styled table headers:**
- Add `bg-muted/50` to all TableHeader rows (main table and installment sub-table)

**Color-coded installment status** (already partially done on line 277):
- Ensure consistent colors: `paid` = green, `overdue` = destructive/red, `pending` = yellow/secondary

**Money icons:**
- Add `Banknote` icon next to Late Fee and Amount headers
- Add `Wallet` icon in the page title

## Technical Details

### Files Modified

1. **`src/components/finance/PaymentCollection.tsx`**
   - Add imports: `Banknote, Wallet, DollarSign, Printer, Pencil` from lucide-react
   - Add state: `gradeFilter`, `editDialogOpen`, `editingPayment`
   - Update payments query to include `students.level` in the select
   - Add grade filter dropdown in the toolbar
   - Add status color map (like StudentAssessments already has)
   - Add edit mutation (void old + insert new + recalc assessment)
   - Add `printReceipt` function using `window.open`
   - Add Edit and Print icon buttons to each table row
   - Style TableHeader with `bg-muted/50`

2. **`src/components/finance/StudentAssessments.tsx`**
   - Add imports: `Banknote, CircleDollarSign` from lucide-react
   - Add `gradeFilter` state
   - Add grade filter Select next to search
   - Add icons to column headers
   - Style TableHeader with `bg-muted/50`

3. **`src/components/finance/PaymentPlans.tsx`**
   - Add imports: `Banknote, Wallet` from lucide-react
   - Add icons to column headers
   - Style both TableHeader rows with `bg-muted/50`
   - Ensure installment status badges use consistent color classes

### Edit Payment Flow (Void + Re-record)

```text
User clicks Edit on a payment
  -> Edit dialog opens with current values pre-filled
  -> User modifies amount / method / reference / notes
  -> Click "Save Changes"
     -> UPDATE original payment: status='voided', voided_by, voided_at, void_reason='Corrected'
     -> Reverse original amount from assessment (total_paid -= old_amount)
     -> INSERT new payment with corrected values (new OR number)
     -> Add new amount to assessment (total_paid += new_amount)
     -> Recalculate balance and status
     -> Invalidate queries
```

### Print Receipt Template

A simple HTML document written via `window.open()` containing:
- School name (from schoolData)
- "OFFICIAL RECEIPT" header
- OR Number
- Date
- Student Name and LRN
- Amount in words and figures
- Payment method and reference
- Received by
- Print-friendly CSS (no margins, monospaced feel)

### Grade Levels for Filter

Extract unique grade levels from the data already fetched (from `students.level` field) to populate the filter dropdown dynamically.

## Summary

- 3 files modified
- No database changes
- Adds: color-coded statuses, styled headers, money icons, grade filters, edit (void+re-record), and print receipt

