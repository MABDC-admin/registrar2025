
# Improve Book Thumbnail Quality

## Problem

Book thumbnails in the library grid appear blurry. This is caused by:

1. **Thumbnails rendered at scale 0.3** - This produces very small images (~200px wide) that get stretched when displayed
2. **CSS scaling** - The `object-cover` CSS on book cards may stretch low-resolution images

## Solution

Increase the rendering scale for thumbnails and covers to produce sharper images.

## Changes

### File: `src/hooks/usePdfToImages.ts`

| Setting | Current | New | Purpose |
|---------|---------|-----|---------|
| Thumbnail scale | 0.3 | 0.5 | Better quality for grid cards |
| High-res page scale | 2.0 | 2.0 | Keep as-is (used for flipbook viewing) |
| First page preview | 1.5 | 2.0 | Sharper cover for book cards |

**Line 141** - Change thumbnail scale:
```typescript
// Before
const thumbBlob = await renderPageToBlob(pdf, pNum, 0.3);

// After  
const thumbBlob = await renderPageToBlob(pdf, pNum, 0.5);
```

**Line 52** - Change first page preview scale:
```typescript
// Before
export async function renderFirstPagePreview(
  pdfFile: File,
  scale: number = 1.5
): Promise<...>

// After
export async function renderFirstPagePreview(
  pdfFile: File,
  scale: number = 2.0
): Promise<...>
```

### File: `src/components/library/BookCard.tsx`

Add `image-rendering` CSS hint to help browsers render the scaled image more crisply:

**Line 154-157** - Update image styling:
```typescript
// Before
<img
  src={book.cover_url}
  alt={book.title}
  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
/>

// After
<img
  src={book.cover_url}
  alt={book.title}
  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
  style={{ imageRendering: 'auto' }}
  loading="lazy"
/>
```

## Impact

- **New uploads** will have sharper thumbnails automatically
- **Existing books** will need to be re-uploaded to get the higher resolution covers
- File sizes will increase slightly (~2x for thumbnails) but remain reasonable

## Note for Existing Books

For books already in the library, the covers were generated at the old lower resolution. To get sharper thumbnails for existing books, you would need to:
1. Delete the book
2. Re-upload the PDF

Or I can add a "Regenerate Cover" option to re-process existing books if you'd like.
