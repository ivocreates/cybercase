// Enhanced Signup with Email/Password, Phone, and Google Auth
// Signup and team creation allowed before game starts
let confirmationResult = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupRoleChangeListener();
    prefillFromURL();
});

// Pre-fill form from URL parameters
function prefillFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    const team = urlParams.get('team');
    
    // Set role if provided
    if (role) {
        const roleSelect = document.getElementById('role-select');
        const phoneRoleSelect = document.getElementById('phone-role-select');
        if (roleSelect) roleSelect.value = role;
        if (phoneRoleSelect) phoneRoleSelect.value = role;
        
        // Trigger change event to show/hide team name field
        if (roleSelect) roleSelect.dispatchEvent(new Event('change'));
    }
    
    // Pre-fill team name if provided
    if (team) {
        const teamNameInput = document.getElementById('team-name-input');
        const phoneTeamName = document.getElementById('phone-team-name');
        if (teamNameInput) teamNameInput.value = decodeURIComponent(team);
        if (phoneTeamName) phoneTeamName.value = decodeURIComponent(team);
    }
}

// Role change listener
function setupRoleChangeListener() {
    document.getElementById('role-select').addEventListener('change', (e) => {
        const teamNameGroup = document.getElementById('team-name-group');
        if (e.target.value === 'leader') {
            teamNameGroup.style.display = 'block';
            document.getElementById('team-name-input').required = true;
        } else {
            teamNameGroup.style.display = 'block';
            document.getElementById('team-name-input').required = true;
            document.getElementById('team-name-input').placeholder = 'Enter team name to join';
        }
    });

    document.getElementById('phone-role-select').addEventListener('change', (e) => {
        const phoneTeamNameGroup = document.getElementById('phone-team-name-group');
        phoneTeamNameGroup.style.display = 'block';
        document.getElementById('phone-team-name').required = true;
    });
}

// Toggle phone auth form
function togglePhoneAuth() {
    const emailForm = document.getElementById('email-signup-form');
    const phoneForm = document.getElementById('phone-signup-form');
    const authMethods = document.querySelector('.auth-methods');
    const divider = document.querySelector('.divider');
    
    if (phoneForm.classList.contains('hide')) {
        emailForm.classList.add('hide');
        authMethods.classList.add('hide');
        divider.classList.add('hide');
        phoneForm.classList.remove('hide');
        
        // Initialize reCAPTCHA
        if (!window.recaptchaWidgetId) {
            window.appVerifier = recaptchaVerifier('recaptcha-container');
        }
    } else {
        phoneForm.classList.add('hide');
        emailForm.classList.remove('hide');
        authMethods.classList.remove('hide');
        divider.classList.remove('hide');
    }
}

// Email/Password Signup
document.getElementById('email-signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('role-select').value;
    const teamName = document.getElementById('team-name-input').value.trim();

    if (!teamName) {
        showError('Please enter a team name');
        return;
    }

    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        if (role === 'leader') {
            await createTeamLeader(email, password, name, teamName);
        } else {
            await joinTeamAsMember(email, password, name, teamName);
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// Phone Auth - Send OTP
document.getElementById('phone-signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phoneNumber = '+91' + document.getElementById('phone-number').value.trim();
    const name = document.getElementById('phone-name').value.trim();
    const role = document.getElementById('phone-role-select').value;
    const teamName = document.getElementById('phone-team-name').value.trim();

    if (!teamName) {
        showPhoneError('Please enter a team name');
        return;
    }

    try {
        const submitBtn = document.getElementById('send-otp-btn');
        submitBtn.disabled = true;

        confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, window.appVerifier);
        
        document.getElementById('otp-section').classList.remove('hide');
        submitBtn.classList.add('hide');
        showPhoneError('OTP sent! Check your phone.', 'success');
        
        // Store data for after OTP verification
        window.pendingPhoneAuth = { name, role, teamName, phoneNumber };
    } catch (error) {
        console.error('Phone auth error:', error);
        showPhoneError(error.message);
        document.getElementById('send-otp-btn').disabled = false;
    }
});

// Verify OTP
async function verifyOTP() {
    const otp = document.getElementById('otp-code').value.trim();
    
    if (!otp || otp.length !== 6) {
        showPhoneError('Please enter a valid 6-digit OTP');
        return;
    }

    try {
        const result = await confirmationResult.confirm(otp);
        const user = result.user;
        
        const { name, role, teamName, phoneNumber } = window.pendingPhoneAuth;
        
        if (role === 'leader') {
            await createTeamLeaderWithPhone(user, name, teamName, phoneNumber);
        } else {
            await joinTeamAsMemberWithPhone(user, name, teamName, phoneNumber);
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        showPhoneError('Invalid OTP. Please try again.');
    }
}

// Google Sign In
async function signUpWithGoogle() {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        // Prompt for role and team name
        const role = prompt('Are you a Team Leader or Member? (Type: leader or member)');
        if (!role || (role !== 'leader' && role !== 'member')) {
            await auth.signOut();
            showError('Invalid role selected');
            return;
        }
        
        const teamName = prompt('Enter team name:');
        if (!teamName) {
            await auth.signOut();
            showError('Team name is required');
            return;
        }

        if (role === 'leader') {
            await createTeamLeaderWithGoogle(user, teamName);
        } else {
            await joinTeamAsMemberWithGoogle(user, teamName);
        }
    } catch (error) {
        console.error('Google auth error:', error);
        showError(error.message);
    }
}

