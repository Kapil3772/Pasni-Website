// Authentication System
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('pasni_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('pasni_current_user')) || null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('pasni_current_user', JSON.stringify(user));
            this.showMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'profile.html';
                window.location.href = redirectUrl;
            }, 1500);
        } else {
            this.showMessage('Invalid email or password', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showMessage('Email already registered', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            phone,
            password,
            cart: [],
            orders: [],
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('pasni_users', JSON.stringify(this.users));
        
        this.showMessage('Account created successfully! Please login.', 'success');
        
        setTimeout(() => {
            switchTab('login');
        }, 1500);
    }

    showMessage(message, type) {
        const errorEl = document.getElementById('errorMessage');
        const successEl = document.getElementById('successMessage');
        
        // Hide both messages first
        errorEl.style.display = 'none';
        successEl.style.display = 'none';
        
        if (type === 'error') {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        } else {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('pasni_current_user');
        window.location.href = 'index.html';
    }
}

// Tab switching function
function switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    // Clear any messages
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

// Initialize authentication system
const authSystem = new AuthSystem();

// Make authSystem globally available
window.authSystem = authSystem;
