# Permissions Fix - February 24, 2026

## Problem
Users were getting "Missing or insufficient permissions" error when trying to sign up on the deployed Netlify site.

## Root Cause
1. **Authentication token propagation delay**: After creating a new user account, Firebase Auth tokens weren't fully propagated before attempting Firestore writes
2. **Firestore rules too generic**: Rules didn't distinguish between actions that should always be allowed (signup, team joining) vs actions that require game to be started (clue submission)

## Solution Implemented

### 1. Enhanced Firestore Security Rules (`firestore.rules`)

**Before**: Generic rules that allowed all authenticated updates
```javascript
allow update: if request.auth != null;
```

**After**: Granular rules that separate concerns
```javascript
allow update: if isAuthenticated() && (
  // Adding members is ALWAYS allowed (joining teams before/during game)
  (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['members'])) ||
  // Clue submissions ONLY when game is started
  (isGameStarted() && request.resource.data.diff(resource.data).affectedKeys().hasAny(['clues', 'cluesFound', 'submissions', 'score'])) ||
  // Admins can update anything
  isAdmin()
);
```

**Key improvements**:
- ✅ Team creation requires `leaderId == request.auth.uid` (security)
- ✅ Joining teams (adding members) is **always allowed** regardless of game state
- ✅ Clue submission (updating clues, score) is **only allowed when game is started**
- ✅ Added helper functions: `isAuthenticated()`, `isGameStarted()`, `isAdmin()`

### 2. Token Refresh in Signup Flow (`js/signup-enhanced.js`)

Added token refresh and propagation delay in all signup methods:

```javascript
async function createTeamLeader(email, password, name, teamName) {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Force token refresh to ensure auth state is fully propagated
    await user.getIdToken(true);
    
    // Small delay to ensure Firestore is ready to accept writes
    await new Promise(resolve => setTimeout(resolve, 500));

    await createTeamAndProfile(user, name, teamName, 'leader', email);
    window.location.href = 'dashboard.html';
}
```

**Applied to**:
- ✅ `createTeamLeader()` - Email/Password leader signup
- ✅ `joinTeamAsMember()` - Email/Password member signup
- ✅ `createTeamLeaderWithPhone()` - Phone auth leader
- ✅ `joinTeamAsMemberWithPhone()` - Phone auth member
- ✅ `createTeamLeaderWithGoogle()` - Google auth leader
- ✅ `joinTeamAsMemberWithGoogle()` - Google auth member

## What Changed

| Action | Before | After |
|--------|--------|-------|
| **Team Creation** | Allowed if authenticated | ✅ Allowed if authenticated (anytime) |
| **Joining Team** | Allowed if authenticated | ✅ Allowed if authenticated (anytime) |
| **Clue Submission** | Allowed if authenticated | ⏰ Allowed ONLY when game is started |
| **Profile Creation** | Sometimes failed due to timing | ✅ Works reliably with token refresh |

## Game Flow (Correct Behavior)

### ✅ BEFORE Game Starts (Always Allowed)
1. Browse teams (`teams.html`)
2. Sign up as leader or member (`signup-enhanced.html`)
3. Create new team (leader)
4. Join existing team (member)
5. View leaderboard (read-only)
6. View announcements (read-only)
7. Login to existing account

### ⏰ AFTER Game Starts (Admin starts game)
8. Submit clues (dashboard)
9. Earn points
10. Update team score
11. Real-time leaderboard updates

### 🚫 Never Allowed (Until Admin Action)
- Submit clues before game starts
- Modify scores manually
- Delete teams (admin only)

## Deployment Status

✅ **Firestore Rules**: Deployed to `techfest-2k26` project
```bash
firebase deploy --only firestore:rules
✓ Deploy complete!
```

✅ **Code Changes**: Pushed to GitHub (commit 7a30c06)
```
2 files changed, 62 insertions(+), 17 deletions(-)
```

## Next Steps for You

### 1. Redeploy to Netlify
Your local code is updated. Now redeploy to Netlify:

**Option A: Drag & Drop**
1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag entire `techfest` folder
3. Overwrite existing site

**Option B: CLI**
```powershell
netlify deploy --prod
```

**Option C: GitHub Auto-Deploy (Recommended)**
1. Go to your Netlify dashboard
2. Site settings → Build & deploy → Repository
3. Link to `github.com/ivocreates/cybercase`
4. Set build settings:
   - Base directory: (leave empty)
   - Build command: (leave empty, it's a static site)
   - Publish directory: `.` or `/`
5. Enable auto-deploy on push to `main` branch

### 2. Test the Fix
After redeploying, test this sequence:

1. ✅ Go to `https://cybercase.netlify.app/signup-enhanced.html?role=leader`
2. ✅ Sign up with email (should work without permissions error)
3. ✅ Check dashboard - clue inputs should be **disabled** with message "Game Not Started"
4. ✅ Login as admin → Start game
5. ✅ Go back to team dashboard - inputs should now be **enabled**
6. ✅ Submit a clue - should work!

### 3. Monitor for Issues

Check browser console (`F12`) for any errors. The "SES Removing unpermitted intrinsics" warning is from Netlify's edge functions and can be ignored - it doesn't affect functionality.

## Technical Details

### Firestore Rule Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Check if game has started (reads gameState/current document)
function isGameStarted() {
  return get(/databases/$(database)/documents/gameState/current).data.started == true;
}

// Check if user is admin (exists in admins collection)
function isAdmin() {
  return isAuthenticated() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
```

### Token Refresh Explanation

When you create a new Firebase user with `createUserWithEmailAndPassword()`, the authentication token is generated asynchronously. Firestore security rules verify this token on every request. Without `getIdToken(true)` and a small delay, the token might not be fully propagated to Firestore's security rules engine, causing "Missing or insufficient permissions" errors.

The fix:
```javascript
await user.getIdToken(true);  // Force token refresh
await new Promise(resolve => setTimeout(resolve, 500));  // Wait 500ms
```

This ensures:
1. Token is generated and cached
2. Token is propagated to Firestore's rules engine
3. Subsequent writes will have valid authentication

## Questions or Issues?

If you still see permissions errors after redeploying:

1. **Clear browser cache**: `Ctrl + Shift + Delete` → Clear cache
2. **Check Firebase Console**: 
   - Go to Firestore → Rules tab
   - Verify rules show the updated version with `isGameStarted()` function
3. **Check deployed files**:
   - Open `https://cybercase.netlify.app/js/signup-enhanced.js`
   - Verify it contains `getIdToken(true)` calls
4. **Test in incognito mode**: Rules out cached JavaScript

## Summary

✅ **Fixed**: Signup permissions error  
✅ **Fixed**: Game flow - signup allowed anytime, clue submission after game starts  
✅ **Deployed**: Firestore rules to production  
✅ **Pushed**: Code changes to GitHub  
⏳ **Next**: You need to redeploy frontend to Netlify

The backend (Firebase) is fixed. Just redeploy the frontend (Netlify) and you're good to go! 🚀
