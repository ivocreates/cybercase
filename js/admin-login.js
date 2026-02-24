// Admin Login Logic

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // Sign in user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Check if user is admin
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        
        if (!adminDoc.exists) {
            // Not an admin, sign out
            await auth.signOut();
            showError('Access denied. You are not authorized as an admin.');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            return;
        }

        // Valid admin, redirect to admin panel
        window.location.href = 'admin-panel.html';

    } catch (error) {
        console.error('Error during admin login:', error);
        let errorMessage = 'Invalid credentials. Please try again.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Admin account not found.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
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

// Check if already logged in as admin
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        if (adminDoc.exists) {
            // Already logged in as admin
            window.location.href = 'admin-panel.html';
        }
    }
});
