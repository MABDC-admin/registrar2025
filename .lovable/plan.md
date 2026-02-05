
# Build & Systems Audit Report

## Executive Summary
Found **2 critical build errors** blocking deployment plus **several warnings** requiring attention.

---

## CRITICAL Issues (Must Fix)

### 1. TypeScript Syntax Error in `schoolYearQuery.ts` (Line 28)
**Severity: CRITICAL - Blocks Build**

**Problem:** Invalid TypeScript syntax in type assertion function:
```typescript
// BROKEN - line 28
): asserts schoolId is string, academicYearId is string {
```
TypeScript does not support multiple type predicates in a single assertion.

**Fix:** Split into two separate validation checks:
```typescript
export function validateSchoolContext(
    schoolId: string | null,
    academicYearId: string | null
): void {
    if (!schoolId) {
        throw new SchoolContextError('School context is required but not set');
    }
    if (!academicYearId) {
        throw new SchoolContextError('Academic year context is required but not set');
    }
}
```

---

### 2. Invalid Import Path in `schoolYearQuery.ts` and `schoolAccessUtils.ts`
**Severity: CRITICAL - Blocks Build**

**Problem:** Both files import from `@/lib/supabase` which doesn't exist:
```typescript
import { supabase } from '@/lib/supabase';  // ❌ File doesn't exist
```

**Fix:** Update to the correct path:
```typescript
import { supabase } from '@/integrations/supabase/client';  // ✅ Correct path
```

---

### 3. Edge Function TypeScript Error in `sync-holidays/index.ts` (Line 106)
**Severity: CRITICAL - Blocks Edge Function Deployment**

**Problem:** The `error` variable is of type `unknown`:
```typescript
catch (error) {
    return new Response(JSON.stringify({ error: error.message }), ...);
    //                                          ^^^^^ error is 'unknown'
}
```

**Fix:** Add proper type narrowing:
```typescript
catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
    });
}
```

---

## WARNING Issues (Should Fix)

### 4. Database Security: Overly Permissive RLS Policies
**Severity: WARNING**

The linter detected multiple RLS policies using `USING (true)` or `WITH CHECK (true)` for UPDATE/DELETE/INSERT. This allows unrestricted access.

**Recommendation:** Review and tighten these policies to use proper user/role checks.

---

### 5. Database Security: Functions Missing `search_path`
**Severity: WARNING**

8 database functions lack explicit `search_path` settings, making them vulnerable to search path injection.

**Affected Functions:**
- `manage_permissions_manually`
- `format_student_text_fields`
- `validate_school_academic_year`
- `log_school_access`
- `handle_new_user`
- `update_updated_at_column`
- `title_case`
- `user_has_school_access`

---

### 6. Database Security: Security Definer View
**Severity: ERROR (DB Level)**

A view uses `SECURITY DEFINER` which bypasses RLS of the querying user.

---

## MINOR Issues

### 7. Type Definitions in Dependencies
**Severity: MINOR**

`@types/papaparse`, `@types/qrcode`, `@types/react-signature-canvas` are in dependencies instead of devDependencies. These are only needed at build time.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/schoolYearQuery.ts` | Fix type assertion syntax + fix import path |
| `src/utils/schoolAccessUtils.ts` | Fix import path |
| `supabase/functions/sync-holidays/index.ts` | Fix unknown error type handling |

---

## Implementation Plan

### Step 1: Fix `src/utils/schoolYearQuery.ts`
- Line 9: Change import from `@/lib/supabase` → `@/integrations/supabase/client`
- Lines 25-28: Change function signature to return `void` instead of dual type predicate

### Step 2: Fix `src/utils/schoolAccessUtils.ts`
- Line 8: Change import from `@/lib/supabase` → `@/integrations/supabase/client`

### Step 3: Fix `supabase/functions/sync-holidays/index.ts`
- Lines 105-109: Add proper error type narrowing in catch block

---

## Post-Fix Verification
After fixes, the build should complete without errors. The security warnings should be addressed in a follow-up task to tighten RLS policies and add `search_path` to functions.
