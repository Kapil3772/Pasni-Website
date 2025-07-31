// Enhanced Admin Dashboard with Multi-User Support
class AdminDashboard {
    constructor() {
        this.products = [];
        this.orders = [];
        this.admins = [];
        this.currentAdmin = null;
        this.nextProductId = 1;
        this.nextAdminId = 1;
        
        this.init();
    }

    init() {
        this.loadCurrentAdmin();
        this.loadProducts();
        this.loadOrders();
        this.loadAdmins();
        this.bindEvents();
        this.initTabs();
        this.updateUI();
        this.showStatus('Admin dashboard loaded successfully!', 'success');
    }

    // Authentication & User Management
    loadCurrentAdmin() {
        const savedAdmin = localStorage.getItem('currentAdmin');
        if (savedAdmin) {
            this.currentAdmin = JSON.parse(savedAdmin);
        } else {
            // Default super admin
            this.currentAdmin = {
                id: 0,
                name: 'Super Admin',
                email: 'admin@pasni.com',
                role: 'super',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('currentAdmin', JSON.stringify(this.currentAdmin));
        }
        
        this.updateAdminDisplay();
    }

    updateAdminDisplay() {
        document.getElementById('currentAdminName').textContent = this.currentAdmin.name;
        const roleElement = document.getElementById('currentAdminRole');
        roleElement.textContent = this.getRoleDisplayName(this.currentAdmin.role);
        roleElement.className = `role-${this.currentAdmin.role}`;
        
        // Show/hide add admin button based on permissions
        const addAdminBtn = document.getElementById('addAdminBtn');
        if (this.currentAdmin.role !== 'super' && this.currentAdmin.role !== 'admin') {
            addAdminBtn.style.display = 'none';
        }
    }

    getRoleDisplayName(role) {
        const roles = {
            'super': 'Super Admin',
            'admin': 'Admin',
            'manager': 'Manager'
        };
        return roles[role] || role;
    }

    // Data Management
    loadProducts() {
        try {
            const stored = localStorage.getItem('adminProducts');
            this.products = stored ? JSON.parse(stored) : [];
            this.nextProductId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
            this.renderProducts();
        } catch (error) {
            this.showStatus('Error loading products: ' + error.message, 'error');
            this.products = [];
        }
    }

    saveProducts() {
        try {
            localStorage.setItem('adminProducts', JSON.stringify(this.products));
            // Sync with main site
            localStorage.setItem('simpleAdminProducts', JSON.stringify(this.products));
            localStorage.setItem('pasni_products', JSON.stringify(this.products));
            return true;
        } catch (error) {
            this.showStatus('Error saving products: ' + error.message, 'error');
            return false;
        }
    }

    loadOrders() {
        try {
            const stored = localStorage.getItem('adminOrders');
            this.orders = stored ? JSON.parse(stored) : [];
        } catch (error) {
            this.showStatus('Error loading orders: ' + error.message, 'error');
            this.orders = [];
        }
    }

    loadAdmins() {
        try {
            const stored = localStorage.getItem('adminUsers');
            this.admins = stored ? JSON.parse(stored) : [];
            
            // Add super admin if not exists
            if (!this.admins.find(admin => admin.role === 'super')) {
                this.admins.unshift({
                    id: 0,
                    name: 'Super Admin',
                    email: 'admin@pasni.com',
                    role: 'super',
                    createdAt: new Date().toISOString()
                });
            }
            
            this.nextAdminId = this.admins.length > 0 ? Math.max(...this.admins.map(a => a.id)) + 1 : 1;
            this.renderAdmins();
        } catch (error) {
            this.showStatus('Error loading admins: ' + error.message, 'error');
            this.admins = [];
        }
    }

    saveAdmins() {
        try {
            localStorage.setItem('adminUsers', JSON.stringify(this.admins));
            return true;
        } catch (error) {
            this.showStatus('Error saving admins: ' + error.message, 'error');
            return false;
        }
    }

    // UI Management
    showStatus(message, type = 'success') {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.innerHTML = `
            <div class="status-message status-${type}">
                <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    updateUI() {
        this.renderProducts();
        this.renderAdmins();
    }

    // Tab Management
    initTabs() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.dataset.tab;
                
                // Update nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Update content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                
                const targetContent = document.getElementById(`${tabId}-content`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';
                }
            });
        });
    }

    // Product Management
    renderProducts() {
        const container = document.getElementById('productsGrid');
        
        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">📦</div>
                    <h3>No Products Found</h3>
                    <p>Start by adding your first product or importing sample data.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='assets/placeholder.png'">
                <div class="product-title">${product.name}</div>
                <div class="product-price">₹${product.price.toLocaleString()}</div>
                <div class="product-category">${product.category}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="adminDashboard.editProduct(${product.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteProduct(${product.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    addProduct(productData) {
        const newProduct = {
            ...productData,
            id: this.nextProductId++,
            createdAt: new Date().toISOString(),
            createdBy: this.currentAdmin.id
        };
        
        this.products.push(newProduct);
        
        if (this.saveProducts()) {
            this.renderProducts();
            this.showStatus(`Product "${newProduct.name}" added successfully!`, 'success');
            return true;
        }
        return false;
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) {
            this.showStatus(`Product with ID ${id} not found!`, 'error');
            return;
        }

        // Populate form
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productDescription').value = product.description;

        // Show modal
        document.getElementById('productModal').style.display = 'flex';
        this.showStatus(`Editing: ${product.name}`, 'success');
    }

    updateProduct(id, productData) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            this.showStatus(`Product with ID ${id} not found!`, 'error');
            return false;
        }

        this.products[index] = {
            ...this.products[index],
            ...productData,
            updatedAt: new Date().toISOString(),
            updatedBy: this.currentAdmin.id
        };

        if (this.saveProducts()) {
            this.renderProducts();
            this.showStatus(`Product "${productData.name}" updated successfully!`, 'success');
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) {
            this.showStatus(`Product with ID ${id} not found!`, 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
            this.products = this.products.filter(p => p.id !== id);
            
            if (this.saveProducts()) {
                this.renderProducts();
                this.showStatus(`Product "${product.name}" deleted successfully!`, 'success');
            }
        }
    }

    // Admin Management
    renderAdmins() {
        const container = document.getElementById('adminsList');
        
        if (this.admins.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>No Admins Found</h3>
                    <p>Add your first admin user to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.admins.map(admin => `
            <div class="admin-card">
                <div class="admin-info">
                    <h3>${admin.name}</h3>
                    <div class="admin-email">${admin.email}</div>
                    <div class="admin-role role-${admin.role}">${this.getRoleDisplayName(admin.role)}</div>
                </div>
                <div class="admin-actions" style="margin-left: auto;">
                    ${admin.role !== 'super' ? `
                        <button class="btn btn-primary" onclick="adminDashboard.editAdmin(${admin.id})" style="margin-right: 0.5rem;">
                            ✏️ Edit
                        </button>
                        <button class="btn btn-danger" onclick="adminDashboard.deleteAdmin(${admin.id})">
                            🗑️ Delete
                        </button>
                    ` : '<span style="color: var(--gray-500); font-size: 0.875rem;">System Administrator</span>'}
                </div>
            </div>
        `).join('');
    }

    addAdmin(adminData) {
        // Check if email already exists
        if (this.admins.find(admin => admin.email === adminData.email)) {
            this.showStatus('An admin with this email already exists!', 'error');
            return false;
        }

        const newAdmin = {
            ...adminData,
            id: this.nextAdminId++,
            createdAt: new Date().toISOString(),
            createdBy: this.currentAdmin.id
        };
        
        this.admins.push(newAdmin);
        
        if (this.saveAdmins()) {
            this.renderAdmins();
            this.showStatus(`Admin "${newAdmin.name}" added successfully!`, 'success');
            return true;
        }
        return false;
    }

    editAdmin(id) {
        const admin = this.admins.find(a => a.id === id);
        if (!admin) {
            this.showStatus(`Admin with ID ${id} not found!`, 'error');
            return;
        }

        // Populate form
        document.getElementById('adminModalTitle').textContent = 'Edit Admin';
        document.getElementById('adminId').value = id;
        document.getElementById('adminName').value = admin.name;
        document.getElementById('adminEmail').value = admin.email;
        document.getElementById('adminPassword').value = ''; // Don't show password
        document.getElementById('adminRole').value = admin.role;

        // Show modal
        document.getElementById('adminModal').style.display = 'flex';
        this.showStatus(`Editing: ${admin.name}`, 'success');
    }

    updateAdmin(id, adminData) {
        const index = this.admins.findIndex(a => a.id === id);
        if (index === -1) {
            this.showStatus(`Admin with ID ${id} not found!`, 'error');
            return false;
        }

        // Check email uniqueness (excluding current admin)
        if (this.admins.find(admin => admin.email === adminData.email && admin.id !== id)) {
            this.showStatus('An admin with this email already exists!', 'error');
            return false;
        }

        this.admins[index] = {
            ...this.admins[index],
            ...adminData,
            updatedAt: new Date().toISOString(),
            updatedBy: this.currentAdmin.id
        };

        if (this.saveAdmins()) {
            this.renderAdmins();
            this.showStatus(`Admin "${adminData.name}" updated successfully!`, 'success');
            return true;
        }
        return false;
    }

    deleteAdmin(id) {
        const admin = this.admins.find(a => a.id === id);
        if (!admin) {
            this.showStatus(`Admin with ID ${id} not found!`, 'error');
            return;
        }

        if (admin.role === 'super') {
            this.showStatus('Cannot delete super admin!', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete admin "${admin.name}"?`)) {
            this.admins = this.admins.filter(a => a.id !== id);
            
            if (this.saveAdmins()) {
                this.renderAdmins();
                this.showStatus(`Admin "${admin.name}" deleted successfully!`, 'success');
            }
        }
    }

    // Utility Functions
    addSampleProducts() {
        const sampleProducts = [
            {
                name: 'Traditional Pasni Decoration Set',
                price: 2999.99,
                category: 'decoration',
                image: 'assets/one.png',
                description: 'Complete traditional decoration package with flowers, lights, and ceremonial items for Pasni ceremony'
            },
            {
                name: 'Premium Catering Package',
                price: 4999.99,
                category: 'catering',
                image: 'assets/two.png',
                description: 'Full catering service with traditional Nepali dishes and modern cuisine for 50-100 guests'
            },
            {
                name: 'Professional Photography',
                price: 1999.99,
                category: 'photography',
                image: 'assets/three.png',
                description: 'Complete photography package with ceremony coverage, family portraits, and edited digital copies'
            },
            {
                name: 'Fresh Marigold Arrangements',
                price: 1499.99,
                category: 'flowers',
                image: 'assets/four.jpg',
                description: 'Beautiful fresh marigold flower arrangements and garlands for traditional ceremonies'
            },
            {
                name: 'Traditional Music & Entertainment',
                price: 3499.99,
                category: 'music',
                image: 'assets/five.jpg',
                description: 'Live traditional music performance with dhime baja and cultural entertainment'
            },
            {
                name: 'Venue Setup & Management',
                price: 5999.99,
                category: 'venue',
                image: 'assets/project.jpg',
                description: 'Complete venue setup with mandap decoration, seating arrangement, and event coordination'
            }
        ];

        let addedCount = 0;
        sampleProducts.forEach(product => {
            if (this.addProduct(product)) {
                addedCount++;
            }
        });

        this.showStatus(`Added ${addedCount} sample products!`, 'success');
    }

    refreshProducts() {
        this.loadProducts();
        this.showStatus('Products refreshed!', 'success');
    }

    clearAllProducts() {
        if (confirm('Are you sure you want to delete ALL products? This action cannot be undone!')) {
            this.products = [];
            this.nextProductId = 1;
            localStorage.removeItem('adminProducts');
            localStorage.removeItem('simpleAdminProducts');
            localStorage.removeItem('pasni_products');
            this.renderProducts();
            this.showStatus('All products cleared!', 'warning');
        }
    }

    // Event Binding
    bindEvents() {
        // Product form submission
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const productData = {
                name: document.getElementById('productName').value.trim(),
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                image: document.getElementById('productImage').value.trim(),
                description: document.getElementById('productDescription').value.trim()
            };

            // Validation
            if (!productData.name || !productData.price || !productData.category || !productData.image || !productData.description) {
                this.showStatus('Please fill in all required fields!', 'error');
                return;
            }

            const productId = document.getElementById('productId').value;
            let success = false;

            if (productId) {
                // Update existing
                success = this.updateProduct(parseInt(productId), productData);
            } else {
                // Add new
                success = this.addProduct(productData);
            }

            if (success) {
                this.closeProductModal();
            }
        });

        // Admin form submission
        document.getElementById('adminForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const adminData = {
                name: document.getElementById('adminName').value.trim(),
                email: document.getElementById('adminEmail').value.trim(),
                password: document.getElementById('adminPassword').value,
                role: document.getElementById('adminRole').value
            };

            // Validation
            if (!adminData.name || !adminData.email || !adminData.role) {
                this.showStatus('Please fill in all required fields!', 'error');
                return;
            }

            const adminId = document.getElementById('adminId').value;
            let success = false;

            if (adminId) {
                // Update existing (don't update password if empty)
                if (!adminData.password) {
                    delete adminData.password;
                }
                success = this.updateAdmin(parseInt(adminId), adminData);
            } else {
                // Add new (password required)
                if (!adminData.password) {
                    this.showStatus('Password is required for new admin!', 'error');
                    return;
                }
                success = this.addAdmin(adminData);
            }

            if (success) {
                this.closeAdminModal();
            }
        });

        // Modal close on backdrop click
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeProductModal();
            }
        });

        document.getElementById('adminModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeAdminModal();
            }
        });
    }

    // Modal Management
    showAddProductModal() {
        document.getElementById('productModalTitle').textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModal').style.display = 'flex';
    }

    closeProductModal() {
        document.getElementById('productModal').style.display = 'none';
        document.getElementById('productForm').reset();
    }

    showAddAdminModal() {
        if (this.currentAdmin.role === 'manager') {
            this.showStatus('Only admins and super admins can add new admin users!', 'error');
            return;
        }

        document.getElementById('adminModalTitle').textContent = 'Add New Admin';
        document.getElementById('adminForm').reset();
        document.getElementById('adminId').value = '';
        document.getElementById('adminModal').style.display = 'flex';
    }

    closeAdminModal() {
        document.getElementById('adminModal').style.display = 'none';
        document.getElementById('adminForm').reset();
    }
}

// Global Functions (for onclick handlers)
function showAddProductModal() {
    adminDashboard.showAddProductModal();
}

function closeProductModal() {
    adminDashboard.closeProductModal();
}

function showAddAdminModal() {
    adminDashboard.showAddAdminModal();
}

function closeAdminModal() {
    adminDashboard.closeAdminModal();
}

function addSampleProducts() {
    adminDashboard.addSampleProducts();
}

function refreshProducts() {
    adminDashboard.refreshProducts();
}

function clearAllProducts() {
    adminDashboard.clearAllProducts();
}

// Initialize Dashboard
let adminDashboard;

document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});

// Backup initialization
window.addEventListener('load', () => {
    if (!adminDashboard) {
        adminDashboard = new AdminDashboard();
    }
});
