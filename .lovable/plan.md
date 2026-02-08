

# Embed YouTube Video Players in Chat

## What This Does
When the AI returns YouTube video links in its responses, they will render as embedded video players directly in the chat instead of just small clickable pills.

## How It Works

### 1. Update System Prompt to Use Direct Video Links
**File: `src/components/aichat/constants.ts`**

The current prompt tells the AI to use YouTube **search URLs** (`youtube.com/results?search_query=...`), which cannot be embedded as video players. Update the YouTube Video References section to instruct the AI to provide actual video URLs when possible (`youtube.com/watch?v=VIDEO_ID`), falling back to search URLs only when a specific video isn't known.

### 2. Embed YouTube Players in Chat Bubbles
**File: `src/components/aichat/ChatMessageBubble.tsx`**

Update the ReactMarkdown `a` component to:
- Detect YouTube watch URLs and extract the video ID (from `v=` parameter or `youtu.be/` short links)
- For embeddable links (those with a video ID): render a 16:9 `<iframe>` YouTube embed player instead of a pill link
- For non-embeddable YouTube links (search URLs): keep the current red pill styling as a fallback
- The embed uses YouTube's privacy-enhanced mode (`youtube-nocookie.com`) for better privacy

### Visual Result
Instead of:
```
[Play icon] 🎥 Photosynthesis Explained [External link icon]
```

Users will see an actual embedded video player they can play directly in the chat.

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/components/aichat/constants.ts` | Update YouTube section in prompt to prefer direct video URLs |
| `src/components/aichat/ChatMessageBubble.tsx` | Add YouTube video ID extraction + iframe embed rendering |

### Video ID Extraction Logic
```text
youtube.com/watch?v=VIDEO_ID  ->  extract VIDEO_ID from query param
youtu.be/VIDEO_ID             ->  extract VIDEO_ID from path
youtube.com/results?...       ->  no video ID, keep as pill link
```

### Embed Code
```text
<iframe
  src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
  allowFullScreen
  className="w-full aspect-video rounded-lg"
/>
```

### No New Dependencies
- Uses the existing `AspectRatio` component from Radix UI (already installed)
- Standard YouTube iframe embed -- no API key needed
