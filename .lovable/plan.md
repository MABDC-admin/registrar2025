
# Add Emoji/Sticker Tool with Online Search to Book Viewer

## Overview
Add an interactive emoji/sticker feature to the annotation toolbar that allows teachers to:
1. Search for emojis using a built-in emoji picker
2. Search for icons/stickers online using an icon API
3. Place selected emojis/icons on book pages by clicking
4. Move, resize, and delete placed stickers

---

## Architecture

### Approach
Since the project already has Lovable Cloud enabled, we'll use a combination of:
1. **Built-in Emoji Picker**: Use `emoji-picker-react` package for native emojis
2. **Online Icon Search**: Use the free **Iconify API** (no API key required) to search thousands of icons
3. **Sticker Annotations**: Extend the annotation system to support placed stickers

### UI Flow
```text
Annotation Toolbar:
[Pencil][Highlight][Rect][Circle][Arrow][Eraser] | [😊 Sticker] | [Colors] | [Undo][Redo][Clear]
                                                       ↓
                                             ┌─────────────────────────┐
                                             │ [Emoji] [Icon Search]   │ ← Tabs
                                             ├─────────────────────────┤
                                             │ 🔍 Search...            │
                                             ├─────────────────────────┤
                                             │ 😀 😁 😂 🤣 😃 😄 😅    │
                                             │ 😆 😉 😊 😋 😎 😍 😘    │
                                             │ ...                     │
                                             └─────────────────────────┘
```

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Install | `emoji-picker-react` | NPM package for emoji picker |
| Create | `src/components/library/StickerPicker.tsx` | Main sticker picker component with tabs |
| Create | `src/components/library/IconSearch.tsx` | Icon search using Iconify API |
| Modify | `src/hooks/useAnnotations.ts` | Add sticker annotation type and placement logic |
| Modify | `src/components/library/AnnotationToolbar.tsx` | Add sticker button with popover |
| Modify | `src/components/library/FlipbookViewer.tsx` | Handle sticker placement on canvas click |

---

## Technical Implementation

### 1. New Sticker Annotation Type

Extend the `Annotation` interface in `useAnnotations.ts`:

```typescript
export type AnnotationType = 'none' | 'pencil' | 'highlighter' | 'text' | 'rect' | 'circle' | 'arrow' | 'eraser' | 'sticker';

export interface Annotation {
  id: string;
  type: Exclude<AnnotationType, 'none' | 'eraser'>;
  points?: Point[];
  start?: Point;
  end?: Point;
  text?: string;
  color: string;
  strokeWidth: number;
  // New sticker properties
  sticker?: {
    type: 'emoji' | 'icon';
    value: string;      // Emoji character or icon SVG/URL
    x: number;
    y: number;
    size: number;       // Size in pixels
  };
}
```

### 2. StickerPicker Component

A popover with two tabs:
- **Emoji Tab**: Uses `emoji-picker-react` for native emojis
- **Icon Tab**: Uses Iconify API to search for icons

```tsx
// src/components/library/StickerPicker.tsx
interface StickerPickerProps {
  onSelect: (sticker: { type: 'emoji' | 'icon'; value: string }) => void;
}

// Uses Tabs component with:
// - EmojiPicker from emoji-picker-react
// - IconSearch component for Iconify API
```

### 3. IconSearch Component - Iconify API

Iconify provides free access to 200,000+ icons without an API key:

```typescript
// Search endpoint (no API key needed)
const searchIcons = async (query: string) => {
  const response = await fetch(
    `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=50`
  );
  return response.json();
};

// Get icon SVG
const getIconSvg = (iconName: string) => {
  return `https://api.iconify.design/${iconName}.svg`;
};
```

### 4. Sticker Placement Flow

1. User clicks sticker button in toolbar
2. Popover opens with emoji/icon picker
3. User selects an emoji or searches for an icon
4. Annotation mode changes to `sticker` with selected sticker stored
5. User clicks on the page to place the sticker
6. Sticker is rendered on canvas at clicked position

### 5. Rendering Stickers on Canvas

```typescript
// In renderAnnotations function
if (ann.sticker) {
  if (ann.sticker.type === 'emoji') {
    ctx.font = `${ann.sticker.size}px serif`;
    ctx.fillText(ann.sticker.value, ann.sticker.x, ann.sticker.y);
  } else if (ann.sticker.type === 'icon') {
    // Load and draw icon image
    const img = new Image();
    img.src = ann.sticker.value;
    ctx.drawImage(img, ann.sticker.x, ann.sticker.y, ann.sticker.size, ann.sticker.size);
  }
}
```

---

## UI Components

### Sticker Button in Toolbar

Add a new button after the eraser tool:

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Smile className="h-4 w-4" />  {/* or Sticker icon */}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-80 p-0">
    <StickerPicker onSelect={handleStickerSelect} />
  </PopoverContent>
</Popover>
```

### Sticker Picker Tabs

```text
┌──────────────────────────────────┐
│  [😊 Emojis]  [🔍 Icons]         │  ← Tabs
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ 🔍 Search emojis...          │ │
│ └──────────────────────────────┘ │
│                                  │
│ 😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊   │
│ 😋 😎 😍 😘 🥰 😗 😙 🥲 😚 😌   │
│ 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐   │
│ ...                              │
└──────────────────────────────────┘
```

---

## User Interaction Flow

1. **Select Tool**: Click sticker button → opens picker popover
2. **Pick Sticker**: Select emoji or search and select icon
3. **Place Mode**: Cursor changes to show selected sticker
4. **Click to Place**: Click on page to place sticker at that position
5. **Repeat or Exit**: Place more or click another tool to exit sticker mode

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `emoji-picker-react` | ^4.x | Full-featured emoji picker with search and categories |

---

## Summary

| Feature | Implementation |
|---------|----------------|
| Emoji picker | `emoji-picker-react` package with categories and search |
| Icon search | Iconify API (free, no key required, 200k+ icons) |
| Toolbar integration | New Sticker button with Popover next to Eraser |
| Canvas rendering | Draw emojis as text, icons as images |
| Sticker data | Extended Annotation interface with sticker properties |
| Placement | Click-to-place after selecting sticker |
