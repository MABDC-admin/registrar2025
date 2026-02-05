
# Enhance FlipbookViewer: Bigger Sidebar + Annotation Tools

## Overview
Two enhancements for the desktop FlipbookViewer:
1. **Bigger sidebar** - Increase width from 160px to 220px with larger thumbnails and a wider, more visible scrollbar
2. **Annotation tools** - Add a toolbar with drawing/annotation capabilities (pencil, highlighter, text, shapes, eraser)

---

## 1. Bigger Desktop Sidebar

### Changes
- Increase sidebar width from `160px` to `220px`
- Make thumbnails larger for better visibility
- Add custom scrollbar styling (wider track ~12px, more visible thumb)
- Increase thumbnail padding and spacing

### Before/After

| Current | New |
|---------|-----|
| Width: 160px | Width: 220px |
| Thumbnail padding: p-2 | Thumbnail padding: p-3 |
| Scrollbar: default (~8px) | Scrollbar: 12px with visible thumb |

---

## 2. Annotation Tools Toolbar

### Features
| Tool | Icon | Function |
|------|------|----------|
| Pencil | `Pencil` | Freehand drawing |
| Highlighter | `Highlighter` | Semi-transparent highlight |
| Text | `Type` | Add text annotations |
| Rectangle | `Square` | Draw rectangles |
| Circle | `Circle` | Draw circles/ellipses |
| Arrow | `MoveRight` | Draw arrows |
| Eraser | `Eraser` | Remove annotations |
| Undo | `Undo2` | Undo last action |
| Redo | `Redo2` | Redo action |
| Clear | `Trash2` | Clear all annotations on page |
| Color Picker | Color dots | Select annotation color |

### UI Layout
```text
+----------------------------------------------------------+
| [Book Title]                    [Page] [Zoom] [FS] [X]   |
+----------------------------------------------------------+
| Sidebar  |  [Pencil][Highlight][Text][Rect][Circle][...] | <- Annotation toolbar
| (220px)  |  +----------------------------------------+   |
|          |  |                                        |   |
| [Thumb]  |  |       Page Image                       |   |
| [Thumb]  |  |       + Canvas Overlay                 |   |
| [Thumb]  |  |       (for drawing)                    |   |
|          |  |                                        |   |
|          |  +----------------------------------------+   |
|          |           [<]              [>]                |
+----------------------------------------------------------+
```

### Technical Implementation

**Canvas Overlay Approach:**
- Add a `<canvas>` element positioned absolutely over the page image
- Canvas matches the image dimensions and scales with zoom
- Use Canvas 2D API for drawing operations
- Store annotations per page in component state

**State Structure:**
```tsx
interface Annotation {
  id: string;
  type: 'pencil' | 'highlighter' | 'text' | 'rect' | 'circle' | 'arrow';
  points?: { x: number; y: number }[];  // For pencil/highlighter
  start?: { x: number; y: number };     // For shapes
  end?: { x: number; y: number };       // For shapes
  text?: string;                        // For text annotations
  color: string;
  strokeWidth: number;
}

interface PageAnnotations {
  [pageNumber: number]: Annotation[];
}
```

**New State Variables:**
```tsx
const [annotationMode, setAnnotationMode] = useState<'none' | 'pencil' | 'highlighter' | 'text' | 'rect' | 'circle' | 'arrow' | 'eraser'>('none');
const [annotationColor, setAnnotationColor] = useState('#FF0000');
const [annotations, setAnnotations] = useState<PageAnnotations>({});
const [isDrawing, setIsDrawing] = useState(false);
const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
const [history, setHistory] = useState<PageAnnotations[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);
const canvasRef = useRef<HTMLCanvasElement>(null);
```

**Drawing Logic:**
- `onMouseDown` - Start drawing, record starting point
- `onMouseMove` - Continue path if drawing
- `onMouseUp` - Finish annotation, save to state
- Render all annotations for current page on canvas

---

## Files to Modify

| Action | File |
|--------|------|
| Modify | `src/components/library/FlipbookViewer.tsx` |

---

## Detailed Changes to FlipbookViewer.tsx

### 1. New Imports
```tsx
import {
  Pencil,
  Highlighter,
  Type,
  Square,
  Circle,
  MoveRight,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
```

### 2. New State Variables
- `annotationMode` - Current active tool
- `annotationColor` - Selected color
- `annotations` - Per-page annotation data
- `isDrawing` - Mouse/touch state
- `currentPath` - Current stroke being drawn
- `history` / `historyIndex` - For undo/redo
- `canvasRef` - Reference to drawing canvas

### 3. Sidebar Changes
- Update width from 160 to 220 in motion.div animate
- Add custom scrollbar class with wider track
- Increase padding from p-2 to p-3

### 4. Add Annotation Toolbar (Desktop Only)
- Position below header, above the main content area
- Show tool buttons as a ToggleGroup
- Include color picker (preset color dots)
- Add undo/redo/clear buttons on the right

### 5. Canvas Overlay
- Add `<canvas>` element positioned over the page image
- Handle mouse events for drawing
- Re-render canvas when annotations or page changes
- Scale canvas properly with zoom

### 6. Drawing Functions
- `startDrawing()` - Begin stroke
- `draw()` - Continue stroke
- `stopDrawing()` - Finish and save annotation
- `renderAnnotations()` - Draw all annotations to canvas
- `undo()` / `redo()` - History navigation
- `clearAnnotations()` - Remove all from current page

---

## Color Options
```tsx
const colors = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#000000', // Black
];
```

---

## Note on Persistence
This implementation stores annotations in component state (session only). For persistent annotations, a future enhancement could save to the database in a `book_annotations` table.

---

## Summary

| Enhancement | Details |
|-------------|---------|
| Sidebar width | 160px -> 220px |
| Scrollbar | Wider (12px), more visible |
| Annotation tools | Pencil, Highlighter, Text, Shapes, Eraser |
| Color picker | 7 preset colors |
| Undo/Redo | History-based |
| Canvas overlay | Positioned over page image, scales with zoom |
