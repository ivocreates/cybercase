// Firebase Configuration - TechFest 2k26
const firebaseConfig = {
  apiKey: "AIzaSyBaAu6mCIhb78kC1otbazOriSKJwm1cNGQ",
  authDomain: "techfest-2k26.firebaseapp.com",
  databaseURL: "https://techfest-2k26-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "techfest-2k26",
  storageBucket: "techfest-2k26.firebasestorage.app",
  messagingSenderId: "846783241021",
  appId: "1:846783241021:web:ee57dd46cd4a096c5d4354"
};

// Gemini AI Configuration
const GEMINI_API_KEY = "AIzaSyCqFHnLKSJVQAfmVpGukTooWD_PGJSPFJA";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const realtimeDb = firebase.database();

// Configure authentication providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

// Phone authentication setup
const recaptchaVerifier = (elementId) => {
  return new firebase.auth.RecaptchaVerifier(elementId, {
    'size': 'normal',
    'callback': (response) => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
};

// Gemini AI Helper Function
async function callGeminiAI(prompt) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return null;
  }
}

// Check if game has started (for players)
async function isGameStarted() {
  try {
    const gameStateDoc = await db.collection('gameState').doc('current').get();
    if (gameStateDoc.exists) {
      return gameStateDoc.data().started || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking game state:', error);
    return false;
  }
}

// Export for use in other files
window.auth = auth;
window.db = db;
window.realtimeDb = realtimeDb;
window.googleProvider = googleProvider;
window.facebookProvider = facebookProvider;
window.recaptchaVerifier = recaptchaVerifier;
window.callGeminiAI = callGeminiAI;
window.isGameStarted = isGameStarted;
window.GEMINI_API_KEY = GEMINI_API_KEY;
