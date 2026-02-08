
# Enhance "Find" Results with Clickable Book Links

## What This Does
When you type "find [topic]" in the AI Chat, the search results will now include **clickable links** for each book match. Clicking a link opens the book's flipbook viewer directly to the matching page — in a new browser tab.

## How It Works

1. **URL Structure**: A new route `/library/book/:bookId` is added that opens the Library page and automatically loads the flipbook viewer for that book at an optional page number (`?page=45`).

2. **Clickable Markdown Links**: The context sent to the AI now includes pre-built markdown links like:
   ```
   [📖 Open Book — Page 45](/library/book/abc123?page=45)
   ```
   The AI includes these links in its formatted response.

3. **New Tab Behavior**: The `ChatMessageBubble` component's ReactMarkdown renderer is configured to render all links with `target="_blank"` and `rel="noopener noreferrer"`.

4. **Book Landing Route**: A new route `/library/book/:bookId` renders the `LibraryPage` component, which detects the URL params and auto-opens the flipbook viewer for that specific book and page.

5. **Error Handling**: If a book ID is invalid or missing, the library page shows a toast notification and falls back to the normal library view.

---

## Technical Details

### Files to Modify

**1. `src/components/aichat/AIChatPage.tsx`**
- Update `handleFindRequest` to include clickable markdown links in the context string
- Each book match line includes: `[📖 Open "${bookTitle}" — Page ${pageNumber}](/library/book/${bookId}?page=${pageNumber})`
- Update the AI formatting instruction to tell it to preserve and include these markdown links

**2. `src/components/aichat/ChatMessageBubble.tsx`**
- Add a custom `components` prop to `ReactMarkdown` that renders `<a>` tags with `target="_blank"` and `rel="noopener noreferrer"`
- Add visual styling: book links get a distinct style (underline, primary color, external link icon)

**3. `src/App.tsx`**
- Add route: `<Route path="/library/book/:bookId" element={<Index />} />`
- The Index page will pass the bookId param down to the Library view

**4. `src/components/library/LibraryPage.tsx`**
- Accept optional `bookId` and `page` props (or read from URL params via `useParams`/`useSearchParams`)
- On mount, if `bookId` is present, fetch the book details and auto-open the FlipbookViewer at the specified page
- Show error toast if book not found

### Link Format in AI Response

The AI will output responses like:

> **Science Grade 7** (Science)
> - Page 45 | Chapter: Plant Biology | Topics: Photosynthesis
>   Snippet: "Photosynthesis is the process..."
>   [📖 Open Book — Page 45](/library/book/abc-123?page=45)

### Security
- All links use `rel="noopener noreferrer"` 
- Book access respects existing school-level permissions (the library page already checks school context)

### No New Dependencies
- Uses existing `react-router-dom` for routing
- Uses existing `ReactMarkdown` custom components API
- No database changes needed
