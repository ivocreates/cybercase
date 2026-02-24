# CyberCase: The Curious Hunt 🔍
### SPK College TechFest Event

A real-time multiplayer treasure hunt web application with Firebase backend. Teams solve clues hidden in physical locations and compete on a live leaderboard.

**🔗 GitHub Repository:** https://github.com/ivocreates/cybercase

---

## 📋 Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Firebase Setup](#firebase-setup)
- [Installation](#installation)
- [Creating an Admin Account](#creating-an-admin-account)
- [How to Use](#how-to-use)
- [Game Flow](#game-flow)
- [Troubleshooting](#troubleshooting)
- [Technical Details](#technical-details)

---

## ✨ Features

### For Participants
- **Multi-Method Authentication**: Email/Password, Phone OTP, or Google Sign-in
- **Team Creation & Joining**: Leaders create teams, members join existing teams
- **Browse Teams**: View all registered teams with search/filter functionality
- **Game State Control**: Access blocked until admin starts the game
- **Real-time Clue Submission**: Submit discovered clues and get instant feedback
- **Live Leaderboard**: View real-time rankings based on score and time
- **Announcements & Hints**: Receive updates and hints from organizers

### For Administrators
- **Game Control**: Start, pause, and end game from admin panel
- **AI Assistant**: Generate clues, hints, and announcements with Gemini AI
- **Team Management**: View all teams, members, and their progress
- **Clue Assignment**: Set unique 6-word clues for each team (manual or AI-generated)
- **Announcements**: Post hints, updates, warnings, and winner declarations
- **Real-time Monitoring**: Track team submissions and scores live

### Technical Features
- Real-time updates using Firebase Firestore
- Multi-provider authentication (Email, Phone, Google)
- Responsive design for mobile and desktop
- Secure authentication with Firebase Auth
- AI-powered content generation with Google Gemini
- Score calculation based on time and clue order
- Game state management (not started/started/paused/ended)
- Cyberpunk-themed UI with neon effects

---

## 📁 Project Structure

```
techfest/
│
├── index.html                  # Landing page
├── signup-enhanced.html        # Multi-method signup (Email/Phone/Google)
├── login.html                  # Login page with game state check
├── teams.html                  # Browse all teams with search
├── dashboard.html              # Team dashboard
├── leaderboard.html            # Public leaderboard
├── announcements.html          # Announcements page
├── admin-login.html            # Admin login
├── admin-panel.html            # Admin control panel
│
├── firebase-config.js          # Firebase & Gemini AI configuration
├── firestore.rules             # Firestore security rules
├── firebase.json               # Firebase project configuration
├── .firebaserc                 # Firebase project reference
│
├── netlify.toml                # Netlify deployment config
├── _redirects                  # Netlify redirect rules
├── .gitignore                  # Git ignore file
│
├── styles/
│   ├── main.css               # Global styles
│   ├── auth.css               # Authentication pages styles
│   ├── dashboard.css          # Dashboard styles
│   ├── leaderboard.css        # Leaderboard styles
│   ├── announcements.css      # Announcements styles
│   └── admin.css              # Admin panel styles
│
└── js/
    ├── signup-enhanced.js     # Enhanced multi-auth signup
    ├── login.js               # Login logic with game state
    ├── teams.js               # Teams browsing and search
    ├── dashboard.js           # Dashboard functionality
    ├── leaderboard.js         # Leaderboard display
    ├── announcements.js       # Announcements display
    ├── admin-login.js         # Admin authentication
    └── admin-panel.js         # Admin panel with AI features
```

---

## 🔧 Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Firebase account (free tier is sufficient)
- Basic understanding of web hosting (optional)

---

## 🔥 Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter project name: `cybercase-hunt` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click **"Create Project"**

### Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon (</>)** to add a web app
2. Enter app nickname: `CyberCase Web App`
3. **Do NOT check** "Set up Firebase Hosting" (unless you plan to host on Firebase)
4. Click **"Register app"**
5. Copy the Firebase configuration object - you'll need these values

### Step 3: Enable Authentication

1. In the Firebase Console, go to **Build → Authentication**
2. Click **"Get Started"**
3. Go to the **"Sign-in method"** tab
4. Enable the following providers:
   - **Email/Password**: Click → Enable first toggle → Save
   - **Phone**: Click → Enable → Save
   - **Google**: Click → Enable → Add support email → Save

### Step 4: Create Firestore Database

1. In the Firebase Console, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll set rules next)
4. Choose a location (select closest to your region)
5. Click **"Enable"**

### Step 5: Deploy Firestore Security Rules

1. The project includes a `firestore.rules` file with security rules
2. Install Firebase CLI and deploy:

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

3. Verify in Firebase Console → Firestore Database → Rules tab

---

## 💻 Installation

### Step 1: Download the Project Files

Extract all files to a folder on your computer, maintaining the directory structure shown above.

### Step 2: Configure Firebase

1. Open `firebase-config.js` in a text editor
2. Replace the placeholder values with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

3. Save the file

**Where to find these values:**
- Go to Firebase Console → Project Settings (gear icon)
- Scroll down to "Your apps" section
- You'll see your web app with the config object

### Step 3: Deploy Application

You have several options:

#### Option A: Netlify (Recommended - Easiest)

**Method 1: Drag & Drop**
1. Go to [netlify.com](https://www.netlify.com/)
2. Sign up/Login
3. Drag the entire `techfest` folder to "Sites"
4. Your site will be live in seconds!

**Method 2: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to project folder
cd path/to/techfest

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Method 3: Git Integration**
1. Push code to GitHub/GitLab/Bitbucket
2. Go to Netlify → "Add new site" → "Import from Git"
3. Connect repository
4. Build settings:
   - Build command: (leave empty)
   - Publish directory: `.`
5. Click "Deploy site"

#### Option B: Simple Local Server (Development)

```bash
# Navigate to the project folder
cd path/to/techfest

# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

#### Option C: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

---

## 👨‍💼 Creating an Admin Account

**IMPORTANT:** Admin accounts must be created manually in Firebase Console for security.

### Step 1: Create Admin User in Authentication

1. Go to Firebase Console → **Authentication → Users**
2. Click **"Add user"**
3. Enter admin email: `admin@spkcollege.edu` (or your preferred email)
4. Enter a strong password
5. Click **"Add user"**
6. **Copy the User UID** (you'll need this in next step)

### Step 2: Add Admin to Firestore

1. Go to Firebase Console → **Firestore Database**
2. Click **"+ Start collection"**
3. Collection ID: `admins`
4. Click **"Next"**
5. Document ID: Paste the User UID you copied
6. Add fields:
   - Field: `email` | Type: string | Value: `admin@spkcollege.edu`
   - Field: `name` | Type: string | Value: `Admin`
   - Field: `role` | Type: string | Value: `admin`
   - Field: `createdAt` | Type: timestamp | Value: (current date/time)
7. Click **"Save"**

Now you can login to the admin panel using these credentials!

---

## 🎮 How to Use

### For Organizers (Before the Event)

1. **Setup Firebase** (follow Firebase Setup section)
2. **Deploy the application** (follow Installation section)
3. **Create admin account** (follow Creating an Admin Account section)
4. **Login to Admin Panel**: Go to `admin-login.html`
5. **Set Clues for Teams**:
   - Go to "Set Clues" tab
   - Either manually set 6 unique words for each team
   - OR click "Generate Random Clues" for automatic setup
6. **Post Initial Announcement**: Welcome message and game rules

### For Team Leaders & Members

1. **Go to Signup**: Navigate to the website → Choose your role (Leader or Member)
2. **Choose Authentication Method**:
   - **Email/Password**: Traditional signup
   - **Phone**: Enter phone → Verify OTP
   - **Google**: One-click Google Sign-in
3. **Fill Details**:
   - Name, email (if not using Google), phone
   - Team name (Leader creates, Member joins existing)
   - Password (if using Email method)
4. **Login**: Use your credentials to access dashboard

### During the Event

1. **Teams search for clues** in physical locations around campus
2. **Submit words** through the dashboard
3. **Check leaderboard** to see rankings
4. **Watch announcements** for hints from organizers
5. **Admin monitors** progress and can post hints

### Scoring System

- ✅ **Base Score**: 100 points per correct clue
- 🎯 **Order Bonus**: Earlier clues worth more (Clue 1 = +60, Clue 6 = +10)
- ⚡ **Speed Bonus**: Faster teams get more points (50-0 points)
- 🏁 **Total Score**: Base + Order + Speed

Teams are ranked by:
1. Total Score (higher is better)
2. Clues Found (more is better)
3. Time Created (earlier registration breaks ties)

---

## 🎯 Game Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Before Event                         │
├─────────────────────────────────────────────────────────┤
│ 1. Admin logs in and goes to Game Control              │
│ 2. Admin clicks "Start Game" (players blocked before)  │
│ 3. Admin uses AI to generate clues for teams            │
│ 4. Teams can now signup (choose Email/Phone/Google)    │
│ 5. Leaders create teams, members join                   │
│ 6. Admin posts welcome announcement (AI-assisted)      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                   During Event                          │
├─────────────────────────────────────────────────────────┤
│ 1. Teams search physical locations for clue words      │
│ 2. Teams submit words through dashboard                │
│ 3. System validates and updates scores in real-time    │
│ 4. Leaderboard updates automatically                   │
│ 5. Admin can pause game if needed                      │
│ 6. Admin posts hints (AI can generate)                 │
│ 7. Admin uses AI assistant to analyze performance      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    After Event                          │
├─────────────────────────────────────────────────────────┤
│ 1. Admin clicks "End Game" in admin panel              │
│ 2. Winner announcement posted automatically (AI can    │
│    generate congratulations message)                    │
│ 3. Final leaderboard visible to all                    │
│ 4. Teams redirected to final results                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Common Issues

**1. "Firebase is not defined" error**
- Make sure you're accessing the site through a web server (not file://)
- Check that Firebase CDN scripts are loading (check browser console)

**2. Login fails with "user not found"**
- Verify email is correct
- Check that user was created in Firebase Authentication

**3. Clue submission doesn't work**
- Check admin has set clues for your team
- Verify Firestore rules are correctly set
- Check browser console for errors

**4. "Permission denied" errors**
- Verify Firestore security rules are correctly configured
- Ensure user is logged in
- Check that admin document exists in Firestore

**5. Leaderboard not updating**
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check Firebase Firestore console for data
- Verify internet connection

**6. Admin can't login**
- Verify admin document exists in `admins` collection
- Document ID must match the User UID from Authentication
- Check email and password are correct

---

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Authentication)
- **AI**: Google Gemini Pro API
- **Deployment**: Netlify
- **Authentication**: Email/Password, Phone OTP (reCAPTCHA), Google OAuth
- **Fonts**: Google Fonts (Orbitron, Roboto)
- **Design**: Custom CSS with cyberpunk/crime theme

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Firebase Collections Structure

#### `users` Collection
```javascript
{
  uid: "user-unique-id",
  name: "User Name",
  email: "user@example.com",
  phone: "1234567890",
  role: "leader" | "member",
  teamId: "team-doc-id",
  teamName: "Team Name",
  createdAt: Timestamp
}
```

#### `teams` Collection
```javascript
{
  teamName: "Team Name",
  leaderId: "user-uid",
  leaderName: "Leader Name",
  leaderEmail: "leader@example.com",
  leaderPhone: "1234567890",
  members: [
    {
      uid: "user-uid",
      name: "Name",
      email: "email",
      phone: "phone",
      role: "leader" | "member"
    }
  ],
  assignedClues: {
    clue1: "word1",
    clue2: "word2",
    // ... up to clue6
  },
  clues: {
    clue1: { word: "", found: false, timestamp: null, foundBy: "", userInput: "" },
    // ... up to clue6
  },
  submissions: [
    {
      clueNumber: 1,
      word: "submitted-word",
      correct: true,
      timestamp: Timestamp,
      submittedBy: "user-uid",
      submittedByName: "Name"
    }
  ],
  cluesFound: 3,
  score: 450,
  status: "active",
  createdAt: Timestamp
}
```

#### `gameState` Collection
```javascript
{
  started: false,
  paused: false,
  ended: false,
  startedAt: Timestamp | null,
  pausedAt: Timestamp | null,
  endedAt: Timestamp | null,
  startedBy: "admin-uid"
}
```

#### `announcements` Collection
```javascript
{
  type: "hint" | "update" | "warning" | "winner",
  title: "Announcement Title",
  message: "Announcement message text",
  timestamp: Timestamp,
  postedBy: "admin-uid",
  postedByEmail: "admin@example.com"
}
```

#### `admins` Collection
```javascript
{
  email: "admin@example.com",
  name: "Admin Name",
  role: "admin",
  createdAt: Timestamp
}
```

---

## 📝 Customization Tips

### Changing Colors
Edit `styles/main.css` and modify the CSS variables:
```css
:root {
  --primary-color: #00ff88;  /* Main theme color */
  --secondary-color: #ff00aa;
  --accent-color: #00d4ff;
  /* ... */
}
```

### Changing Number of Clues
To change from 6 clues to a different number:
1. Update `dashboard.js` - change loop from 6 to your number
2. Update `admin-panel.js` - change clue input generation
3. Update team creation in `auth-leader.js`

### Adding More Announcement Types
1. Edit `admin-panel.html` - add option to dropdown
2. Update `styles/announcements.css` - add styling for new type
3. Update `announcements.js` - add icon mapping

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Firebase Console for errors
3. Check browser console (F12) for JavaScript errors
4. Verify Firebase rules and configuration

---

## 📄 License

This project is created for SPK College TechFest 2026. Feel free to modify and use for your events!

---

## 🎉 Credits

**Developed for**: SPK College TechFest 2026
**Event**: CyberCase: The Curious Hunt
**Theme**: Cyber Crime Investigation

---

## 🚀 Quick Start Checklist

- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password, Phone, Google)
- [ ] Create Firestore database
- [ ] Deploy Firestore security rules (`firebase deploy --only firestore:rules`)
- [ ] Update `firebase-config.js` with your credentials
- [ ] Add Gemini AI API key to `firebase-config.js`
- [ ] Create admin account in Firebase Auth
- [ ] Add admin document in Firestore `admins` collection
- [ ] Deploy to Netlify (drag & drop or CLI)
- [ ] Add Netlify domain to Firebase authorized domains
- [ ] Test admin login
- [ ] Admin: Start game from Game Control tab
- [ ] Admin: Generate AI clues for teams
- [ ] Test team registration (all auth methods)
- [ ] Test team clue submission
- [ ] Share the website URL with participants
- [ ] Start the event! 🎮

---

**Good luck with your event! May the best team win! 🏆**
