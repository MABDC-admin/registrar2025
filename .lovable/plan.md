
# Fix "Failed to Read PDF" Error

## Problem
The PDF text extraction (`src/utils/extractPdfText.ts`) uses a CDN-loaded worker that causes version mismatches and CORS failures:
```typescript
// BROKEN - CDN worker often fails
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

Meanwhile, the PDF-to-image utility (`pdfToImages.ts`) already works correctly using a locally bundled worker.

## Fix
Update `src/utils/extractPdfText.ts` to use the same legacy build + local worker pattern that already works in the project:

```typescript
// FIXED - local bundled worker, no CDN/CORS issues
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
```

## Files Changed

| File | Change |
|------|--------|
| `src/utils/extractPdfText.ts` | Replace lines 1-4: switch from CDN worker to local bundled legacy worker |

## No Other Changes
- Same extraction logic, same interfaces, same limits
- No new dependencies (already using `pdfjs-dist`)
- Matches the proven pattern from `pdfToImages.ts`
