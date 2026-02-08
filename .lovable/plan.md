

# Fix Scanning Loop and Rename Storage Paths to .webp

## Problem 1: Scanning Loop
The `FlipbookViewer` triggers `detectPagesSequentially` inside a `useEffect` that depends on `[pages, isDetecting, detectPagesSequentially]`. The issue is:
- `detectPagesSequentially` is recreated every time `detectedPages` changes (it's in its dependency array in `usePageDetection`)
- When detection finishes, `isDetecting` flips to `false`, which re-triggers the effect
- This creates an infinite loop: detect -> complete -> re-trigger -> detect again (even though internally it filters already-detected pages, the function reference keeps changing)

## Problem 2: .png Extension for WebP Files
In `usePdfToImages.ts`, storage paths use `.png` extensions (`page-${pNum}.png`, `thumb-${pNum}.png`) but the actual uploaded content is WebP (`image/webp`). This is misleading and could cause caching/MIME issues.

## Changes

### File: `src/hooks/usePageDetection.ts`
- Stabilize `detectPagesSequentially` by using a ref for `detectedPages` instead of including it in the `useCallback` dependency array
- This prevents the function reference from changing every time a page is detected, breaking the re-trigger loop

### File: `src/components/library/FlipbookViewer.tsx` (lines 135-145)
- Fix the auto-detect `useEffect` to only run once when pages are first loaded
- Remove `isDetecting` and `detectPagesSequentially` from the dependency array
- Use a ref to track if detection was already triggered for this book

### File: `src/hooks/usePdfToImages.ts`
- Rename `page-${pNum}.png` to `page-${pNum}.webp`
- Rename `thumb-${pNum}.png` to `thumb-${pNum}.webp`
- Update the final `getPublicUrl` call to use `.webp`

### File: `src/utils/pdfToImages.ts`
- No changes needed (it uses blob URLs, not storage paths)

## Notes
- Existing books with `.png` paths in the database will still work -- those URLs are already stored in `book_pages.image_url` and `book_pages.thumbnail_url`
- Only newly uploaded books will get `.webp` extensions going forward

