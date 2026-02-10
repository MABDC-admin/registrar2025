

# Add Teal Header and Alternating Row Colors to All Tables

## Overview
Apply a consistent teal header background and light grey alternating row colors to every table across the entire application -- covering both schools and all modules.

## Approach: Global + Targeted

The most efficient approach is two-pronged:
1. **Update the shared UI Table component** (`src/components/ui/table.tsx`) -- this automatically applies to all 36 files using the shadcn Table
2. **Update the 6 files using raw HTML `<table>` elements** -- apply matching styles individually

## Visual Style
- **Header**: Teal background (`bg-teal-600 text-white`) with white text for strong contrast
- **Alternating rows**: Even rows get a light grey background (`even:[&>tr]:bg-gray-50 dark:even:[&>tr]:bg-gray-800/30`) for readability
- **Hover**: Preserved on all rows

## Technical Details

### 1. `src/components/ui/table.tsx` (shared component -- affects 36 files)

**TableHeader**: Change from `[&_tr]:border-b` to include teal background:
```
bg-teal-600 text-white [&_tr]:border-b
```

**TableHead**: Update text color from `text-muted-foreground` to `text-white` so header text is visible on teal:
```
text-white font-semibold
```

**TableBody**: Add alternating row colors:
```
[&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-gray-50 dark:[&_tr:nth-child(even)]:bg-gray-800/30
```

### 2. Raw HTML table files (6 files, individual updates)

Each file's `<thead>` and `<tbody>` will get matching teal and alternating styles:

| File | Current Header Style |
|------|---------------------|
| `src/components/students/StudentTable.tsx` | `bg-secondary/50` |
| `src/components/tacticalrmm/AgentTable.tsx` | `bg-muted/50` |
| `src/components/nocodb/NocoDBDashboard.tsx` | `bg-muted/50` |
| `src/components/teachers/TeacherCSVImport.tsx` | `bg-secondary/50` |
| `src/components/import/CSVImport.tsx` | `bg-secondary/50` |
| `src/components/portals/StudentPortal.tsx` | no background |

For each:
- `<thead>` gets `bg-teal-600 text-white`
- `<th>` text color changed to white
- `<tbody>` gets `[&>tr:nth-child(even)]:bg-gray-50`

### Files to Change (8 total)

| File | Change |
|------|--------|
| `src/components/ui/table.tsx` | Teal header, white text, alternating rows (global) |
| `src/components/students/StudentTable.tsx` | Teal header, alternating rows |
| `src/components/tacticalrmm/AgentTable.tsx` | Teal header, alternating rows |
| `src/components/nocodb/NocoDBDashboard.tsx` | Teal header, alternating rows |
| `src/components/teachers/TeacherCSVImport.tsx` | Teal header, alternating rows |
| `src/components/import/CSVImport.tsx` | Teal header, alternating rows |
| `src/components/portals/StudentPortal.tsx` | Teal header, alternating rows |

Note: Some files using the shadcn Table also add their own `className="bg-muted/50"` on `TableRow` inside `TableHeader`. These overrides will be removed where found to let the global teal style apply consistently.

