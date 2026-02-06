

# AI-Powered Library Search with OCR Indexing

## Overview

This feature adds a powerful AI-powered search system to the library that:
1. **Background OCR Indexing**: Automatically scans all book pages using AI vision to extract text, topics, and lessons
2. **Full-Text Search**: Enables keyword-based search across all indexed content
3. **Direct Page Navigation**: When users click a search result, opens the flipbook directly at the matching page

---

## System Architecture

```text
+--------------------+     +----------------------+     +------------------+
|   Library Page     |     |   Edge Function      |     |   Database       |
|                    |     |   (ocr-index-book)   |     |                  |
| [Search Bar]       |---->|   - Fetch pages      |---->| book_page_index  |
| [AI Search Button] |     |   - OCR via Gemini   |     | - extracted_text |
|                    |     |   - Extract topics   |     | - topics[]       |
+--------------------+     |   - Save to DB       |     | - keywords[]     |
         |                 +----------------------+     +------------------+
         |                                                      |
         v                                                      v
+--------------------+     +----------------------+     +------------------+
| Search Results     |     |   Edge Function      |     |   Query          |
| Page               |<----|   (search-books)     |<----| Full-text search |
|                    |     |   - Search index     |     | with ranking     |
| [Book Card + Page] |     |   - Return matches   |     |                  |
+--------------------+     +----------------------+     +------------------+
         |
         v
+--------------------+
| Flipbook Viewer    |
| Opens at Page X    |
+--------------------+
```

---

## Database Schema Changes

### New Table: `book_page_index`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| book_id | uuid | Foreign key to books |
| page_id | uuid | Foreign key to book_pages |
| page_number | integer | Page number |
| extracted_text | text | Full OCR text from the page |
| topics | text[] | AI-detected topics/lessons |
| keywords | text[] | Searchable keywords |
| chapter_title | text | Detected chapter/section title |
| summary | text | Brief AI summary of page content |
| indexed_at | timestamptz | When indexing completed |
| index_status | text | pending, processing, completed, error |

### Index for Full-Text Search

```sql
-- GIN index for full-text search
CREATE INDEX idx_book_page_index_fts ON book_page_index 
USING gin(to_tsvector('english', extracted_text || ' ' || array_to_string(topics, ' ') || ' ' || array_to_string(keywords, ' ')));
```

### Update Books Table

Add `index_status` column to track overall book indexing progress:
- `pending` - Not yet indexed
- `indexing` - Currently being indexed
- `indexed` - Fully indexed
- `error` - Indexing failed

---

## Edge Functions

### 1. `ocr-index-book` - Background OCR Processing

**Purpose**: Processes all pages of a book for OCR indexing in the background

**Process Flow**:
1. Receive book_id and optional page range
2. Fetch all pages for the book from `book_pages`
3. For each page (sequentially to avoid rate limits):
   - Call Lovable AI Gateway with the page image
   - Extract: full text, topics, keywords, chapter title, summary
   - Save to `book_page_index` table
4. Update book `index_status` when complete

**AI Prompt Strategy**:
```text
Analyze this textbook/book page image and extract:
1. All visible text (OCR) - preserve formatting
2. Topics/Lessons mentioned (e.g., "Photosynthesis", "Chapter 5: Fractions")
3. Keywords for search (10-20 words)
4. Chapter/Section title if visible
5. 1-2 sentence summary of the page content

Return as JSON.
```

### 2. `search-books` - Search API

**Purpose**: Search across all indexed content and return matching pages

**Features**:
- Full-text search using PostgreSQL tsvector
- Ranking by relevance
- Highlight matching text snippets
- Group results by book

**Response Format**:
```json
{
  "results": [
    {
      "book_id": "...",
      "book_title": "Grammar Essentials",
      "cover_url": "...",
      "matches": [
        {
          "page_number": 45,
          "page_id": "...",
          "snippet": "...the **keyword** appears in this context...",
          "topics": ["Verb Tenses", "Past Perfect"],
          "relevance_score": 0.95
        }
      ]
    }
  ]
}
```

---

## Frontend Components

### 1. Enhanced Library Search Bar

Replace existing simple search with AI-powered version:

```text
+-------------------------------------------------------+
| [Search icon] Search topics, lessons, content...   [AI] |
+-------------------------------------------------------+
        |                                            |
        v                                            v
    Basic filter                            Trigger AI search
    (title/subject)                         (opens results page)
```

**Features**:
- Debounced input for type-ahead suggestions
- "AI Search" button triggers full content search
- Visual indicator showing which books are indexed
- Quick topic suggestions based on indexed content

### 2. Search Results Page

New component: `src/components/library/SearchResultsView.tsx`

