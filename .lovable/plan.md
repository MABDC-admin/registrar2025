

# Payment History Dropdown in Student Ledger

## Overview
Add an expandable/collapsible payment history row beneath each student in the Student Ledger table. Clicking a chevron toggle on any ledger row will reveal a detailed sub-table showing all payment records for that learner, including transaction date, amount, method, OR number, reference number, status, and notes.

## User Experience

1. Each row in the Student Ledger gets a toggle (chevron) button in a new first column
2. Clicking the toggle expands a sub-row beneath the student showing their full payment history
3. The sub-table displays: Date, OR #, Amount, Method, Reference #, Status, and Notes
4. Payment data is fetched on-demand when a row is expanded (lazy loading)
5. Multiple rows can be expanded simultaneously
6. Voided payments appear with reduced opacity and strikethrough styling

## Technical Details

### File Modified: `src/components/finance/StudentLedger.tsx`

**State additions:**
- `expandedRows: Set<string>` -- tracks which assessment IDs are currently expanded

**New sub-component: `PaymentHistoryRow`**
- Accepts `assessmentId`, `schoolId`, and `isOpen` props
- Uses `useQuery` to fetch payments from the `payments` table filtered by `assessment_id` and `school_id`, ordered by `payment_date DESC`
- Renders inside a `Collapsible` / `CollapsibleContent` wrapper
- Displays a sub-table with columns: Date, OR #, Amount, Method, Ref #, Status, Notes
- Shows a loading skeleton while fetching
- Shows "No payments recorded" if empty

**Table changes:**
- Add a new first column header (narrow, for the toggle icon)
- Each `TableRow` gets a `ChevronDown`/`ChevronRight` icon button that toggles `expandedRows`
- After each student row, render a full-width `TableRow` containing the `PaymentHistoryRow` component (spans all 9 columns)
- Column count increases from 8 to 9

**Imports to add:**
- `ChevronDown, ChevronRight` from `lucide-react`
- `Collapsible, CollapsibleContent, CollapsibleTrigger` from UI
- `Skeleton` from UI (for loading state)
- `format` from `date-fns` (for date formatting)

**Query for payment history:**
```typescript
supabase
  .from('payments')
  .select('*')
  .eq('assessment_id', assessmentId)
  .eq('school_id', schoolId)
  .order('payment_date', { ascending: false })
```

### No database changes required
The `payments` table already contains all needed columns: `payment_date`, `amount`, `payment_method`, `or_number`, `reference_number`, `status`, `notes`, `void_reason`.

