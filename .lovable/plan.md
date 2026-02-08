

# AI-Powered Dynamic Suggestions for the Quick Actions Menu

## What Changes

The static quick actions menu transforms into a **hybrid system**: a large curated set of categorized actions (expanded to 20+ categories, 100+ items) **plus** an AI-generated "Trending & For You" section at the top that dynamically adapts based on the user's chat history, time of day, and current academic context.

## How It Works

### 1. Massively Expanded Static Categories (always available)

The menu grows from 9 to 20 color-coded categories with 100+ total actions. New categories include:

| Category | Color | Sample Items |
|----------|-------|--------------|
| Filipino / Mother Tongue | `bg-yellow-50 text-yellow-700` | Pagsulat ng Sanaysay, Pagbasa Comprehension, Filipino Grammar |
| History & Social Studies | `bg-orange-50 text-orange-700` | Timeline Creator, Historical Figure Bio, Map Analysis |
| Arts & Music | `bg-fuchsia-50 text-fuchsia-600` | Art Critique, Music Theory, Color Theory Explainer |
| Technology & Digital Literacy | `bg-cyan-50 text-cyan-700` | Typing Practice, Cybersecurity Tips, Spreadsheet Helper |
| Environmental & Earth Science | `bg-emerald-50 text-emerald-700` | Climate Change Explainer, Ecosystem Builder, Weather Analysis |
| Parenting & Home | `bg-lime-50 text-lime-700` | Parent-Teacher Conference Prep, Homework Help Guide, Reading List |
| Special Education & Inclusion | `bg-violet-50 text-violet-600` | IEP Helper, Differentiation Strategies, Accommodations Guide |
| Assessment & Evaluation | `bg-sky-50 text-sky-600` | Rubric Generator, Performance Task Design, Test Item Analysis |
| Research & Academic Writing | `bg-stone-100 text-stone-700` | APA/MLA Citation Generator, Literature Review, Thesis Statement |
| Current Events & Media | `bg-red-50 text-red-600` | Fact Checker, Media Literacy, Current Events Discussion |
| Values & Character Education | `bg-warmGray-50 text-warmGray-700` | Moral Dilemma Discussion, Character Traits Activity, SEL Lesson |

Existing categories also get more items (e.g., "Create & Generate" gets Infographic Creator, Worksheet Maker, Rubric Builder, Certificate Template).

### 2. AI-Generated "For You" Section (top of menu)

A new section at the very top of the popover labeled "Suggested For You" with a sparkle icon. It shows 3-5 dynamically generated suggestions based on:

- **Chat history**: Topics the user has recently explored
- **Time context**: Morning = lesson prep suggestions, afternoon = grading tools, evening = study tips
- **Recency**: Prioritizes fresh, unused action types the user hasn't tried yet

This runs entirely on the client side -- no API call needed. It analyzes the `sessions` data already available in the component and generates smart suggestions using pattern matching.

### 3. Search/Filter Bar Inside the Menu

A small search input at the top of the popover lets users quickly filter through all 100+ actions by typing keywords (e.g., typing "quiz" shows Quiz Creator, Trivia Game, etc.).

### 4. Suggestion Chips Expansion

The suggestion chips below the chat also become smarter:
- More templates: "Deeper dive into...", "Create a worksheet on...", "Summarize...", "Debate about..."
- More default suggestions (12 instead of 8)
- Chips rotate/shuffle on each visit so the interface feels fresh

## Visual Layout

```text
+-------------------------------------+
| [Search actions...]           (search bar)
+-------------------------------------+
| SUGGESTED FOR YOU            sparkle icon
|  Morning lesson prep detected:
|  [Lesson Plan] [Quiz Creator] [Warm-up Activity]
+-------------------------------------+
| SEARCH & DISCOVER        (blue)
|  Search Library | YouTube | Wikipedia
|  News | Academic Search | Image Search
+-------------------------------------+
| CREATE & GENERATE         (purple)
|  Image | Essay | Quiz | Lesson Plan
|  Flashcards | Story | Presentation
|  Infographic | Worksheet | Rubric
|  Certificate | Crossword Puzzle
+-------------------------------------+
| ... 18 more categories ...
+-------------------------------------+
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/aichat/ChatActionMenu.tsx` | Expand to 20 categories / 100+ items, add search filter, add AI "For You" section |
| `src/components/aichat/ChatSuggestionChips.tsx` | More templates, more defaults, shuffle logic |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/aichat/useSmartSuggestions.ts` | Hook that analyzes sessions + time of day to generate personalized suggestions |

## Technical Details

### Smart Suggestions Hook (`useSmartSuggestions.ts`)

```text
Input: sessions[], current time
Logic:
  1. Extract all user topics from recent sessions
  2. Determine time-of-day context (morning/afternoon/evening)
  3. Check which action categories the user has NOT used yet
  4. Generate 3-5 contextual suggestions:
     - 1-2 based on recent topics ("Continue exploring Photosynthesis")
     - 1 based on time ("Morning? Start with a warm-up activity")
     - 1-2 unexplored categories ("Try: Rubric Generator")
Output: Array of { emoji, label, prefill, reason }
```

### Search Filter

A controlled input at the top of the popover. As the user types, groups are filtered to only show items whose labels match the search string (case-insensitive). Empty groups are hidden. The filter resets when the popover closes.

### No New Dependencies

Everything uses existing React state, Tailwind classes, and components already in the project.