```text
+------------------------------------------------------------------+
| Library > Search Results for "photosynthesis"                     |
|                                                                   |
| Found 23 matches in 4 books                                       |
+------------------------------------------------------------------+
|                                                                   |
| [Book Cover] Science Grade 7                                      |
|   Page 45: "...process of photosynthesis converts..."            |
|   Page 46: "...chlorophyll is essential for photosynthesis..."   |
|   Page 52: "...photosynthesis equation: 6CO2 + 6H2O..."          |
|   [Open Book]                                                     |
|                                                                   |
| [Book Cover] Biology Essentials                                   |
|   Page 12: "...introduction to photosynthesis and..."            |
|   [Open Book]                                                     |
|                                                                   |
+------------------------------------------------------------------+
```

**Features**:
- Grouped by book with expand/collapse
- Highlighted keyword matches in snippets
- Click on page opens flipbook at that page
- Filter by grade level, subject
- Sort by relevance or page number

### 3. FlipbookViewer Enhancement

Add prop to open at specific page:

```typescript
interface FlipbookViewerProps {
  bookId: string;
  bookTitle: string;
  onClose: () => void;
  initialPage?: number;  // NEW: Start at this page
}
```

### 4. Indexing Status Indicator

On book cards and in admin view:

```text
+------------------+
| [Book Cover]     |
| Book Title       |
| [AI Indexed] ✓   |  <-- Badge showing index status
+------------------+
```

Admin can trigger re-indexing or see indexing progress.

---

## Background Indexing Strategy

### When to Index

1. **After Book Upload**: Automatically queue for indexing when a book's status becomes `ready`
2. **Batch Processing**: Process during off-peak hours to save API credits
3. **On-Demand**: Admin can trigger indexing for specific books

### Processing Flow

```text
Book Uploaded --> Status: 'ready'
       |
       v
+------------------+
| Indexing Queue   |  (Check every 5 minutes)
| - Book A [new]   |
| - Book B [retry] |
+------------------+
       |
       v
+------------------+
| Process Book     |
| - 1 page/500ms   |  (Rate limit protection)
| - Save progress  |
| - Resume on fail |
+------------------+
       |
       v
Book index_status: 'indexed'
```

### Rate Limit Handling

- Process 1 page every 500-1000ms
- If rate limited (429), wait and retry
- Save progress so indexing can resume
- Use `waitUntil` for background processing

---

## Implementation Steps

### Step 1: Database Migration

Create `book_page_index` table with full-text search index and add `index_status` to `books` table.

### Step 2: OCR Edge Function

Create `supabase/functions/ocr-index-book/index.ts`:
- Accept book_id
- Process pages sequentially
- Use Gemini 2.5 Flash for vision OCR
- Extract text, topics, keywords
- Save to database

### Step 3: Search Edge Function

Create `supabase/functions/search-books/index.ts`:
- Accept search query
- Use PostgreSQL full-text search
- Return ranked results with snippets
- Group by book

### Step 4: Library Page Updates

Modify `src/components/library/LibraryPage.tsx`:
- Add AI search button
- Add search mode toggle
- Integrate with search results view

### Step 5: Search Results Component

Create `src/components/library/SearchResultsView.tsx`:
- Display search results grouped by book
- Highlight matching text
- Navigate to specific page in flipbook

### Step 6: FlipbookViewer Update

Update to accept `initialPage` prop and navigate there on load.

### Step 7: Indexing Status UI

Add visual indicators for indexing status on book cards.

### Step 8: Background Indexing Hook

Create `src/hooks/useBookIndexing.ts`:
- Monitor books needing indexing
- Trigger indexing after upload
- Track progress

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| New migration | Create | `book_page_index` table + indexes |
| `supabase/functions/ocr-index-book/index.ts` | Create | Background OCR processing |
| `supabase/functions/search-books/index.ts` | Create | Full-text search API |
| `src/components/library/LibraryPage.tsx` | Modify | Add AI search bar and mode |
| `src/components/library/SearchResultsView.tsx` | Create | Search results display |
| `src/components/library/BookCard.tsx` | Modify | Add index status badge |
| `src/components/library/FlipbookViewer.tsx` | Modify | Add initialPage prop |
| `src/hooks/useBookSearch.ts` | Create | Search hook |
| `src/hooks/useBookIndexing.ts` | Create | Indexing status hook |
| `supabase/config.toml` | Modify | Add new edge functions |

---

## User Flow Example

1. **User opens Library**: Sees books with "AI Indexed" badges
2. **User types "photosynthesis" in search**: Type-ahead shows suggestions
3. **User clicks "AI Search" button**: Full content search initiated
4. **Search Results appear**: Shows all matching pages across books
5. **User clicks "Page 45 - Science Grade 7"**: Flipbook opens at page 45
6. **Keyword highlighted**: User sees the matching content immediately

---

## Benefits

1. **Deep Content Search**: Find content inside books, not just by title
2. **Topic Discovery**: AI extracts lesson topics for easy navigation
3. **Time Savings**: Students find relevant pages instantly
4. **Automatic Processing**: No manual tagging required
5. **Scalable**: Works with any number of books

