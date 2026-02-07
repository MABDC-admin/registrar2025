
# Replace Quick Actions Grid with Slider/Carousel Animation

## What Changes
Replace the static 4-column grid of Quick Actions (Admit Student, Messages, Schedule, Enter Grades) with a smooth horizontally-scrollable carousel/slider using the already-installed `embla-carousel-react` library.

## Visual Behavior
- Cards slide horizontally with drag/swipe support
- On desktop: all 4 cards visible but still swipeable
- On mobile: shows 2 cards at a time, user swipes to see more
- Dot indicators at the bottom to show current position
- Smooth spring animation on drag release
- Keeps existing hover effects (3D tilt, Apple style lift, etc.)

## Technical Details

**File: `src/components/dashboard/QuickActions.tsx`**

- Import `useEmblaCarousel` from `embla-carousel-react`
- Wrap action buttons in an Embla carousel container structure:
  - Outer viewport div with `overflow-hidden`
  - Inner container div with `flex` layout
  - Each action button as a slide with responsive width (`basis-1/2 lg:basis-1/4`)
- Add dot navigation indicators below the carousel
- Use `useCallback` + Embla API to track the selected slide index for active dots
- Keep all existing theme variants (modern, classicBlue, apple) and hover animations intact
- Add auto-scroll with loop enabled for a polished feel
