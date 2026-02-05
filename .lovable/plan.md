
# Change Dashboard Header to Show Proper School Names

## Overview
Update the dashboard header to display the full school name based on the currently selected school, instead of the generic "School Management System" text.

## Current Behavior
The header shows static text: **"School Management System"** regardless of which school is selected.

## New Behavior
- When MABDC is selected: **"M.A Brain Development Center"**
- When STFXSA is selected: **"St. Francis Xavier Smart Academy Inc"**

## Implementation

### File to Modify
`src/components/dashboard/DashboardHeader.tsx`

### Changes
1. Import the `useSchool` hook from `@/contexts/SchoolContext`
2. Get `schoolTheme` from the hook which contains `fullName`
3. Replace the static "School Management" + "System" text with `schoolTheme.fullName`

### Code Change
```tsx
// Add import
import { useSchool } from '@/contexts/SchoolContext';

// Inside component
const { schoolTheme } = useSchool();

// Replace header text
<h1 className="text-2xl lg:text-3xl font-bold">
  <span className="text-foreground">{schoolTheme.fullName}</span>
</h1>
```

## Result
The header will dynamically show the proper school name that matches the school selected in the sidebar dropdown.
