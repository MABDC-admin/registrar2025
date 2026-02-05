
# PDF-to-Image Flipbook Implementation Plan

## Overview
Replace the external sync functionality with a complete client-side PDF-to-image system that allows admins to upload PDF books directly. The system will render each PDF page to images in the browser and store them for a flipbook viewer. Both schools (MABDC and STFXSA) will be supported via the `school` column.

---

## Database Schema Changes

### 1. Create `books` Table
Stores book metadata with school association:

```sql
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  subject TEXT,
  cover_url TEXT,
  pdf_url TEXT,
  page_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',  -- 'processing', 'ready', 'error'
  school TEXT,  -- 'MABDC', 'STFXSA', or NULL for both
  uploaded_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2. Create `book_pages` Table
Stores rendered page images:

```sql
CREATE TABLE public.book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, page_number)
);
```

### 3. Create Storage Buckets

```sql
-- Public bucket for rendered page images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-pages', 'book-pages', true)
ON CONFLICT (id) DO NOTHING;

-- Private bucket for source PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdf-uploads', 'pdf-uploads', false)
ON CONFLICT (id) DO NOTHING;
```

### 4. RLS Policies

- Anyone can view active books
- Admins and registrars can manage books
- School-based filtering for book visibility

---

## New Files to Create

### 1. `src/hooks/usePdfToImages.ts`
Core hook for client-side PDF processing:
- Loads PDF using existing pdfjs-dist (already configured in `src/utils/pdfToImages.ts`)
- Renders each page to canvas at 2x scale for high-res images
- Creates thumbnails at 0.3x scale
- Uploads images to `book-pages` bucket
- Inserts records into `book_pages` table
- Tracks progress (rendering, uploading, done)
- Processes pages in batches of 3 for performance

### 2. `src/components/library/BookUploadModal.tsx`
Admin upload dialog:
- Title input field
- Grade level dropdown (1-12)
- Subject dropdown (optional)
- School selector (MABDC, STFXSA, or Both)
- PDF file input with drag-and-drop
- Progress bar showing conversion status
- Cancel/upload buttons

### 3. `src/components/library/BookCard.tsx`
Display card for books (replaces/updates FlipbookCard):
- Shows cover image (first page)
- Title and grade level badge
- Click to open flipbook viewer

### 4. `src/components/library/FlipbookViewer.tsx`
Full-screen flipbook reader:
- Page navigation (prev/next, page numbers)
- Thumbnail sidebar for quick navigation
- Zoom controls
- Keyboard navigation (arrow keys)
- Fullscreen toggle

---

## Files to Modify

### 1. `src/components/library/LibraryPage.tsx`
- Remove sync button and import mutation
- Add "Upload Book" button (admin only)
- Change query from `flipbooks` table to `books` table
- Add school filtering based on `selectedSchool` context
- Filter by grade level (update grade level options for numeric)
- Integrate BookUploadModal

### 2. `package.json`
- Already has `pdfjs-dist` (version 5.4.530)
- No additional dependencies needed

---

## Data Flow

```text
User uploads PDF
       |
       v
+------------------+
| BookUploadModal  |
+------------------+
       |
       v
+------------------+
| Create book      |  status: 'processing'
| record in DB     |
+------------------+
       |
       v
+------------------+
| Upload source    |  to 'pdf-uploads' bucket
| PDF (optional)   |
+------------------+
       |
       v
+------------------+
| usePdfToImages   |  Client-side rendering
| hook processes   |
+------------------+
       |
       | For each page:
       v
+------------------+
| Render to canvas |  Scale 2.0 (high-res)
| Create PNG blob  |
+------------------+
       |
       v
+------------------+
| Render thumbnail |  Scale 0.3
| Create PNG blob  |
+------------------+
       |
       v
+------------------+
| Upload to        |  {bookId}/page-{n}.png
| book-pages       |  {bookId}/thumb-{n}.png
+------------------+
       |
       v
+------------------+
| Insert into      |  book_pages table
| database         |
+------------------+
       |
       | After all pages:
       v
+------------------+
| Update book      |  status: 'ready'
| page_count,      |  cover_url = page-1.png
| cover_url        |
+------------------+
```

---

## School Support

Both schools will see books based on the `school` column:
- `school = 'MABDC'`: Only visible to MABDC users
- `school = 'STFXSA'`: Only visible to STFXSA users
- `school = NULL`: Visible to both schools

The upload modal will have a dropdown:
- "M.A Brain Development Center"
- "St. Francis Xavier Smart Academy"
- "Both Schools"

---

## Technical Details

| Aspect | Implementation |
|--------|---------------|
| PDF Library | pdfjs-dist (already installed, legacy build) |
| Worker Config | Uses existing bundled worker from `src/utils/pdfToImages.ts` |
| Image Format | PNG at 90% quality for pages, 70% for thumbnails |
| Scale Factors | 2.0x for full images, 0.3x for thumbnails |
| Batch Size | 3 pages processed concurrently |
| Storage Bucket | `book-pages` (public) |
| File Naming | `{bookId}/page-{num}.png`, `{bookId}/thumb-{num}.png` |
| Status Tracking | 'processing' -> 'ready' or 'error' |

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/hooks/usePdfToImages.ts` |
| Create | `src/components/library/BookUploadModal.tsx` |
| Create | `src/components/library/BookCard.tsx` |
| Create | `src/components/library/FlipbookViewer.tsx` |
| Modify | `src/components/library/LibraryPage.tsx` |
| Delete | `supabase/functions/import-flipbooks/index.ts` |
| Migration | Create books table, book_pages table, storage buckets, RLS policies |

---

## Migration to Run

```sql
-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  grade_level INTEGER NOT NULL,
  subject TEXT,
  cover_url TEXT,
  pdf_url TEXT,
  page_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  school TEXT,
  uploaded_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create book_pages table
CREATE TABLE IF NOT EXISTS public.book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, page_number)
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books
CREATE POLICY "Anyone can view active books" ON public.books
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage books" ON public.books
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Registrars can manage books" ON public.books
  FOR ALL USING (has_role(auth.uid(), 'registrar'::app_role));

-- RLS Policies for book_pages
CREATE POLICY "Anyone can view book pages" ON public.book_pages
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage book pages" ON public.book_pages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Registrars can manage book pages" ON public.book_pages
  FOR ALL USING (has_role(auth.uid(), 'registrar'::app_role));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-pages', 'book-pages', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdf-uploads', 'pdf-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for book-pages (public read, authenticated write)
CREATE POLICY "Public read access for book pages"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-pages');

CREATE POLICY "Authenticated users can upload book pages"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'book-pages' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete book pages"
ON storage.objects FOR DELETE
USING (bucket_id = 'book-pages' AND has_role(auth.uid(), 'admin'::app_role));
```
