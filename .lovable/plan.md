

# Fix: "supabaseUrl is required" Error

## Problem

The `.env` file is missing from the project root. This file is auto-managed by Lovable Cloud and contains the backend connection variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`). Without it, the app crashes immediately on load.

The fallback values in `vite.config.ts` only activate in `development` mode, so the preview environment fails.

## Fix

Recreate the `.env` file with the correct values. This is a one-line fix -- the file simply needs to exist again with the standard variables.

**File: `.env`** (recreate)
```
VITE_SUPABASE_PROJECT_ID="fkvijsazmfvmlmtoyhsf"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdmlqc2F6bWZ2bWxtdG95aHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODgyMzUsImV4cCI6MjA4MTU2NDIzNX0.fDriAcK-av556SpRE9r3d-xZfq8j_cfwxlBZDLhCSQA"
VITE_SUPABASE_URL="https://fkvijsazmfvmlmtoyhsf.supabase.co"
```

This will immediately resolve the crash and restore the app.

