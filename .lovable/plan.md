
# Make Finance Reports the Default Tab and Remove Portal Home

## Overview

Replace the Finance Portal home page with the Finance Reports page as the default landing view for finance users. The Portal Home is redundant since Reports already provides a comprehensive dashboard with KPIs, charts, and quick stats.

## Changes

### 1. `src/pages/Index.tsx`

- Change the default tab for finance role from `'portal'` to `'finance-reports'` in the initialization useEffect (line ~170)
- Remove the `FinancePortal` import and its render case (`case 'finance'` in `renderPortal`)

### 2. `src/components/layout/DashboardLayout.tsx`

- Remove the `{ id: 'portal', icon: HomeIcon3D, label: 'Portal Home' }` entry from the finance sidebar menu (line 490)
- The first visible item becomes "Learners"

## Technical Details

### File: `src/pages/Index.tsx`
- Remove import of `FinancePortal` (line 79)
- In the `renderPortal` function, remove `case 'finance': return <FinancePortal onNavigate={handleTabChange} />;` (lines 278-279)
- In the initialization useEffect (line 170), change the default from `'portal'` to be role-aware: if role is `'finance'`, default to `'finance-reports'`; otherwise keep `'portal'`

### File: `src/components/layout/DashboardLayout.tsx`
- Remove line 490: `{ id: 'portal', icon: HomeIcon3D, label: 'Portal Home' },` from the finance menu items

### File: `src/components/finance/FinancePortal.tsx`
- No deletion needed (other code may reference it), but it will no longer be rendered

## Summary

- 2 files modified
- No database changes
- Finance users will land directly on the Reports dashboard with charts and KPIs
