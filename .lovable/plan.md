

# AI Presentation Generator with Web Design Inspiration

## Overview

This feature adds a new "Presentation" cell type to the Notebook LLM page that allows users to:
1. Enter a topic prompt
2. AI researches and generates a beautiful presentation with content and design suggestions
3. Download the presentation as PPT (PowerPoint) or PDF

The AI will leverage web search (via Firecrawl connector) to gather design inspiration and best practices, then generate a structured presentation with modern design recommendations.

## User Experience

```text
+--------------------------------------------------------------------+
| Cell - Presentation Generator                        [Run] [Del]   |
| +----------------------------------------------------------------+ |
| | Topic: "Artificial Intelligence in Education"                  | |
| |                                                                | |
| | Number of slides: [8] ▼                                        | |
| | Style: [Modern Minimal] ▼                                      | |
| +----------------------------------------------------------------+ |
| Output:                              [Download PPT] [Download PDF] |
| +----------------------------------------------------------------+ |
| | ## Slide 1: Title                                              | |
| | # AI in Education                                              | |
| | *Transforming Learning for the Future*                         | |
| |                                                                | |
| | ## Slide 2: Introduction                                       | |
| | - What is AI in education?                                     | |
| | - Current adoption rates                                       | |
| | - Key benefits overview                                        | |
| |                                                                | |
| | ## Slide 3: ...                                                | |
| +----------------------------------------------------------------+ |
+--------------------------------------------------------------------+
```

## Technical Architecture

### Component Flow

```text
User enters topic
        ↓
[Optional] Firecrawl searches for design inspiration
        ↓
AI generates presentation content + structure
        ↓
Display slides in markdown preview
        ↓
Export to PPT (pptxgenjs) or PDF (jsPDF)
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/notebook/PresentationCell.tsx` | New cell type for presentation generation |
| `src/utils/presentationExport.ts` | Export utilities for PPT and PDF formats |
| `supabase/functions/generate-presentation/index.ts` | Edge function for AI presentation generation |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/notebook/NotebookCell.tsx` | Add "presentation" cell type option |
| `src/components/notebook/NotebookEditor.tsx` | Add presentation cell handling and add button |
| `src/hooks/useNotebooks.ts` | Add "presentation" to cell_type union |
| `package.json` | Add pptxgenjs dependency |

## Database Changes

Update the `notebook_cells` table to allow the new cell type:
- Update `cell_type` column to include 'presentation' value
- Add columns for presentation settings:
  - `presentation_slide_count` (integer, nullable) - Number of slides
  - `presentation_style` (text, nullable) - Design style preset

```sql
ALTER TABLE notebook_cells 
ADD COLUMN presentation_slide_count integer DEFAULT 8,
ADD COLUMN presentation_style text DEFAULT 'modern';
```

## New Dependency

Install `pptxgenjs` for PowerPoint generation:
```json
"pptxgenjs": "^3.12.0"
```

## Component Details

### PresentationCell.tsx

A specialized cell for presentation generation:
- Topic input field (required)
- Number of slides selector (4, 6, 8, 10, 12)
- Style preset dropdown:
  - Modern Minimal
  - Corporate Professional
  - Creative Colorful
  - Academic
  - Dark Mode
- Run button to generate
- Preview of generated slides in markdown
- Download buttons for PPT and PDF

### presentationExport.ts

Export utilities supporting two formats:

**PPT Export (using pptxgenjs):**
- Parse AI-generated markdown into slide objects
- Apply selected style theme (colors, fonts)
- Create title slides, content slides, bullet points
- Handle images if AI suggests them
- Generate and download .pptx file

**PDF Export (using jsPDF):**
- Convert presentation to slide-by-slide PDF
- Each page = one slide
- Apply styling matching the theme
- Landscape orientation for presentation format

### generate-presentation Edge Function

New Supabase edge function that:
1. Receives topic, slide count, and style
2. Optionally uses Firecrawl to search for:
   - Design inspiration for the topic
   - Best practices for presentation structure
   - Relevant statistics/facts
3. Constructs a detailed prompt for the AI
4. Streams back structured presentation content
5. Returns markdown with clear slide separators

## Implementation Details

### AI Prompt Structure

The edge function will construct a prompt like:

```text
Create a professional {slideCount}-slide presentation about "{topic}".

Style: {style} - Use a {style description} design approach.

{If Firecrawl results available}
Based on these design inspirations and facts:
{web search results}
{/If}

Structure each slide with:
## Slide N: [Slide Title]
[Content with bullet points, key messages, speaker notes]

Include:
- Title slide with subtitle
- Introduction/overview
- Main content slides
- Statistics or data points where relevant
- Conclusion with key takeaways
- Call to action or next steps (if applicable)

Design recommendations for each slide:
- Suggested visuals or icons
- Color accents
- Layout suggestions
```

### Slide Parsing Logic

Parse the AI output to extract:
```typescript
interface Slide {
  number: number;
  title: string;
  content: string[];
  speakerNotes?: string;
  designHints?: {
    layout: 'title' | 'content' | 'twoColumn' | 'image';
    suggestedImage?: string;
    accentColor?: string;
  };
}
```

### Style Themes

Each style preset maps to specific design parameters:

| Style | Primary Color | Font | Background |
|-------|--------------|------|------------|
| Modern Minimal | #2563EB | Inter | White |
| Corporate Professional | #1E3A5F | Arial | Light Gray |
| Creative Colorful | #8B5CF6 | Poppins | Gradient |
| Academic | #1F2937 | Georgia | Ivory |
| Dark Mode | #60A5FA | System | #0F172A |

## Implementation Steps

### Phase 1: Backend Setup
1. Create `generate-presentation` edge function
2. Implement AI prompt construction
3. Add streaming response handling
4. Test with sample topics

### Phase 2: Frontend - Cell Component
1. Install pptxgenjs dependency
2. Create `PresentationCell.tsx` component
3. Add topic input, slide count, style selector
4. Wire up to edge function with streaming

### Phase 3: Export Functionality
1. Create `presentationExport.ts` utility
2. Implement PPT generation with pptxgenjs
3. Implement PDF export with jsPDF
4. Add download buttons to cell output

### Phase 4: Integration
1. Update `NotebookCell.tsx` to render presentation cell
2. Update `NotebookEditor.tsx` with presentation button
3. Update types in `useNotebooks.ts`
4. Run database migration for new columns
5. End-to-end testing

## Optional Enhancement: Firecrawl Integration

If the Firecrawl connector is available, the system can:
1. Search for design inspiration related to the topic
2. Gather relevant statistics and facts
3. Find trending presentation layouts
4. Include this context in the AI prompt

This is optional - the feature works without Firecrawl, but produces richer results when available.

## Technical Notes

- **pptxgenjs**: Popular library with TypeScript support, generates real .pptx files
- **Streaming**: Same SSE pattern as existing notebook-chat function
- **File size**: Generated presentations are typically 50KB-500KB
- **Context**: Uses google/gemini-3-flash-preview for speed
- **No new API keys required**: Uses existing LOVABLE_API_KEY

