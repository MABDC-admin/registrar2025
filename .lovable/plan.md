

# Fix Missing Scrollbar in Book Upload Modal

## Problem
The ScrollArea in the book upload modal doesn't show a scrollbar when many books are added. The Radix ScrollArea component requires the container to have a fixed/constrained height so the internal viewport can detect overflow and render the scrollbar.

## Solution

Update `BookUploadModal.tsx` with two changes:

1. **Force a fixed height on ScrollArea** instead of relying on `flex-1 + max-h`. Replace `flex-1 min-h-0 max-h-[340px]` with a simple `h-[340px]` so the container always has a defined height, ensuring overflow is detected.

2. **Make the scrollbar always visible** by adding `type="always"` to the ScrollArea component, which tells Radix to always render the scrollbar (not just on hover/scroll).

## Technical Details

**File:** `src/components/library/BookUploadModal.tsx` (line 286)

Change:
```tsx
<ScrollArea className="flex-1 min-h-0 max-h-[340px] border rounded-lg">
```
To:
```tsx
<ScrollArea className="h-[340px] border rounded-lg" type="always">
```

This ensures:
- The ScrollArea has a concrete height constraint for overflow detection
- The scrollbar is always visible (not hidden until hover)
- Works correctly regardless of how many books are in the list
