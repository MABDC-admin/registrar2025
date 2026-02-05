

# Improved Canva Design Opening Approach

## Problem Analysis

The 400 error when clicking "Create in Canva" occurs because:

1. **The button links to a public Canva URL** (`https://www.canva.com/design/create`) that is not connected to the OAuth integration. This URL requires the user to be logged into Canva separately in their browser.

2. **Missing write scope**: The OAuth integration only has read scopes (`design:content:read`, `design:meta:read`, `profile:read`), but creating designs requires `design:content:write`.

3. **Invalid fallback URL**: When `edit_url` is missing, the code falls back to `https://www.canva.com/design/{id}/edit` which is not a valid Canva URL format.

## Solution

### Phase 1: Add Write Scope for Creating Designs

Update the OAuth flow to include the `design:content:write` scope, which allows creating new designs via the API.

**File: `supabase/functions/canva-auth/index.ts`**
- Change line 111 from:
  ```javascript
  canvaAuthUrl.searchParams.set('scope', 'design:content:read design:meta:read profile:read');
  ```
  to:
  ```javascript
  canvaAuthUrl.searchParams.set('scope', 'design:content:read design:content:write design:meta:read profile:read');
  ```

### Phase 2: Create Designs via API Instead of External Links

Replace the external "Create in Canva" link with an in-app dialog that creates designs through the Canva API and opens them directly.

**File: `src/components/canva/CanvaStudio.tsx`**

1. Add a "Create New Design" button that opens a modal
2. Allow users to select design type (Presentation, Document, Whiteboard, or Custom size)
3. Call the Canva API to create the design
4. Open the returned `edit_url` in a new tab

**New Component: `src/components/canva/CreateDesignDialog.tsx`**

```text
+--------------------------------------------+
|        Create New Design                   |
+--------------------------------------------+
|  Design Type:                              |
|  [Presentation] [Document] [Whiteboard]    |
|                                            |
|  -- OR Custom Size --                      |
|  Width: [____] px   Height: [____] px      |
|                                            |
|  Title: [________________________]         |
|                                            |
|  [Cancel]              [Create & Open]     |
+--------------------------------------------+
```

### Phase 3: Improve Design Grid Links

**File: `src/components/canva/CanvaDesignGrid.tsx`**

1. Always use the API-provided `edit_url` (which is already returned by the API)
2. Remove the invalid fallback URL format
3. Add a "View" option using `view_url` for read-only access
4. Add error handling when `edit_url` is not available

### Phase 4: User Re-authorization Notice

Since we're adding a new scope, existing users need to re-authorize. Add logic to detect when the connection lacks write permissions and prompt for re-authorization.

## Implementation Details

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/canva-auth/index.ts` | Add `design:content:write` scope |
| `src/components/canva/CanvaStudio.tsx` | Replace external link with CreateDesignDialog |
| `src/components/canva/CanvaDesignGrid.tsx` | Fix link handling, add View option, improve error states |
| `supabase/functions/canva-api/index.ts` | Already supports POST for creating designs |

### New File

| File | Purpose |
|------|---------|
| `src/components/canva/CreateDesignDialog.tsx` | Modal for creating new designs with type selection |

## Technical Notes

- The Canva Create Design API endpoint (`POST /v1/designs`) returns a design object with `edit_url` that opens directly in the Canva editor
- Temporary URLs are valid for 30 days
- Blank designs auto-delete after 7 days if not edited
- The API is rate-limited to 20 requests per minute per user

## After Implementation

Users will need to:
1. Disconnect and reconnect their Canva account to grant the new `design:content:write` permission
2. The "Create New Design" flow will then work seamlessly within the app

