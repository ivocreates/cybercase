# Quick Setup Guide - CyberCase Hunt

## 🚀 5-Minute Setup

### 1. Firebase Setup (2 minutes)
```
1. Go to https://console.firebase.google.com/
2. Create new project: "cybercase-hunt"
3. Add Web App (</> icon)
4. Copy the config object
```

### 2. Enable Services (2 minutes)
```
Authentication:
  - Go to Authentication → Sign-in method
  - Enable "Email/Password"
  - Enable "Phone" (for Phone OTP)
  - Enable "Google" (for Google Sign-in)

Firestore:
  - Go to Firestore Database → Create database
  - Start in production mode
  - Rules will be deployed via Firebase CLI
```

### 3. Configure Project (1 minute)
```
1. Open firebase-config.js
2. Paste your Firebase config
3. Save the file
```

### 4. Create Admin (1 minute)
```
Firebase Console:
  1. Authentication → Add user
     Email: admin@spkcollege.edu
     Password: [your-password]
     Copy the UID!
  
  2. Firestore → Add collection "admins"
     Document ID: [paste UID]
     Fields:
       - email: "admin@spkcollege.edu"
       - name: "Admin"
       - role: "admin"
```

### 5. Deploy Firebase Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy Firestore rules only
firebase deploy --only firestore:rules
```

### 6. Deploy to Netlify
```bash
# Option 1: Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod

# Option 2: Git + Netlify Dashboard
1. Push code to GitHub/GitLab
2. Go to netlify.com → Add new site
3. Connect your repository
4. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: .
5. Click "Deploy site"

# Option 3: Drag & Drop
1. Go to netlify.com → Sites
2. Drag the techfest folder to deploy
```

### 7. Test Locally (Optional)
```bash
# Python
python -m http.server 8000

# VS Code Live Server
Right-click index.html → Open with Live Server
```

---

## 🎮 Quick Usage

### Admin First Steps:
1. Login at `/admin-login.html`
2. Go to "Game Control" tab
3. Click "Start Game" button
4. Go to "Set Clues" tab
5. Click "Generate AI Clues" OR set manually
6. Post welcome announcement (or use AI to generate)

### Team Registration:
- **Leader/Member**: signup-enhanced.html → Choose role
- **Authentication**: Email/Password, Phone OTP, or Google
- **Team**: Leader creates, Member joins with team name

### During Event:
- Teams find physical clue words
- Submit through dashboard
- Check leaderboard for rankings
- Admin posts hints as needed

---

## 🔥 Firestore Security Rules

**Rules are already configured in `firestore.rules` file!**

To deploy:
```bash
firebase deploy --only firestore:rules
```

The rules include:
- ✅ User data protection
- ✅ Team member/admin permissions
- ✅ Game state control (admin only)
- ✅ Public announcements (admin write only)
- ✅ Admin collection security

---

## ⚡ Troubleshooting

| Problem | Solution |
|---------|----------|
| Firebase not defined | Use web server, not file:// |
| Permission denied | Check Firestore rules |
| Admin can't login | Verify admin doc in Firestore |
| Clues not working | Admin must set clues first |

---

## 📱 Test Checklist

- [ ] Admin can login
- [ ] Admin can set clues
- [ ] Leader can create team
- [ ] Member can join team
- [ ] Team can submit clue
- [ ] Leaderboard updates
- [ ] Announcements work

---

**Need more details?** Check the full README.md

**Ready to start?** Open index.html and begin! 🎮
