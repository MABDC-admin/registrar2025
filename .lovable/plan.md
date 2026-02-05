
# Fix Canva OAuth Scope Format

## Problem

The `invalid_scope` error occurs because the scopes in the code don't match the format/names configured in the Canva Developer Portal.

Looking at your Developer Portal screenshot, I see scopes like:
- `canva:design:content` (with Read/Write checkboxes)
- `canva:design:meta` (with Read checkbox)

But the code currently requests:
```
design:content:read design:meta:read
```

## What You Need To Do (In Canva Developer Portal)

### Step 1: Enable the Required Scopes

In your Canva Developer Console, go to the **Scopes** section and enable:

| Scope | Permission |
|-------|------------|
| `canva:design:content` | Check **Read** |
| `canva:design:meta` | Check **Read** |

### Step 2: Save Your Changes

Click Save/Update after enabling the scopes.

### Step 3: Verify Redirect URL

Make sure your redirect URL is set to:
```
https://registrar2025.lovable.app
```

---

## Code Change

After you enable the scopes in the Developer Portal, I'll update the edge function to use the exact scope names that Canva expects.

Based on Canva's documentation example:
```
scope=asset:read%20asset:write%20design:meta:read%20folder:read
```

The scopes should use this format: `design:content:read design:meta:read`

However, your Developer Portal shows a different naming convention (`canva:design:content`). This suggests the scope format may need to be:
```
canva:design:content:read canva:design:meta:read
```

### File to Update

| File | Change |
|------|--------|
| `supabase/functions/canva-auth/index.ts` | Update line 111 to match the exact scope format from your Developer Portal |

---

## Recommended Next Steps

1. In your Canva Developer Portal, look for a **"Scopes"** or **"API Scopes"** section
2. Check what the exact scope names are (they might be listed when you hover or click)
3. Enable the Read checkboxes for `design:content` and `design:meta`
4. Save and let me know the exact scope names shown
5. I'll update the code to match

Alternatively, if your Developer Portal has an **"Authorization URL generator"** tool (mentioned in the docs), use it - it will show you the correct scope format for your app.
