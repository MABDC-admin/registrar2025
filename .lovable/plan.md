
# Integrate Library Search into AI Chat

## What This Does
When you type **"find [topic]"** in the AI chat, SchoolAI will search through all indexed books in your library and return matching topics, lessons, and keywords -- then present the results as a formatted, intelligent response.

## How It Works

1. **Keyword Detection**: When your message starts with "find" (e.g., "find photosynthesis", "find fractions"), the system intercepts it before sending to the AI model.

2. **Library Search**: It queries the indexed book pages database for matching topics, keywords, chapter titles, and text content.

3. **AI-Formatted Response**: The raw search results are passed to SchoolAI, which formats them into a helpful response with:
   - Book titles and page numbers
   - Relevant topics and chapter titles
   - Snippets of matching content
   - Suggestions for further exploration

4. **Fallback**: If no results are found, the AI tells you and offers to help explain the topic instead.

---

## Technical Details

### Files to Modify

**`src/components/aichat/constants.ts`**
- Add a `isFindRequest(text)` helper that detects messages starting with "find " (case-insensitive)
- Extract the search query from the message (everything after "find ")

**`src/components/aichat/AIChatPage.tsx`**
- Import `isFindRequest` from constants
- Add a `handleFindRequest(query)` function that:
  1. Calls the `search-books` edge function with the extracted topic
  2. Formats results into a context string
  3. Sends the context + user query to the AI chat for a nicely formatted response
- Update `handleSend` to check `isFindRequest` before `isImageRequest` and route accordingly

### Search Flow

```text
User types: "find photosynthesis"
       |
       v
isFindRequest() detects "find" prefix
       |
       v
Extract query: "photosynthesis"
       |
       v
Call search-books edge function
       |
       v
Results found? ----No----> AI responds: "No library results found, but here's what I know..."
       |
      Yes
       |
       v
Build context string with book titles, pages, topics, snippets
       |
       v
Send to AI with prompt: "Format these library search results for the user"
       |
       v
AI renders formatted results with book names, page numbers, and summaries
```

### Response Format Example
The AI will present results like:

- **Book**: "Science Grade 7" -- Page 45
  - **Chapter**: Plant Biology
  - **Topics**: Photosynthesis, Chloroplasts, Light Reactions
  - **Snippet**: "Photosynthesis is the process by which plants convert..."

### No External Dependencies
- Uses the existing `search-books` edge function (already deployed)
- No new database tables or migrations needed
- No new packages required
