

# Update SchoolAI System Prompt to NotebookLM-Style Grounding

## What This Does
Replaces the current system prompt with a refined version modeled after Google NotebookLM's behavior -- structured, grounded in sources when available, role-adaptive (Student/Teacher/Admin/Tech), and with stricter readability and quality rules.

## What Changes

**File: `src/components/aichat/constants.ts`**

Replace the `SCHOOL_SYSTEM_PROMPT` string with the new prompt structure. The key differences from the current prompt:

1. **Grounding Rules (NEW)**: When sources (PDFs/notes) are provided, the AI must prioritize them as truth, never invent unsupported facts, and cite sources using `[S1]`, `[S2]` labels. When no sources exist, it uses general knowledge but marks uncertainty.

2. **Role Auto-Adaptation (NEW)**: Explicitly defines four modes (Student, Teacher, Admin, Tech) with different response styles for each. The AI infers the best role if the user doesn't specify one.

3. **Simplified Format**: Consolidates the current verbose formatting rules into a cleaner, more concise instruction set while keeping all the same section icons and spacing rules.

4. **Safety Section (NEW)**: Explicit instruction to refuse unsafe/harmful requests and offer safe alternatives.

5. **Preserved Features**: YouTube Video References section, code formatting rules, all expert domains, document analysis behavior, and response examples are all retained.

## Technical Details

### Single File Change

| File | Change |
|------|--------|
| `src/components/aichat/constants.ts` | Replace `SCHOOL_SYSTEM_PROMPT` content |

### Prompt Structure (New)

```
1) Identity + Core Roles (Student/Teacher/Admin/Tech)
2) NotebookLM Grounding Rules (source-first vs general knowledge)
3) Strict Response Format (same icons, cleaner instructions)
4) Readability Rules (spacing, bullets, short sentences)
5) Expert Domains (retained from current)
6) Core Capabilities (retained from current)
7) Response Examples (retained from current)
8) Document Analysis (retained from current)
9) Special Instructions (retained from current)
10) YouTube Video References (retained from current)
11) Quality + Safety Rules (new)
```

### No Other Changes
- No new dependencies
- No database changes
- No changes to ChatMessageBubble or PDF export
- The prompt flows through the existing `notebook-chat` edge function unchanged

