# Troubleshooting Guide

## Common Errors and Solutions

### 1. "Missing or insufficient permissions" Error

**Error Message:**
```
FirebaseError: Missing or insufficient permissions.
```

**Solution:**
✅ **FIXED!** Updated Firestore rules have been deployed.

If you still see this error:
1. Wait 30 seconds for Firebase rules to propagate
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache if needed

**What was fixed:**
- Updated security rules to allow authenticated users to create teams
- Made gameState readable by everyone (before authentication)
- Simplified permission checks for better reliability

---

### 2. "SES Removing unpermitted intrinsics" Warning

**Warning Message:**
```
lockdown-install.js:1 SES Removing unpermitted intrinsics
```

**Solution:**
⚠️ **This is NOT an error!** This is a normal Firebase security warning that can be safely ignored.

**Explanation:**
- Firebase uses SES (Secure EcmaScript) for enhanced security
- This warning appears in the browser console but doesn't affect functionality
- No action needed

---

### 3. Game State Not Found

**Issue:** Users immediately redirected after signup

**Solution:**
Create the initial game state document in Firestore:

```javascript
// Run in Firebase Console > Firestore
Collection: gameState
Document ID: current
Fields:
  - started: false (boolean)
  - paused: false (boolean)
  - ended: false (boolean)
  - startedAt: null
  - pausedAt: null
  - endedAt: null
```

**Or run in browser console on your site:**
```javascript
firebase.firestore().collection('gameState').doc('current').set({
  started: false,
  paused: false,
  ended: false,
  startedAt: null,
  pausedAt: null,
  endedAt: null
});
```

---

### 4. Cannot Create Team / Join Team

**Symptoms:**
- "Team already exists" error
- "Team not found" error

**Solutions:**

**For Leaders:**
1. Choose a unique team name
2. Check Firestore for existing teams with same name
3. Ensure you're using the "Team Leader" role

**For Members:**
1. Get exact team name from your team leader
2. Team names are case-sensitive
3. Team must be created by leader first

---

### 5. Clue Submission Not Working

**Issue:** Submit button disabled or no response

**Check:**
1. Has admin started the game? (Check dashboard banner)
2. Is game paused? (Orange banner appears if paused)
3. Has that clue already been found?
4. Are you connected to internet?

**Status Indicators:**
- 🔴 **Game Not Started:** Wait for admin to click "Start Game"
- ⏸️ **Game Paused:** Wait for admin to resume
- ✅ **Game Active:** Submit clues normally

---

### 6. Authentication Errors

**Phone Authentication Issues:**
- **Error:** reCAPTCHA not working
  - **Fix:** Enable Phone provider in Firebase Console
  - **Fix:** Add your domain to authorized domains

**Google Sign-In Issues:**
- **Error:** Popup blocked
  - **Fix:** Allow popups for your domain
  - **Fix:** Enable Google provider in Firebase Console

**Email/Password Issues:**
- **Error:** Weak password
  - **Fix:** Use at least 6 characters
  - **Fix:** Include mix of characters

---

### 7. Admin Cannot Login

**Issue:** Admin login fails or "Not authorized"

**Check:**
1. **Admin email matches** what you created in Firebase Auth
2. **Admin document exists** in Firestore `admins` collection
3. **Document ID = User UID** (copy from Firebase Auth)

**Required Fields in Firestore:**
```
Collection: admins
Document ID: [paste UID from Firebase Auth]
Fields:
  - email: "admin@example.com" (string)
  - name: "Admin" (string)
  - role: "admin" (string)
```

---

### 8. Dashboard/Leaderboard Not Updating

**Issue:** Data doesn't refresh in real-time

**Solutions:**
1. **Check internet connection**
2. **Hard refresh** page (Ctrl+Shift+R)
3. **Check Firebase Console** for data
4. **Verify Firestore rules** are deployed
5. **Check browser console** for errors (F12)

---

### 9. Deployment Issues

**Netlify Deployment:**
- **Error:** Build failed
  - **Fix:** No build needed! Use publish directory: `.`
  - **Fix:** Leave build command empty

**Firebase Rules Deployment:**
```bash
# Deploy rules only
firebase deploy --only firestore:rules

# Check for errors
firebase deploy --only firestore:rules --debug
```

---

### 10. AI Features Not Working

**Issue:** AI Assistant, clue generation not responding

**Check:**
1. **Gemini API key** is correct in `firebase-config.js`
2. **API quota** not exceeded (check Google Cloud Console)
3. **Internet connection** stable
4. **Browser console** for specific errors

**Test API Key:**
```javascript
// Run in browser console
callGeminiAI("Test message").then(response => console.log(response));
```

---

## Quick Diagnostic Commands

**Check Firebase Connection:**
```javascript
// In browser console
firebase.auth().currentUser
```

**Check Firestore Data:**
```javascript
// In browser console
firebase.firestore().collection('teams').get().then(q => console.log(q.size + ' teams'));
```

**Check Game State:**
```javascript
// In browser console
firebase.firestore().collection('gameState').doc('current').get().then(d => console.log(d.data()));
```

---

## Still Having Issues?

1. **Check browser console** (F12 → Console tab) for detailed error messages
2. **Check Firebase Console:**
   - Authentication tab for user issues
   - Firestore tab for data issues
   - Rules tab for permission issues
3. **Review deployment checklist** in DEPLOYMENT.md
4. **Check GitHub issues:** https://github.com/ivocreates/cybercase/issues

---

## Performance Tips

**Speed up your app:**
- ✅ Use CDN for Firebase (already configured)
- ✅ Enable browser caching (Netlify configured)
- ✅ Minimize database reads
- ✅ Use real-time listeners efficiently

**Reduce Firebase costs:**
- Limit number of teams (free tier: 50k reads/day)
- Avoid unnecessary queries
- Use Firebase emulator for testing

---

**Last Updated:** February 24, 2026