// Helper: Create Team Leader
async function createTeamLeader(email, password, name, teamName) {
    const teamQuery = await db.collection('teams').where('teamName', '==', teamName).get();
    if (!teamQuery.empty) {
        throw new Error('Team name already exists');
    }

    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await createTeamAndProfile(user, name, teamName, 'leader', email);
    window.location.href = 'dashboard.html';
}

// Helper: Join Team as Member
async function joinTeamAsMember(email, password, name, teamName) {
    const teamQuery = await db.collection('teams').where('teamName', '==', teamName).get();
    if (teamQuery.empty) {
        throw new Error('Team not found');
    }

    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await joinExistingTeam(user, name, teamName, 'member', email, teamQuery.docs[0].id);
    window.location.href = 'dashboard.html';
}

// Helper: Create team and user profile
async function createTeamAndProfile(user, name, teamName, role, email, phone = '') {
    const teamData = {
        teamName: teamName,
        leaderId: user.uid,
        leaderName: name,
        leaderEmail: email || user.email,
        leaderPhone: phone || user.phoneNumber || '',
        members: [{
            uid: user.uid,
            name: name,
            email: email || user.email,
            phone: phone || user.phoneNumber || '',
            role: 'leader'
        }],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        cluesFound: 0,
        clues: {
            clue1: { word: '', found: false, timestamp: null },
            clue2: { word: '', found: false, timestamp: null },
            clue3: { word: '', found: false, timestamp: null },
            clue4: { word: '', found: false, timestamp: null },
            clue5: { word: '', found: false, timestamp: null },
            clue6: { word: '', found: false, timestamp: null }
        },
        submissions: [],
        score: 0,
        status: 'active'
    };

    const teamDoc = await db.collection('teams').add(teamData);

    await db.collection('users').doc(user.uid).set({
        name: name,
        email: email || user.email,
        phone: phone || user.phoneNumber || '',
        role: 'leader',
        teamId: teamDoc.id,
        teamName: teamName,
        authProvider: user.email ? 'email' : user.phoneNumber ? 'phone' : 'google',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await user.updateProfile({ displayName: name });
}

// Helper: Join existing team
async function joinExistingTeam(user, name, teamName, role, email, teamId, phone = '') {
    const newMember = {
        uid: user.uid,
        name: name,
        email: email || user.email,
        phone: phone || user.phoneNumber || '',
        role: 'member',
        joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('teams').doc(teamId).update({
        members: firebase.firestore.FieldValue.arrayUnion(newMember)
    });

    await db.collection('users').doc(user.uid).set({
        name: name,
        email: email || user.email,
        phone: phone || user.phoneNumber || '',
        role: 'member',
        teamId: teamId,
        teamName: teamName,
        authProvider: user.email ? 'email' : user.phoneNumber ? 'phone' : 'google',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await user.updateProfile({ displayName: name });
}

// Phone auth helpers
async function createTeamLeaderWithPhone(user, name, teamName, phone) {
    await createTeamAndProfile(user, name, teamName, 'leader', '', phone);
    window.location.href = 'dashboard.html';
}

async function joinTeamAsMemberWithPhone(user, name, teamName, phone) {
    const teamQuery = await db.collection('teams').where('teamName', '==', teamName).get();
    if (teamQuery.empty) {
        throw new Error('Team not found');
    }
    await joinExistingTeam(user, name, teamName, 'member', '', teamQuery.docs[0].id, phone);
    window.location.href = 'dashboard.html';
}

// Google auth helpers
async function createTeamLeaderWithGoogle(user, teamName) {
    await createTeamAndProfile(user, user.displayName, teamName, 'leader', user.email);
    window.location.href = 'dashboard.html';
}

async function joinTeamAsMemberWithGoogle(user, teamName) {
    const teamQuery = await db.collection('teams').where('teamName', '==', teamName).get();
    if (teamQuery.empty) {
        throw new Error('Team not found');
    }
    await joinExistingTeam(user, user.displayName, teamName, 'member', user.email, teamQuery.docs[0].id);
    window.location.href = 'dashboard.html';
}

// Error handling
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    setTimeout(() => errorElement.classList.remove('show'), 5000);
}

function showPhoneError(message, type = 'error') {
    const errorElement = document.getElementById('phone-error-message');
    errorElement.textContent = message;
    errorElement.className = type === 'success' ? 'success-message show' : 'error-message show';
    setTimeout(() => errorElement.className = 'error-message', 5000);
}
