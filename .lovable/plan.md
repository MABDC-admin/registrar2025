

# Notebook LLM Page Implementation Plan

## Overview

This plan creates a new "Notebook LLM" page - a Jupyter-style interface for interacting with Large Language Models. Users can create, organize, and execute cells that contain either markdown text or LLM prompts, with responses displayed inline.

## Architecture

The Notebook LLM page will be integrated into the existing dashboard structure and accessible via the sidebar navigation. It will use **Lovable AI** (already configured with `LOVABLE_API_KEY`) for LLM interactions with streaming support.

```text
+------------------------------------------------------------------+
|  Notebook LLM                                    [+ New Notebook] |
+------------------------------------------------------------------+
|  [ My Notebooks ]                                                |
|  +------------------------------------------------------------+  |
|  | Notebook: "Lesson Planning Assistant"          [Edit] [Del] |  |
|  | Created: Feb 5, 2026 | 5 cells                              |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  When a notebook is opened:                                      |
|  +------------------------------------------------------------+  |
|  | Cell 1 - Markdown                              [Run] [Del]  |  |
|  | +--------------------------------------------------------+ |  |
|  | | # Lesson Planning for Grade 5 Math                     | |  |
|  | | This notebook helps create lesson plans...             | |  |
|  | +--------------------------------------------------------+ |  |
|  +------------------------------------------------------------+  |
|  | Cell 2 - LLM Prompt                            [Run] [Del]  |  |
|  | +--------------------------------------------------------+ |  |
|  | | Create a 45-minute lesson plan for teaching fractions  | |  |
|  | | to 5th graders. Include activities and assessment.     | |  |
|  | +--------------------------------------------------------+ |  |
|  | Output:                                                     |  |
|  | +--------------------------------------------------------+ |  |
|  | | ## Lesson Plan: Introduction to Fractions              | |  |
|  | | **Duration:** 45 minutes                                | |  |
|  | | **Objective:** Students will understand...              | |  |
|  | | (streaming response with markdown rendering)            | |  |
|  | +--------------------------------------------------------+ |  |
|  +------------------------------------------------------------+  |
|  |                    [+ Add Cell]                             |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/components/notebook/NotebookPage.tsx` | Main page component with notebook list and viewer |
| `src/components/notebook/NotebookList.tsx` | List/grid of user's notebooks |
| `src/components/notebook/NotebookEditor.tsx` | Full notebook editor with cells |
| `src/components/notebook/NotebookCell.tsx` | Individual cell component (markdown or LLM) |
| `src/components/notebook/CellOutput.tsx` | Renders LLM output with markdown support |
| `src/components/notebook/CreateNotebookDialog.tsx` | Dialog for creating new notebooks |
| `src/hooks/useNotebooks.ts` | React Query hooks for notebook CRUD operations |
| `src/hooks/useLLMChat.ts` | Hook for streaming LLM interactions |
| `supabase/functions/notebook-chat/index.ts` | Edge function for LLM streaming |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add NotebookPage component and route |
| `src/components/layout/DashboardLayout.tsx` | Add navigation item for "Notebook LLM" |
| `src/components/icons/ThreeDIcons.tsx` | Add NotebookIcon3D icon |
| `supabase/config.toml` | Register the new edge function |

## Database Schema

Two new tables will be created:

### `notebooks` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | Owner reference (to auth.users) |
| `title` | text | Notebook title |
| `description` | text | Optional description |
| `school` | text | Associated school (nullable) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last modification timestamp |

### `notebook_cells` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `notebook_id` | uuid | Foreign key to notebooks |
| `cell_type` | text | 'markdown' or 'llm' |
| `content` | text | Cell input content |
| `output` | text | LLM response (for llm cells) |
| `position` | integer | Order within notebook |
| `model` | text | LLM model used (optional) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last modification timestamp |

### RLS Policies
- Users can only view/edit their own notebooks and cells
- Admin users can view all notebooks

## Component Details

### NotebookPage.tsx
- Main container with header and content area
- Manages state: viewing list vs editing a specific notebook
- Handles navigation between notebooks

### NotebookEditor.tsx
- Displays all cells in order
- Supports drag-and-drop reordering (using framer-motion Reorder)
- "Add Cell" button at the bottom
- Auto-saves changes with debouncing

### NotebookCell.tsx
- Toggle between edit and view mode
- Cell type selector (Markdown/LLM)
- "Run" button for LLM cells
- Delete and move controls
- Keyboard shortcuts (Shift+Enter to run)

### CellOutput.tsx
- Renders markdown using react-markdown
- Shows loading spinner during streaming
- Displays streaming text token-by-token
- Error handling with retry option

### useLLMChat.ts Hook
```text
Features:
- Connects to notebook-chat edge function
- Handles SSE streaming
- Manages loading/error states
- Supports cancellation via AbortController
- Token-by-token rendering
```

## Edge Function: notebook-chat

The edge function will:
1. Accept messages array and optional system prompt
2. Use Lovable AI Gateway (google/gemini-3-flash-preview model)
3. Stream responses via SSE
4. Handle rate limits (429) and payment errors (402)

## Navigation Integration

Add to sidebar navigation for **admin** and **teacher** roles:
- Icon: Custom NotebookIcon3D (brain/chat bubble design)
- Label: "Notebook LLM"
- Position: After "Canva Studio" in the navigation order

## User Experience Flow

1. **Access**: User clicks "Notebook LLM" in sidebar
2. **List View**: Shows all user's notebooks with create button
3. **Create**: Dialog to enter title and optional description
4. **Edit**: Opens notebook with all cells displayed
5. **Add Cell**: Button adds new cell at bottom (or between cells)
6. **Run Cell**: Executes LLM prompt and streams response
7. **Save**: Auto-saves on blur/change with visual indicator

## Technical Considerations

### Streaming Implementation
- Uses SSE (Server-Sent Events) for real-time token streaming
- Parses `data: ` prefixed lines
- Handles `[DONE]` signal
- Updates state incrementally for smooth rendering

### Markdown Rendering
- Install `react-markdown` for rendering outputs
- Install `remark-gfm` for GitHub-flavored markdown support
- Syntax highlighting for code blocks using `rehype-highlight`

### Dependencies to Add
```text
- react-markdown (for rendering LLM outputs)
- remark-gfm (for tables, strikethrough, etc.)
```

### Performance
- Virtualization for notebooks with many cells (future enhancement)
- Debounced auto-save (500ms delay)
- Optimistic UI updates

## Role-Based Access

| Role | Access Level |
|------|--------------|
| admin | Full access - create, edit, delete all notebooks |
| teacher | Full access - create, edit, delete own notebooks |
| registrar | Read-only access to own notebooks (if created) |
| student | No access initially (can be enabled later) |
| parent | No access |

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create database tables with RLS policies
2. Create the edge function for LLM chat
3. Create the NotebookIcon3D icon
4. Add navigation item to DashboardLayout

### Phase 2: UI Components
1. Create NotebookPage with list view
2. Create CreateNotebookDialog
3. Create NotebookList component
4. Create useNotebooks hook

### Phase 3: Editor & Cells
1. Create NotebookEditor component
2. Create NotebookCell component
3. Create CellOutput with markdown rendering
4. Create useLLMChat hook with streaming

### Phase 4: Integration
1. Add page to Index.tsx routing
2. Test full flow end-to-end
3. Add drag-and-drop reordering

