# 🚀 Deployment Guide

## Firebase Rules Deployed ✅

Your Firestore security rules have been successfully deployed to Firebase project: **techfest-2k26**

View them at: https://console.firebase.google.com/project/techfest-2k26/firestore/rules

---

## Next Steps: Deploy to Netlify

### Option 1: Drag & Drop (Easiest - 2 minutes)

1. **Prepare the folder**:
   - Your project is ready at: `c:\Users\Ivo\Downloads\techfest`
   - All configuration files are in place

2. **Go to Netlify**:
   - Visit: https://app.netlify.com/drop
   - Sign up or login with GitHub/GitLab/Email

3. **Deploy**:
   - Drag the entire `techfest` folder to the drop zone
   - Wait 10-20 seconds
   - Your site is live! 🎉

4. **Get your URL**:
   - Netlify will give you a URL like: `https://random-name-12345.netlify.app`
   - You can customize this in Site Settings → Domain Management

5. **Update Firebase**:
   - Go to Firebase Console → Authentication → Settings
   - Add your Netlify domain to "Authorized domains"
   - Example: `random-name-12345.netlify.app`

---

### Option 2: Netlify CLI (Advanced)

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project folder
cd "c:\Users\Ivo\Downloads\techfest"
netlify deploy --prod

# Follow the prompts:
# - Create & configure a new site
# - Deploy path: . (current directory)
```

---

### Option 3: Git + Continuous Deployment (Recommended for Production)

```powershell
# 1. Initialize git repository
cd "c:\Users\Ivo\Downloads\techfest"
git init
git add .
git commit -m "Initial commit: CyberCase Hunt app"

# 2. Push to GitHub
# - Create a new repository on GitHub
# - Follow their instructions to push code

# 3. Connect to Netlify
# - Go to https://app.netlify.com/
# - Click "Add new site" → "Import an existing project"
# - Choose GitHub and select your repository
# - Build settings:
#   * Build command: (leave empty)
#   * Publish directory: .
# - Click "Deploy site"

# 4. Auto-deploy on every git push!
```

---

## Post-Deployment Checklist

### 1. Configure Firebase Authentication

Go to [Firebase Console](https://console.firebase.google.com/project/techfest-2k26/authentication/providers):

- ✅ **Email/Password**: Already enabled
- ⚠️ **Phone Authentication**:
  1. Click "Phone" provider
  2. Enable it
  3. reCAPTCHA will be auto-configured
  
- ⚠️ **Google Sign-in**:
  1. Click "Google" provider
  2. Enable it
  3. Add support email: your-email@gmail.com
  4. Save

### 2. Add Authorized Domains

Go to: Authentication → Settings → Authorized domains

Add your Netlify domain:
- Example: `cybercase-hunt-12345.netlify.app`
- Click "Add domain"

### 3. Create Admin Account

**Method A: Firebase Console**

1. Go to: Authentication → Users → Add user
2. Email: `admin@spkcollege.edu` (or your choice)
3. Password: Create a strong password
4. Copy the generated UID

5. Go to: Firestore Database → Start collection
6. Collection ID: `admins`
7. Document ID: Paste the UID
8. Add fields:
   - `email`: `admin@spkcollege.edu`
   - `name`: `Admin`
   - `role`: `admin`
   - `createdAt`: (current timestamp)
9. Save

**Method B: Using Firebase JS in Browser Console**

1. Open your deployed site
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
```javascript
// First, sign up as admin through the app, then:
const adminUid = firebase.auth().currentUser.uid;
firebase.firestore().collection('admins').doc(adminUid).set({
  email: 'admin@spkcollege.edu',
  name: 'Admin',
  role: 'admin',
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

### 4. Initialize Game State ⚠️ IMPORTANT

**REQUIRED before users can signup!**

Go to: Firestore Database → Add collection

1. Collection ID: `gameState`
2. Document ID: `current` (type exactly this)
3. Add fields:
   - `started` (boolean): `false`
   - `paused` (boolean): `false`
   - `ended` (boolean): `false`
   - `startedAt` (null): leave null
   - `pausedAt` (null): leave null
   - `endedAt` (null): leave null
4. Click Save

**Or run in browser console:**
```javascript
firebase.firestore().collection('gameState').doc('current').set({
  started: false,
  paused: false,
  ended: false,
  startedAt: null,
  pausedAt: null,
  endedAt: null
}).then(() => alert('Game state initialized!'));
```

### 5. Test Everything

- [ ] Visit your Netlify URL
- [ ] Admin login works
- [ ] Admin can start game
- [ ] Team signup works (Email/Phone/Google)
- [ ] Team dashboard accessible
- [ ] Clue submission works
- [ ] Leaderboard updates
- [ ] Announcements visible

---

## Customize Your Site

### Change Site Name

In Netlify:
1. Site settings → Domain management
2. Click "Options" on your netlify.app domain
3. "Edit site name"
4. Enter: `cybercase-hunt` → Save
5. Your new URL: `https://cybercase-hunt.netlify.app`

### Add Custom Domain

If you have a domain (e.g., `techfest.spkcollege.edu`):
1. Netlify: Site settings → Domain management → Add custom domain
2. Follow DNS configuration instructions
3. Update Firebase authorized domains

---

## Monitoring & Management

### Netlify Dashboard
- **Deploys**: View deployment history
- **Functions**: See if any serverless functions
- **Analytics**: Track visits (paid feature)
- **Forms**: If you add contact forms

### Firebase Console
- **Authentication**: Monitor user signups
- **Firestore**: View real-time data
- **Usage**: Check quotas (free tier limits)

---

## Support URLs

- **Netlify Dashboard**: https://app.netlify.com/
- **Firebase Console**: https://console.firebase.google.com/project/techfest-2k26
- **Firestore Rules**: https://console.firebase.google.com/project/techfest-2k26/firestore/rules
- **Authentication**: https://console.firebase.google.com/project/techfest-2k26/authentication

---

## Troubleshooting

### "Game not started" error
- Admin must login and click "Start Game" in Game Control tab

### Phone authentication not working
- Enable Phone provider in Firebase Console
- Check if domain is authorized

### Google sign-in popup blocked
- Allow popups for your domain
- Check authorized domains includes your Netlify URL

### Clue submission fails
- Check Firestore rules are deployed
- Verify game is started
- Ensure admin set clues for the team

---

## Need Help?

Check:
1. Browser console (F12) for JavaScript errors
2. Firebase Console for authentication/database errors
3. Netlify deployment logs for build issues

---

🎉 **You're all set! Good luck with your event!**
