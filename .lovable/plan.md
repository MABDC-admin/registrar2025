
# Enhance Photo Avatar Animations

## Summary

Add breathing and swaying animations to real photo avatars so they feel more alive, matching the lively experience of character avatars.

## Current vs New

| Avatar Type | Current Animations | After Enhancement |
|-------------|-------------------|-------------------|
| **Photo** | Subtle float only | Float + Breathe + Sway |
| **Character** | Float + Blink + Look | No change |

## Technical Changes

### 1. Add New Keyframes to `src/index.css`

```css
@keyframes avatar-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes avatar-sway {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-1.5deg); }
  75% { transform: rotate(1.5deg); }
}

.animate-avatar-breathe {
  animation: avatar-breathe 3s ease-in-out infinite;
}

.animate-avatar-sway {
  animation: avatar-sway 4s ease-in-out infinite;
}
```

### 2. Update Photo Avatar in `AnimatedStudentAvatar.tsx`

Replace the single `animate-avatar-float` with combined animations:

```tsx
// Before (line 88)
enableAnimation && 'animate-avatar-float'

// After
enableAnimation && 'animate-avatar-float animate-avatar-breathe animate-avatar-sway'
```

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Add `avatar-breathe` and `avatar-sway` keyframes + animation classes |
| `src/components/students/AnimatedStudentAvatar.tsx` | Apply combined animations to photo avatars |

## Visual Result

Photo avatars will have:
- **Float**: Gentle up/down movement (existing)
- **Breathe**: Subtle scale pulse like breathing (new)
- **Sway**: Gentle side-to-side rocking (new)

This makes photo avatars feel alive and engaging, similar to the character avatars with blinking eyes.
