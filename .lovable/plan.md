
# Canva Design Studio Integration for Teachers & Admins

## Overview
Add a full Canva integration page that allows teachers and administrators to:
1. Connect their Canva account via OAuth 2.0
2. Access their existing designs
3. Create new designs from templates
4. Build presentations and slideshows
5. Export and save designs

---

## Architecture

### How Canva Connect API Works

```text
┌──────────────────┐     ┌─────────────────────┐     ┌────────────────┐
│   Your App       │────▶│  Edge Function      │────▶│  Canva API     │
│   (Frontend)     │     │  (Backend/OAuth)    │     │  (Connect API) │
└──────────────────┘     └─────────────────────┘     └────────────────┘
        │                         │
        │  1. Click "Connect"     │
        │  ───────────────────▶   │
        │                         │  2. Redirect to Canva OAuth
        │                         │  ───────────────────────────▶
        │                         │
        │                         │  3. User authorizes
        │                         │  ◀───────────────────────────
        │                         │
        │  4. Get access token    │  4. Exchange code for token
        │  ◀───────────────────   │  ───────────────────────────▶
        │                         │
        │  5. Call Canva APIs     │  5. Make API requests
        │  ───────────────────▶   │  ───────────────────────────▶
```

### OAuth 2.0 Flow with PKCE
Canva uses OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange):

1. **Authorization Request**: Redirect user to Canva with client_id, redirect_uri, code_challenge
2. **User Consent**: User logs in and authorizes your app
3. **Callback**: Canva redirects back with authorization code
4. **Token Exchange**: Backend exchanges code for access/refresh tokens
5. **API Access**: Use access token for Canva API calls

---

## Required Credentials

You'll need these from your Canva Developer Portal:

| Credential | Description | Where to Get |
|------------|-------------|--------------|
| `CANVA_CLIENT_ID` | Your integration's client ID | Developer Portal → Integration Settings |
| `CANVA_CLIENT_SECRET` | Your integration's secret (backend only) | Developer Portal → Integration Settings |

---

## Database Schema

### New Tables

**canva_connections** - Store user OAuth tokens
```sql
CREATE TABLE public.canva_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  canva_user_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);
```

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `supabase/functions/canva-auth/index.ts` | OAuth flow handler |
| Create | `supabase/functions/canva-api/index.ts` | Proxy for Canva API calls |
| Create | `src/components/canva/CanvaStudio.tsx` | Main Canva page component |
| Create | `src/components/canva/CanvaConnectButton.tsx` | OAuth connect button |
| Create | `src/components/canva/CanvaDesignGrid.tsx` | Display user's designs |
| Create | `src/components/canva/CanvaTemplateGallery.tsx` | Browse Canva templates |
| Modify | `src/components/layout/DashboardLayout.tsx` | Add Canva nav item |
| Modify | `src/pages/Index.tsx` | Add Canva tab handler |
| Create | `src/components/icons/ThreeDIcons.tsx` | Add Canva icon |

---

## Edge Functions

### 1. canva-auth (OAuth Handler)

```typescript
// Endpoints:
// GET /canva-auth?action=authorize - Start OAuth flow
// GET /canva-auth?action=callback&code=xxx - Handle callback
// POST /canva-auth?action=refresh - Refresh token
// DELETE /canva-auth - Disconnect Canva
```

**Key Features**:
- Generate PKCE code_verifier and code_challenge
- Store tokens encrypted in database
- Handle token refresh automatically
- Secure backend-only token storage

### 2. canva-api (API Proxy)

```typescript
// Endpoints (proxied to Canva):
// GET /canva-api/designs - List user's designs
// GET /canva-api/designs/:id - Get design details
// POST /canva-api/designs - Create new design
// GET /canva-api/templates - Browse templates
// POST /canva-api/exports - Export design
```

---

## UI Components

