

# Colorize and Massively Expand Quick Actions Menu and Suggestion Chips

## What Changes

### 1. Colorized Action Menu Groups
Each category in the "+" menu gets its own distinct color theme so items are visually scannable at a glance:

| Category | Color | Accent |
|----------|-------|--------|
| Search and Discover | Blue | `bg-blue-50 text-blue-600` |
| Create and Generate | Purple | `bg-purple-50 text-purple-600` |
| Analyze and Upload | Amber/Orange | `bg-amber-50 text-amber-600` |
| School Tools | Green | `bg-green-50 text-green-600` |
| Language and Writing | Pink | `bg-pink-50 text-pink-600` |
| Science and Math | Cyan/Teal | `bg-teal-50 text-teal-600` |
| Lifestyle and Wellness | Rose | `bg-rose-50 text-rose-600` |
| Fun and Creative | Indigo | `bg-indigo-50 text-indigo-600` |
| Professional and Career | Slate | `bg-slate-100 text-slate-600` |

Each action row shows its **emoji** inline (replacing the Lucide icon) on a colored pill background for that group, making the menu feel vibrant and modern.

### 2. Expanded Categories (30+ actions total)

**Search and Discover** (blue)
- Search Library
- Search YouTube Videos
- Wikipedia Lookup
- News and Current Events

**Create and Generate** (purple)
- Generate Image
- Write Essay / Report
- Create Quiz / Exam
- Lesson Plan (MELC)
- Create Flashcards
- Write a Story / Poem
- Create a Presentation Outline

**Analyze and Upload** (amber)
- Upload PDF Document
- Document Analysis
- Summarize a Topic
- Compare and Contrast

**School Tools** (green)
- Schedule Helper
- Study Tips
- Math Solver
- Science Experiment Ideas
- Book Report Helper
- Research Guide

**Language and Writing** (pink)
- Grammar Checker
- Translate Text
- Vocabulary Builder
- Letter / Email Writer

**Science and Math** (teal)
- Physics Problem Solver
- Chemistry Helper
- Biology Explainer
- Statistics Calculator

**Lifestyle and Wellness** (rose)
- Meal / Nutrition Planner
- Exercise / PE Activities
- Mindfulness / SEL Activity
- Time Management Tips

**Fun and Creative** (indigo)
- Trivia Game
- Brain Teasers / Riddles
- Debate Topic Generator
- Would You Rather (Educational)
- Icebreaker Activities

**Professional and Career** (slate)
- Resume / CV Helper
- Interview Prep
- Code Helper
- Project Idea Generator

### 3. Colorized Suggestion Chips
The suggestion chips above the input also get color coding:
- Each chip gets a **random soft pastel** border/background from a pool of colors so they look inviting instead of plain gray
- Colors rotate through: blue, green, purple, pink, amber, teal, indigo, rose

### 4. Wider Popover
The popover width increases from `w-72` to `w-80` and max-height from `420px` to `520px` to accommodate the expanded list comfortably.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/aichat/ChatActionMenu.tsx` | Add 30+ actions across 9 colored categories, color each group row, show emoji on colored pill, widen popover |
| `src/components/aichat/ChatSuggestionChips.tsx` | Add rotating pastel colors to each chip, expand default suggestions |

## Technical Details

### Color Implementation for Menu Items
Each group gets a `color` property. Each action row renders with:
```text
<button className="flex items-center gap-2.5 w-full rounded-md px-2 py-1.5 ...">
  <span className="w-6 h-6 rounded-md flex items-center justify-center text-sm {group.bgClass}">
    {item.emoji}
  </span>
  <span>{item.label}</span>
</button>
```

### Chip Color Rotation
```text
const CHIP_COLORS = [
  'border-blue-200 bg-blue-50 text-blue-700',
  'border-green-200 bg-green-50 text-green-700',
  'border-purple-200 bg-purple-50 text-purple-700',
  ...
];
// Each chip uses CHIP_COLORS[index % CHIP_COLORS.length]
```

### No New Dependencies
All styling via Tailwind classes already available in the project.

