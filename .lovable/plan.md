
# Dashboard UI Theme Switcher with AI Image Analysis

## Overview

This plan uses **Gemini 3 Pro** to analyze the uploaded reference image and extract precise design specifications (colors, shadows, gradients, border-radius values, etc.) to create a pixel-perfect "Classic Blue" theme that users can switch to. All dashboard elements remain identical in functionality - only the visual styling changes.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                      User Interface                              │
├─────────────────────────────────────────────────────────────────┤
│  [Header]  School Name    [Theme Color] [UI Layout] [Avatar]    │
│                              🎨           📐                     │
│            existing         existing    NEW SWITCHER             │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard Layout Context                                        │
│  └── layoutStyle: 'modern' | 'classicBlue'                      │
│  └── Persisted to localStorage                                   │
├─────────────────────────────────────────────────────────────────┤
│  Component Variants (via className props)                        │
│  └── All existing components receive variant styling             │
│  └── NO structural changes - same data, same hooks               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Create Edge Function for AI Image Analysis

Create `supabase/functions/analyze-ui-design/index.ts` that uses **Gemini 3 Pro** to analyze the uploaded image and extract:

| Design Token | Description |
|--------------|-------------|
| `pageBackground` | Gradient direction, colors (hex), blur/texture |
| `cardBackground` | Glassmorphism values (bg opacity, blur, shadow) |
| `statsCards` | Individual colors for each stat card (green, blue, yellow, red) |
| `calendarHeader` | Gradient colors for calendar widget header |
| `borderRadius` | Corner radius values (px/rem) |
| `shadows` | Box-shadow specifications |
| `typography` | Font weights, sizes for headers/labels |

The AI will return a structured JSON with exact CSS values.

### Step 2: Create Dashboard Layout Context

Create `src/contexts/DashboardLayoutContext.tsx`:

```typescript
interface DashboardLayoutContextType {
  layoutStyle: 'modern' | 'classicBlue';
  setLayoutStyle: (style: 'modern' | 'classicBlue') => void;
  classicTheme: ClassicBlueTheme | null; // AI-extracted theme
}
```

- Persists selection to `localStorage`
- Stores AI-extracted theme values for the Classic Blue design

### Step 3: Add UI Layout Switcher Component

Create `src/components/dashboard/DashboardLayoutSwitcher.tsx`:

- Appears as a grid/layout icon next to the existing ColorThemeSelector
- Opens a popover with two visual options: "Modern" and "Classic Blue"
- Shows mini-preview thumbnails of each layout style
- Triggers theme switch on selection

### Step 4: Define Classic Blue Theme CSS Variables

Add to `src/index.css`:

```css
.dashboard-classic-blue {
  --classic-page-bg: linear-gradient(135deg, #4F46E5 0%, #2563EB 50%, #0EA5E9 100%);
  --classic-card-bg: rgba(255, 255, 255, 0.9);
  --classic-card-blur: 12px;
  --classic-card-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  --classic-card-radius: 1.5rem;
  
  /* Stats card colors from reference */
  --classic-stat-green: #22C55E;
  --classic-stat-blue: #3B82F6;
  --classic-stat-yellow: #EAB308;
  --classic-stat-red: #EF4444;
  
  /* Calendar header gradient */
  --classic-calendar-header: linear-gradient(135deg, #3B82F6, #1D4ED8);
}
```

### Step 5: Update Dashboard Components with Variant Support

Modify these components to accept a `variant` prop:

| Component | Classic Blue Changes |
|-----------|---------------------|
| `DashboardStatsRow.tsx` | Use `--classic-stat-*` colors, enhanced shadows |
| `QuickActions.tsx` | White glassmorphism cards with colored icons |
| `BottomActions.tsx` | Third card uses classic blue accent |
| `DashboardCalendar.tsx` | Blue gradient header instead of purple |
| `StudentBirthdays.tsx` | White card with glassmorphism |
| `StudentOverview.tsx` | White card with stronger shadow |
| `DashboardHeader.tsx` | Add layout switcher button |

Example pattern for variant styling:

```typescript
// In DashboardStatsRow.tsx
const statCardClass = cn(
  "rounded-xl p-4 text-white flex items-center justify-between",
  variant === 'classicBlue' 
    ? "shadow-lg rounded-2xl" // Enhanced for classic
    : "shadow-md"             // Current modern style
);
```

### Step 6: Update AdminPortal with Conditional Styling

Modify `src/components/portals/AdminPortal.tsx`:

```typescript
const { layoutStyle } = useDashboardLayout();

return (
  <div className={cn(
    "space-y-6",
    layoutStyle === 'classicBlue' && "dashboard-classic-blue"
  )}>
    {/* Same components, different styling via CSS class */}
    <DashboardHeader />
    <DashboardStatsRow variant={layoutStyle} ... />
    <QuickActions variant={layoutStyle} ... />
    {/* ... rest of components */}
  </div>
);
```

