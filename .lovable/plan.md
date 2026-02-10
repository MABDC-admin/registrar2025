

# Fix: MABDC Learners Showing as STFXSA After Login

## Problem

When MABDC students log in, their school context shows STFXSA instead of MABDC. The data segregation is correct at the database level, but the **frontend school context** is set incorrectly after login.

## Root Cause

There are two compounding bugs:

1. **Stale session in AuthContext**: The `fetchUserRole` function reads `session?.user` from React state, but this state hasn't been updated yet when the function runs (it's called from a `setTimeout` or directly before re-render). So `currentUser?.email` is `undefined`, and `setDefaultSchoolForUser` silently does nothing.

2. **Geolocation override on Auth page**: For users in the Philippines, the login page defaults the school to STFXSA via IP geolocation. If the AuthContext fails to correct this after login (due to bug #1), STFXSA persists into localStorage and the entire session.

## Solution

### 1. Fix AuthContext to use the actual session user (not stale state)

Pass the user email directly into `fetchUserRole` from the auth callback where the fresh session is available, instead of reading from stale React state.

**File: `src/contexts/AuthContext.tsx`**
- Change `fetchUserRole` to accept a `userEmail` parameter
- In `onAuthStateChange` and `getSession`, pass `session.user.email` directly
- This guarantees the email is always available when setting the school

### 2. Add a database-backed school resolution fallback

After setting school by email domain, also query the student's actual `school` column from `user_credentials` + `students` table as a secondary guarantee. This handles edge cases where email domain doesn't match.

**File: `src/contexts/AuthContext.tsx`**
- After the email-domain check, query user_credentials to get student_id, then students to get school
- Set the school context based on the actual database record

### 3. Remove geolocation school override for identified students

The geolocation effect in Auth.tsx should not override the school once the user is authenticated and the AuthContext has set the correct school.

**File: `src/pages/Auth.tsx`**  
- No changes needed here since the fix in AuthContext will run after login and correctly override any geolocation default

## Technical Details

### AuthContext changes (primary fix)

```typescript
// Before (broken - session state is stale):
const fetchUserRole = async (userId: string) => {
  // ...fetch role...
  const currentUser = session?.user; // <-- stale!
  if (currentUser?.email) {
    setDefaultSchoolForUser(currentUser.email, userRole);
  }
};

// After (fixed - email passed directly):
const fetchUserRole = async (userId: string, userEmail?: string) => {
  // ...fetch role...
  if (userEmail) {
    setDefaultSchoolForUser(userEmail, userRole);
  }
  // Also query DB for student's actual school as fallback
  const { data: cred } = await supabase
    .from('user_credentials')
    .select('student_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (cred?.student_id) {
    const { data: student } = await supabase
      .from('students')
      .select('school')
      .eq('id', cred.student_id)
      .maybeSingle();
    if (student?.school) {
      setSelectedSchool(student.school.toUpperCase() as SchoolType);
    }
  }
};

// Callers updated:
// onAuthStateChange: fetchUserRole(session.user.id, session.user.email)
// getSession: fetchUserRole(session.user.id, session.user.email)
```

## Expected Result

- MABDC students logging in will have their school context correctly set to MABDC
- STFXSA students will continue to work as before
- The fix works regardless of geolocation or email domain by using the actual student record as the source of truth

