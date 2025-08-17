// DOM Elements
const passwordFields = document.querySelectorAll('.password-field');
const passwordToggles = document.querySelectorAll('.password-toggle');
const passwordStrengthMeter = document.getElementById('password-strength-meter');
const passwordStrengthText = document.getElementById('password-strength-text');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const errorMessages = document.querySelectorAll('.error-message');

// Create a global authUtils object for use in other scripts
window.authUtils = {};

// Initialize based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Setup password toggles
    setupPasswordToggles();
    
    // Setup form validation and submission
    if (signupForm) {
        setupPasswordStrengthMeter();
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Check if user is already logged in
    checkAuthState();
});

// Password visibility toggle
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Password strength meter
function setupPasswordStrengthMeter() {
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.getElementById('strength-meter-fill');
    const strengthText = document.getElementById('password-strength-text');
    
    passwordInput.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        updateStrengthMeter(strength, strengthMeter, strengthText);
    });
}

// Calculate password strength (0-100)
function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length contribution (up to 40 points)
    strength += Math.min(password.length * 4, 40);
    
    // Character variety contribution
    if (/[a-z]/.test(password)) strength += 10; // lowercase
    if (/[A-Z]/.test(password)) strength += 10; // uppercase
    if (/[0-9]/.test(password)) strength += 10; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15; // special chars
    
    // Complexity bonuses
    if (password.length >= 8 && 
        /[a-z]/.test(password) && 
        /[A-Z]/.test(password) && 
        /[0-9]/.test(password)) {
        strength += 15;
    }
    
    return Math.min(strength, 100);
}

// Update strength meter UI
function updateStrengthMeter(strength, meter, text) {
    // Update meter fill
    meter.style.width = strength + '%';
    
    // Update color based on strength
    if (strength < 30) {
        meter.style.backgroundColor = '#ff6b6b'; // weak (red)
        text.textContent = 'Weak password';
    } else if (strength < 60) {
        meter.style.backgroundColor = '#ffd166'; // medium (yellow)
        text.textContent = 'Medium strength';
    } else if (strength < 80) {
        meter.style.backgroundColor = '#06d6a0'; // strong (green)
        text.textContent = 'Strong password';
    } else {
        meter.style.backgroundColor = '#118ab2'; // very strong (blue)
        text.textContent = 'Very strong password';
    }
}

// Form validation
function validateSignupForm() {
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    let isValid = true;
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Validate fullname
    if (fullname.length < 3) {
        document.getElementById('fullname-error').textContent = 'Name must be at least 3 characters';
        isValid = false;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address';
        isValid = false;
    }
    
    // Check if email already exists
    const users = getUsers();
    if (users.some(user => user.email === email)) {
        document.getElementById('email-error').textContent = 'This email is already registered';
        isValid = false;
    }
    
    // Validate password
    if (password.length < 8) {
        document.getElementById('password-error').textContent = 'Password must be at least 8 characters';
        isValid = false;
    } else if (calculatePasswordStrength(password) < 50) {
        document.getElementById('password-error').textContent = 'Please use a stronger password';
        isValid = false;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
        isValid = false;
    }
    
    return isValid;
}

function validateLoginForm() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    let isValid = true;
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Validate email
    if (!isValidEmail(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address';
        isValid = false;
    }
    
    // Validate password
    if (password.length < 1) {
        document.getElementById('password-error').textContent = 'Please enter your password';
        isValid = false;
    }
    
    return isValid;
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    if (!validateSignupForm()) return;
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Create user object
    const newUser = {
        id: generateUserId(),
        fullname,
        email,
        password: hashPassword(password), // In a real app, use proper hashing
        createdAt: new Date().toISOString()
    };
    
    // Save user
    saveUser(newUser);
    
    // Set as logged in
    setLoggedInUser(newUser);
    
    // Redirect to todo app
    window.location.href = 'index.html';
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;
    
    // Attempt login
    const success = loginUser(email, password, rememberMe);
    
    if (success) {
        // Redirect to todo app
        window.location.href = 'index.html';
    } else {
        // Show error
        document.getElementById('password-error').textContent = 'Invalid email or password';
    }
}

// User Management Functions
function getUsers() {
    const users = localStorage.getItem('todo-users');
    return users ? JSON.parse(users) : [];
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('todo-users', JSON.stringify(users));
}

function saveUsers(users) {
    localStorage.setItem('todo-users', JSON.stringify(users));
}

function generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add these functions to the global authUtils object
window.authUtils.getUsers = getUsers;
window.authUtils.saveUsers = saveUsers;
window.authUtils.generateUserId = generateUserId;

// Very simple "hash" for demo purposes only
// In a real app, use a proper hashing library with salt
function hashPassword(password) {
    // This is NOT secure - just for demonstration
    return btoa(password + 'salt123');
}

// Login user
function loginUser(email, password, rememberMe) {
    const users = getUsers();
    const hashedPassword = hashPassword(password);
    
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    
    if (user) {
        setLoggedInUser(user, rememberMe);
        return true;
    }
    
    return false;
}

// Authentication State Management
function setLoggedInUser(user, rememberMe = false) {
    // Remove sensitive data
    const safeUserData = {
        id: user.id,
        fullname: user.fullname,
        email: user.email
    };
    
    // Save to session storage (cleared when browser is closed)
    sessionStorage.setItem('todo-current-user', JSON.stringify(safeUserData));
    
    // If remember me is checked, also save to local storage
    if (rememberMe) {
        localStorage.setItem('todo-remembered-user', JSON.stringify(safeUserData));
    }
}

function getLoggedInUser() {
    // First check session storage
    const sessionUser = sessionStorage.getItem('todo-current-user');
    if (sessionUser) {
        return JSON.parse(sessionUser);
    }
    
    // Then check local storage (remember me)
    const localUser = localStorage.getItem('todo-remembered-user');
    if (localUser) {
        // Also set in session storage for consistency
        sessionStorage.setItem('todo-current-user', localUser);
        return JSON.parse(localUser);
    }
    
    return null;
}

function logoutUser() {
    sessionStorage.removeItem('todo-current-user');
    localStorage.removeItem('todo-remembered-user');
    window.location.href = 'login.html';
}

// Add authentication functions to global authUtils object
window.authUtils.setLoggedInUser = setLoggedInUser;
window.authUtils.getLoggedInUser = getLoggedInUser;
window.authUtils.logoutUser = logoutUser;
window.authUtils.checkAuthState = checkAuthState;

// Check auth state and redirect if needed
function checkAuthState() {
    const currentUser = getLoggedInUser();
    const onAuthPage = window.location.pathname.includes('login.html') || 
                       window.location.pathname.includes('signup.html') ||
                       window.location.pathname.includes('forgot-password.html');
    
    if (currentUser && onAuthPage) {
        // User is logged in but on auth page, redirect to app
        window.location.href = 'index.html';
    } else if (!currentUser && !onAuthPage) {
        // User is not logged in and not on auth page, redirect to login
        window.location.href = 'login.html';
    }
}

// Handle forgot password form submission
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const resetSuccessDiv = document.getElementById('reset-success');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Validate email
    if (!isValidEmail(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email address';
        return;
    }
    
    // Check if email exists in our system
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        document.getElementById('email-error').textContent = 'No account found with this email address';
        return;
    }
    
    // Generate a reset token and expiration time (24 hours from now)
    const resetToken = generateResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 24);
    
    // Update user with reset token
    user.resetToken = resetToken;
    user.resetExpires = resetExpires.toISOString();
    
    // Save updated user data
    saveUsers(users);
    
    // In a real app, send an email with the reset link
    // For this demo, we'll just show a success message
    
    // Hide the form and show success message
    forgotPasswordForm.style.display = 'none';
    resetSuccessDiv.style.display = 'block';
    
    // Set up the demo reset link
    const demoResetLink = document.getElementById('demo-reset-link');
    if (demoResetLink) {
        demoResetLink.href = `reset-password.html?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`;
    }
}

// Generate a random reset token
function generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Verify reset token
function verifyResetToken(email, token) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.resetToken === token);
    
    if (!user) return false;
    
    // Check if token is expired
    const now = new Date();
    const expires = new Date(user.resetExpires);
    
    if (now > expires) return false;
    
    return true;
}

// Reset password with token
function resetPassword(email, token, newPassword) {
    if (!verifyResetToken(email, token)) return false;
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.resetToken === token);
    
    // Update password and remove reset token
    user.password = hashPassword(newPassword);
    delete user.resetToken;
    delete user.resetExpires;
    
    // Save updated user data
    saveUsers(users);
    
    return true;
}

// Export functions for use in main app
window.authUtils = {
    getLoggedInUser,
    logoutUser,
    verifyResetToken,
    resetPassword
};