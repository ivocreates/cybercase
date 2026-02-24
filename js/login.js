// Login Page Logic

// Get role from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const role = urlParams.get('role') || 'member';

// Update role display
document.getElementById('role-display').textContent = role === 'leader' ? 'Team Leader' : 'Team Member';

// Update signup link
const signupLink = document.getElementById('signup-link');
signupLink.href = `signup-enhanced.html?role=${role}`;

// Login form handler - login allowed before game starts
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // Sign in user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Verify user role matches the selected role
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            await auth.signOut();
            showError('User profile not found. Please contact support.');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            return;
        }

        const userData = userDoc.data();
        
        if (userData.role !== role) {
            await auth.signOut();
            showError(`You registered as a ${userData.role}. Please use the correct login page.`);
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            return;
        }

        // Successful login - redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        console.error('Error during login:', error);
        let errorMessage = 'An error occurred during login. Please try again.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email. Please sign up first.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        }
        
        showError(errorMessage);
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
}

// Check if user is already logged in
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Check if user profile exists and matches role
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.role === role) {
                // Already logged in with correct role, redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        }
    }
});