### CanvaStudio Page Layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  🎨 Canva Design Studio                      [Disconnect]   │    │
│  │  Create beautiful designs, presentations, and more          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  [My Designs]  [Templates]  [Create New ▼]                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │        │  │        │  │        │  │        │  │        │       │
│  │Design 1│  │Design 2│  │Design 3│  │Design 4│  │Design 5│       │
│  │        │  │        │  │        │  │        │  │        │       │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Not Connected State

```text
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                        🎨                                          │
│                                                                     │
│              Connect Your Canva Account                             │
│                                                                     │
│    Access your designs, templates, and create beautiful            │
│    presentations directly from your school portal.                  │
│                                                                     │
│              ┌────────────────────────┐                            │
│              │  🔗 Connect with Canva │                            │
│              └────────────────────────┘                            │
│                                                                     │
│    ✓ Access your existing designs                                  │
│    ✓ Create from 250,000+ templates                                │
│    ✓ Build presentations & slideshows                              │
│    ✓ Export to PDF, PNG, or video                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Navigation Integration

Add "Canva" to the sidebar for admin and teacher roles:

```typescript
// In DashboardLayout.tsx - getNavItemsForRole()
case 'admin':
  return [
    ...baseItems,
    { id: 'canva', icon: CanvaIcon3D, label: 'Canva Studio' },  // NEW
    // ... rest of items
  ];

case 'teacher':
  return [
    ...baseItems,
    { id: 'canva', icon: CanvaIcon3D, label: 'Canva Studio' },  // NEW
    // ... rest of items
  ];
```

---

## Canva Connect API Capabilities

Once connected, users can:

| Feature | API Endpoint | Description |
|---------|--------------|-------------|
| List Designs | `GET /v1/designs` | View all user designs |
| Get Design | `GET /v1/designs/:id` | Get design details |
| Create Design | `POST /v1/designs` | Start new design |
| Export Design | `POST /v1/exports` | Export to PNG/PDF/etc |
| List Folders | `GET /v1/folders` | Browse design folders |
| Browse Templates | `GET /v1/templates` | Access template library |

---

## Security Considerations

1. **Tokens stored server-side only**: Access/refresh tokens never exposed to frontend
2. **PKCE for OAuth**: Prevents authorization code interception
3. **RLS policies**: Only users can access their own Canva connection
4. **Token encryption**: Tokens encrypted at rest in database
5. **Automatic refresh**: Tokens refreshed before expiry

---

## Implementation Steps

### Phase 1: Setup & Credentials
1. Store `CANVA_CLIENT_ID` and `CANVA_CLIENT_SECRET` as secrets
2. Configure OAuth redirect URL in Canva Developer Portal
3. Create database table for token storage

### Phase 2: Backend (Edge Functions)
1. Create `canva-auth` edge function for OAuth flow
2. Create `canva-api` edge function as API proxy
3. Implement token refresh logic

### Phase 3: Frontend Components
1. Create CanvaStudio main page
2. Build CanvaConnectButton with OAuth flow
3. Create CanvaDesignGrid for displaying designs
4. Add CanvaTemplateGallery for browsing templates

### Phase 4: Navigation Integration
1. Add Canva icon to ThreeDIcons
2. Add nav item to DashboardLayout
3. Add tab handler to Index.tsx

---

## Prerequisites Before Implementation

Before I can build this integration, you'll need to provide:

1. **Canva Client ID** - From your Canva Developer Portal integration
2. **Canva Client Secret** - From your Canva Developer Portal integration

Once you have these credentials, I'll:
1. Securely store them as secrets
2. Build the OAuth flow
3. Create the Canva Studio page
4. Connect everything together

---

## Summary

| Component | Technology |
|-----------|------------|
| OAuth Flow | Edge Function with PKCE |
| Token Storage | Encrypted in database with RLS |
| API Proxy | Edge Function proxying Canva Connect API |
| Frontend | React components with Tabs for designs/templates |
| Access Control | Admin and Teacher roles only |
