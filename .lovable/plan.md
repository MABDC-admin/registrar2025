
# AI-Style Animated Student Avatars

## Summary

This plan adds subtle, life-like animations to student avatars across the application, creating an engaging "idle animation" effect where avatars appear to be alive with gentle head movements and blinking.

## Approach

Since animating real photos with AI (like D-ID or HeyGen) requires expensive external APIs and processing, we'll implement a creative CSS/Framer Motion solution that works for both photo and non-photo avatars:

| Avatar Type | Animation Technique |
|-------------|---------------------|
| Photo avatars | Subtle CSS transforms (gentle bobbing, slight rotation) + overlay blink effect |
| Initial avatars | Full animated character with eyes, blink animation, and head movement |

## Architecture

```text
+----------------------------------------------------------+
|  AnimatedAvatar Component                                  |
+----------------------------------------------------------+
|                                                            |
|  If photo_url exists:                                      |
|  +------------------------------------------------------+  |
|  |  Photo with CSS transforms                            |  |
|  |  - Gentle floating/bobbing animation                  |  |
|  |  - Subtle rotation (simulates head movement)          |  |
|  |  - Optional: overlay eyelid blink effect              |  |
|  +------------------------------------------------------+  |
|                                                            |
|  If no photo (initials fallback):                          |
|  +------------------------------------------------------+  |
|  |  Animated character avatar                            |  |
|  |  - Cute circular face with eyes                       |  |
|  |  - CSS keyframe blink animation                       |  |
|  |  - Head bobbing with framer-motion                    |  |
|  +------------------------------------------------------+  |
|                                                            |
+----------------------------------------------------------+
```

## Technical Implementation

### 1. New Component: AnimatedStudentAvatar

Creates a reusable animated avatar component:

```typescript
interface AnimatedStudentAvatarProps {
  photoUrl: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  enableAnimation?: boolean;
}

const AnimatedStudentAvatar = ({
  photoUrl,
  name,
  size = 'md',
  enableAnimation = true
}: AnimatedStudentAvatarProps) => {
  if (photoUrl) {
    return <AnimatedPhotoAvatar ... />;
  }
  return <AnimatedCharacterAvatar ... />;
};
```

### 2. CSS Keyframe Animations (in index.css)

```css
/* Subtle head bob animation for photos */
@keyframes avatar-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(-1deg); }
  75% { transform: translateY(1px) rotate(1deg); }
}

/* Blink animation for character avatars */
@keyframes avatar-blink {
  0%, 45%, 55%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.1); }
}

/* Eye look around animation */
@keyframes avatar-look {
  0%, 100% { transform: translateX(0); }
  30% { transform: translateX(2px); }
  70% { transform: translateX(-2px); }
}

.animate-avatar-float {
  animation: avatar-float 4s ease-in-out infinite;
}

.animate-avatar-blink {
  animation: avatar-blink 4s ease-in-out infinite;
}

.animate-avatar-look {
  animation: avatar-look 6s ease-in-out infinite;
}
```

### 3. Character Avatar Design (for initials fallback)

When no photo exists, render a cute animated character:

```text
+---------------------------+
|       ┌─────────┐         |
|      /           \        |
|     │   ◉     ◉   │       |  <- Eyes with blink animation
|     │             │       |
|     │     ‿       │       |  <- Cute smile
|      \           /        |
|       └─────────┘         |
|          "JD"             |  <- Initials below
+---------------------------+
```

The eyes will have:
- Random blink timing (3-5 seconds between blinks)
- Occasional "look around" animation
- Pupil follows cursor on hover (optional enhancement)

### 4. Photo Avatar Animation

For students with photos:
- Gentle floating/bobbing (2-4px vertical movement)
- Subtle rotation (-1deg to +1deg)
- Optional: semi-transparent eyelid overlay that animates closed briefly

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/students/AnimatedStudentAvatar.tsx` | Main animated avatar component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add avatar animation keyframes |
| `src/components/students/StudentCard.tsx` | Replace static avatar with AnimatedStudentAvatar |
| `src/components/students/StudentHoverPreview.tsx` | Add AnimatedStudentAvatar to hover card |
| `src/components/students/StudentProfileCard.tsx` | Add animation to profile header avatar |
| `src/components/dashboard/GlobalStudentSearch.tsx` | Add subtle animation to search results |

## Animation Specifications

| Animation | Duration | Easing | Description |
|-----------|----------|--------|-------------|
| Head float | 4s | ease-in-out | Gentle up/down + rotation |
| Eye blink | 4s | ease-in-out | Quick close/open (50% point) |
| Eye look | 6s | ease-in-out | Horizontal pupil movement |
| Hover pause | - | - | Animations pause on hover for focus |

## Component Props

```typescript
interface AnimatedStudentAvatarProps {
  photoUrl: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  enableAnimation?: boolean;
  showOnlineIndicator?: boolean;
}
```

Size mappings:
- xs: 24px (search results)
- sm: 32px (compact lists)
- md: 48px (cards)
- lg: 64px (profile headers)
- xl: 96px (full profile)

## Visual Preview

**Character Avatar (no photo):**
```text
┌──────────────┐
│    ╭────╮    │
│   ╱      ╲   │
│  │  ●  ●  │  │  <- Animated eyes
│  │   ‿    │  │     (blink + look)
│   ╲      ╱   │
│    ╰────╯    │  <- Subtle bobbing
│              │
│     AB       │  <- Initials
└──────────────┘
```

**Photo Avatar:**
```text
┌──────────────┐
│  ╭────────╮  │
│ │ ┌──────┐ │ │
│ │ │ PHOTO│ │ │  <- Gentle float
│ │ │      │ │ │     animation
│ │ └──────┘ │ │
│  ╰────────╯  │
│    ●(online) │
└──────────────┘
```

## Performance Considerations

- Use CSS animations (GPU-accelerated) instead of JS intervals
- `will-change: transform` for smooth rendering
- Reduced motion media query support for accessibility
- Staggered animation delays prevent synchronized movement
- Animations pause when off-screen (Intersection Observer)

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .animate-avatar-float,
  .animate-avatar-blink,
  .animate-avatar-look {
    animation: none;
  }
}
```

## Implementation Order

1. Add CSS keyframe animations to `index.css`
2. Create `AnimatedStudentAvatar.tsx` component
3. Integrate into `StudentCard.tsx`
4. Add to `StudentHoverPreview.tsx`
5. Update `StudentProfileCard.tsx`
6. Add to `GlobalStudentSearch.tsx`