### Step 7: Add Provider to App.tsx

Wrap the app with `DashboardLayoutProvider`:

```typescript
<DashboardLayoutProvider>
  <ColorThemeProvider>
    {/* existing providers */}
  </ColorThemeProvider>
</DashboardLayoutProvider>
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/analyze-ui-design/index.ts` | Create | Gemini Pro image analysis for design extraction |
| `src/contexts/DashboardLayoutContext.tsx` | Create | Layout style state management |
| `src/components/dashboard/DashboardLayoutSwitcher.tsx` | Create | UI toggle component |
| `src/index.css` | Modify | Add `.dashboard-classic-blue` CSS class |
| `src/components/dashboard/DashboardHeader.tsx` | Modify | Add layout switcher button |
| `src/components/dashboard/DashboardStatsRow.tsx` | Modify | Add `variant` prop support |
| `src/components/dashboard/QuickActions.tsx` | Modify | Add `variant` prop support |
| `src/components/dashboard/BottomActions.tsx` | Modify | Add `variant` prop support |
| `src/components/dashboard/DashboardCalendar.tsx` | Modify | Add `variant` prop for header color |
| `src/components/dashboard/StudentBirthdays.tsx` | Modify | Add `variant` prop support |
| `src/components/dashboard/StudentOverview.tsx` | Modify | Add `variant` prop support |
| `src/components/portals/AdminPortal.tsx` | Modify | Apply layout class and pass variant |
| `src/App.tsx` | Modify | Add DashboardLayoutProvider |
| `supabase/config.toml` | Modify | Register new edge function |

---

## AI Image Analysis Prompt

The edge function will send this prompt to Gemini 3 Pro:

```text
Analyze this dashboard UI design image and extract EXACT design specifications as JSON:

{
  "pageBackground": {
    "type": "gradient",
    "direction": "135deg",
    "colors": ["#hex1", "#hex2", "#hex3"]
  },
  "cards": {
    "backgroundColor": "rgba(255,255,255,0.9)",
    "backdropBlur": "12px",
    "borderRadius": "24px",
    "boxShadow": "0 8px 32px rgba(0,0,0,0.12)"
  },
  "statsCards": {
    "students": { "color": "#hex", "iconBg": "rgba()" },
    "teachers": { "color": "#hex", "iconBg": "rgba()" },
    "classes": { "color": "#hex", "iconBg": "rgba()" },
    "library": { "color": "#hex", "iconBg": "rgba()" }
  },
  "calendarHeader": {
    "gradient": "linear-gradient(135deg, #hex1, #hex2)"
  },
  "typography": {
    "headerWeight": 700,
    "statNumberSize": "2rem"
  }
}
```

---

## Visual Comparison

```text
MODERN (Current)                    CLASSIC BLUE (New)
┌──────────────────────┐            ┌──────────────────────┐
│ ▒▒▒ Gradient BG ▒▒▒  │            │ 🔵 Blue Gradient BG  │
│                      │            │                      │
│ ┌────┐┌────┐┌────┐   │            │ ┌────┐┌────┐┌────┐   │
│ │ 🟢 ││ 🔵 ││ 🟡 │   │ ──SAME──▶ │ │ 🟢 ││ 🔵 ││ 🟡 │   │
│ └────┘└────┘└────┘   │   DATA    │ └────┘└────┘└────┘   │
│                      │            │                      │
│ ┌─────────────────┐  │            │ ┌─────────────────┐  │
│ │ Calendar (purple)│  │            │ │ Calendar (blue) │  │
│ └─────────────────┘  │            │ └─────────────────┘  │
│                      │            │                      │
│ Normal shadows       │            │ Stronger shadows     │
│ Current card style   │            │ Glassmorphism cards  │
└──────────────────────┘            └──────────────────────┘
```

---

## Technical Details

### Edge Function Flow

1. User uploads image → stored temporarily or passed as base64
2. Edge function calls Gemini 3 Pro with image + extraction prompt
3. AI returns structured JSON with design tokens
4. Frontend stores tokens in context
5. CSS variables updated dynamically based on tokens

### Theme Persistence

- Layout choice saved to `localStorage` as `dashboard-layout-style`
- AI-extracted theme cached to avoid re-analysis
- Falls back to default Classic Blue values if AI fails

### No Data Changes

- All hooks (`useStudents`, `useQuery`, etc.) remain unchanged
- All component logic stays identical
- Only `className` props receive conditional values
- Existing ColorThemeContext continues to work for sidebar colors

---

## Benefits

1. **AI-Powered Accuracy**: Gemini Pro extracts exact colors/values from the reference image
2. **Zero Data Impact**: Same functionality, different visuals
3. **Extensible**: Can add more UI themes later using same pattern
4. **User Preference**: Choice persisted across sessions
5. **Performance**: CSS-only changes, no component re-renders for theme switch
