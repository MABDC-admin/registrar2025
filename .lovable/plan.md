

# Progressive Web App (PWA) Setup

## Overview

Make the MABDC Registrar Portal installable as a PWA so users can add it to their home screen on any device. It will work offline, load instantly, and feel like a native app.

## What Will Change

### 1. Install `vite-plugin-pwa`

Add the `vite-plugin-pwa` package which handles service worker generation, manifest creation, and caching automatically.

### 2. Configure Vite (`vite.config.ts`)

Add the PWA plugin with:
- App name: "MABDC - St. Francis Registrar Portal"
- Short name: "MABDC Portal"
- Theme color: `#0D9488` (teal, matching current theme-color)
- Background color: `#ffffff`
- Display: `standalone`
- Start URL: `/`
- Icons: 192x192 and 512x512 PNG icons
- Runtime caching strategy for API calls
- Auto-update service worker (prompt user to reload when update available)

### 3. Add PWA Icons (`public/`)

Create two icon files:
- `public/pwa-192x192.png` -- 192x192 app icon (teal graduation cap on white)
- `public/pwa-512x512.png` -- 512x512 app icon (same design, larger)

These will be simple generated SVG-based icons embedded as PNGs.

### 4. Update `index.html`

Add mobile-optimized meta tags:
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- `<meta name="apple-mobile-web-app-title" content="MABDC Portal">`
- `<link rel="apple-touch-icon" href="/pwa-192x192.png">`

### 5. Register Service Worker (`src/main.tsx`)

Import and call `registerSW` from `vite-plugin-pwa/vanilla` to handle:
- Auto-registration of the service worker
- Prompt for update when a new version is available

### 6. Install Prompt Page (`src/pages/Install.tsx`)

Create a dedicated `/install` page with:
- Instructions for installing on iOS (Share > Add to Home Screen)
- Instructions for installing on Android (browser menu > Install)
- A "Install Now" button that triggers the browser's native install prompt (on supported browsers)
- Visual guide with device icons

### 7. Add Route (`src/App.tsx`)

Add `<Route path="/install" element={<Install />} />` before the catch-all route.

## Technical Details

### Caching Strategy

- **Precache**: All app shell assets (JS, CSS, HTML, fonts)
- **Runtime cache**: API requests use NetworkFirst strategy (try network, fall back to cache)
- **Images**: CacheFirst with 30-day expiry

### Service Worker Config (vite.config.ts)

```text
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
  manifest: {
    name: 'MABDC - St. Francis Registrar Portal',
    short_name: 'MABDC Portal',
    theme_color: '#0D9488',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [...]
  },
  workbox: {
    runtimeCaching: [...]
  }
})
```

### Files Created
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `src/pages/Install.tsx`

### Files Modified
- `vite.config.ts` (add PWA plugin)
- `index.html` (add Apple meta tags)
- `src/main.tsx` (register service worker)
- `src/App.tsx` (add /install route)
- `package.json` (add vite-plugin-pwa dependency)

