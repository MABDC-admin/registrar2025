

# Add Quick Actions Popup and History-Based Suggestions to Chat

## What This Does
Replaces the plain paperclip button with a "+" button that opens a popup menu with categorized quick actions (Search YouTube, Upload File, Image Generation, Doc Analysis, etc.) and shows history-based suggestions above the input area.

## Visual Layout

```text
+--------------------------------------------------+
|  Chat Messages Area                               |
|                                                    |
+--------------------------------------------------+
|  [Suggestion Chips based on history]              |
|  e.g. "Continue lesson on Photosynthesis"         |
|       "Quiz me on fractions"                      |
+--------------------------------------------------+
|  [+]  [Type a message...]            [Send/Stop]  |
+--------------------------------------------------+

When [+] is clicked, a Popover appears above it:

+-----------------------------------+
| SEARCH & DISCOVER                 |
|  🔍 Search Library                |
|  🎥 Search YouTube Videos         |
|                                    |
| CREATE & GENERATE                 |
|  🖼️ Generate Image                |
|  📝 Write Essay / Report          |
|  📊 Create Quiz / Exam            |
|  📋 Lesson Plan (MELC)            |
|                                    |
| ANALYZE & UPLOAD                  |
|  📄 Upload PDF Document           |
|  📖 Document Analysis             |
|                                    |
| SCHOOL TOOLS                      |
|  🍽️ Meal / Nutrition Planner      |
|  📅 Schedule Helper               |
|  💡 Study Tips                    |
|  🧮 Math Solver                   |
+-----------------------------------+
```

## How It Works

### 1. New Component: `ChatActionMenu.tsx`
A Popover component triggered by a "+" button with categorized action items:

**Search and Discover**
- Search Library -- prefills "find " in input
- Search YouTube Videos -- prefills "Search YouTube for "

**Create and Generate**
- Generate Image -- prefills "Generate an image of "
- Write Essay / Report -- prefills "Write an essay about "
- Create Quiz / Exam -- prefills "Create a 10-item quiz about "
- Lesson Plan (MELC) -- prefills "Create a DepEd MELC lesson plan for "

**Analyze and Upload**
- Upload PDF Document -- triggers the file input click
- Document Analysis -- prefills "Analyze the uploaded document: "

**School Tools**
- Meal / Nutrition Planner -- prefills "Create a weekly meal plan for "
- Schedule Helper -- prefills "Help me create a class schedule for "
- Study Tips -- prefills "Give me effective study tips for "
- Math Solver -- prefills "Solve step by step: "
- Code Helper -- prefills "Help me write code for "

Each action either prefills text in the input or triggers an action (like file upload).

### 2. New Component: `ChatSuggestionChips.tsx`
Renders suggestion chips above the input area based on chat history:

- Analyzes the last few user messages across all sessions
- Generates contextual suggestions like:
  - "Continue: [last topic]" -- based on last conversation
  - "Quiz me on [recent subject]"
  - "Explain more about [recent topic]"
- Also shows static quick suggestions when there's no history (e.g., "Help with homework", "Generate a quiz")
- Clicking a chip fills the input and auto-sends

### 3. Update `AIChatPage.tsx`
- Replace the Paperclip button with the new "+" button + ChatActionMenu popover
- Add ChatSuggestionChips above the input area
- Pass necessary callbacks (setInput, fileInputRef click, handleSend)

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/aichat/ChatActionMenu.tsx` | Popover with categorized quick actions |
| `src/components/aichat/ChatSuggestionChips.tsx` | History-based suggestion chips |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/aichat/AIChatPage.tsx` | Replace paperclip button with action menu, add suggestion chips |

### Suggestion Generation Logic
```text
1. Collect last 5 user messages from all sessions
2. Extract key topics (first 30 chars of each)
3. Generate contextual prompts:
   - "Continue: [topic]"
   - "Quiz me on [topic]"
   - "Explain [topic] simply"
4. If no history, show defaults:
   - "Help with homework"
   - "Create a lesson plan"
   - "Generate an image"
   - "Solve a math problem"
```

### No New Dependencies
- Uses existing Popover component from Radix UI
- Uses existing Lucide icons
- All logic is client-side

