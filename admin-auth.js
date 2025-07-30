// Admin Authentication System
class AdminAuth {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default admin if none exists
        this.initializeDefaultAdmin();
        
        // Bind form events
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    initializeDefaultAdmin() {
        const admins = this.getAdmins();
        if (admins.length === 0) {
            // Create default admin
            const defaultAdmin = {
                id: 'admin_' + Date.now(),
                name: 'Super Admin',
                email: 'admin@pasni.com',
                password: 'admin123', // In real app, this should be hashed
                role: 'super_admin',
                createdAt: new Date().toISOString()
            };
            
            this.saveAdmin(defaultAdmin);
            console.log('Default admin created: admin@pasni.com / admin123');
        }
    }

    getAdmins() {
        return JSON.parse(localStorage.getItem('pasni_admins')) || [];
    }

    saveAdmin(admin) {
        const admins = this.getAdmins();
        admins.push(admin);
        localStorage.setItem('pasni_admins', JSON.stringify(admins));
    }

    validateAdmin(email, password) {
        const admins = this.getAdmins();
        return admins.find(admin => admin.email === email && admin.password === password);
    }

    handleLogin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const messageDiv = document.getElementById('authMessage');

        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        const admin = this.validateAdmin(email, password);
        
        if (admin) {
            // Store admin session
            sessionStorage.setItem('pasni_admin_session', JSON.stringify({
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                loginTime: new Date().toISOString()
            }));

            this.showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
        } else {
            this.showMessage('Invalid email or password', 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('authMessage');
        messageDiv.textContent = message;
        messageDiv.className = `auth-message ${type}`;
        messageDiv.style.display = 'block';

        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    static checkAdminSession() {
        const session = sessionStorage.getItem('pasni_admin_session');
        if (!session) {
            window.location.href = 'admin-login.html';
            return null;
        }
        return JSON.parse(session);
    }

    static logout() {
        sessionStorage.removeItem('pasni_admin_session');
        window.location.href = 'admin-login.html';
    }
}

// Initialize admin auth
const adminAuth = new AdminAuth();
