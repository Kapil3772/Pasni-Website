// Admin Dashboard Manager
class AdminManager {
    constructor() {
        this.currentAdmin = null;
        this.currentFilter = 'all';
        this.initialized = false;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing Admin Dashboard...');
        
        // For testing purposes, bypass session check
        this.currentAdmin = { 
            name: 'Test Admin', 
            id: 'test_admin',
            email: 'admin@test.com'
        };
        console.log('Using test admin session:', this.currentAdmin);

        // Display admin name
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            adminNameElement.textContent = this.currentAdmin.name;
        }

        // Initialize tabs
        this.initializeTabs();
        
        // Load initial data
        this.loadProducts();
        this.loadOrders();
        this.loadAdmins();

        // Bind form events
        this.bindEvents();
        
        this.initialized = true;
        console.log('Admin Dashboard initialized successfully');
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.admin-tab-btn');
        const tabContents = document.querySelectorAll('.admin-tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Product form
        const productForm = document.getElementById('productManagementForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Product form submitted');
                this.saveProduct();
            });
            console.log('Product form event bound');
        } else {
            console.error('Product form not found');
        }

        // Admin form
        const adminForm = document.getElementById('adminManagementForm');
        if (adminForm) {
            adminForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Admin form submitted');
                this.saveNewAdmin();
            });
            console.log('Admin form event bound');
        } else {
            console.error('Admin form not found');
        }

        // Order filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Filter clicked:', btn.dataset.status);
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.status;
                this.loadOrders();
            });
        });
        
        console.log('All events bound successfully');
    }

    // Product Management
    loadProducts() {
        const products = this.getProducts();
        const container = document.getElementById('adminProductsList');
        
        if (products.length === 0) {
            container.innerHTML = '<p class="no-data">No products found. Add your first product!</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="admin-product-card">
                <div class="admin-product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/placeholder.png'">
                </div>
                <div class="admin-product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">Rs. ${product.price}</p>
                    <p class="product-desc">${product.description}</p>
                    <div class="admin-product-actions">
                        <button class="edit-btn" onclick="console.log('Edit clicked for:', '${product.id}'); editProduct('${product.id}')">Edit</button>
                        <button class="delete-btn" onclick="console.log('Delete clicked for:', '${product.id}'); deleteProduct('${product.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showAddProductForm() {
        console.log('Show add product form clicked');
        document.getElementById('productFormTitle').textContent = 'Add New Product';
        const form = document.getElementById('productManagementForm');
        if (form) form.reset();
        document.getElementById('productId').value = '';
        
        const formContainer = document.getElementById('productForm');
        if (formContainer) {
            formContainer.style.display = 'block';
            console.log('Product form shown');
        } else {
            console.error('Product form container not found');
        }
    }

    hideProductForm() {
        console.log('Hide product form clicked');
        const formContainer = document.getElementById('productForm');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
    }

    editProduct(productId) {
        console.log('AdminManager.editProduct called with ID:', productId);
        const products = this.getProducts();
        console.log('Available products:', products);
        const product = products.find(p => p.id == productId);
        console.log('Found product:', product);
        
        if (product) {
            console.log('Editing product, showing form');
            document.getElementById('productFormTitle').textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productForm').style.display = 'block';
        } else {
            console.error('Product not found with ID:', productId);
            alert('Product not found!');
        }
    }

    saveProduct() {
        try {
            console.log('saveProduct called');
            
            const productId = document.getElementById('productId').value;
            const name = document.getElementById('productName').value;
            const price = document.getElementById('productPrice').value;
            const description = document.getElementById('productDescription').value;
            const image = document.getElementById('productImage').value;

            if (!name || !price || !image) {
                alert('Please fill in all required fields');
                return;
            }

            const productData = {
                id: productId || this.generateProductId(),
                name,
                price: parseInt(price),
                description,
                image,
                updatedAt: new Date().toISOString()
            };

            console.log('Product data to save:', productData);

            let products = this.getProducts();
            
            if (productId) {
                // Update existing product
                const index = products.findIndex(p => p.id == productId);
                if (index !== -1) {
                    products[index] = { ...products[index], ...productData };
                    console.log('Updated existing product at index:', index);
                }
            } else {
                // Add new product
                productData.createdAt = new Date().toISOString();
                products.push(productData);
                console.log('Added new product');
            }

            localStorage.setItem('pasni_products', JSON.stringify(products));
            
            // Clear form
            document.getElementById('productManagementForm').reset();
            document.getElementById('productId').value = '';
            
            // Refresh the products list
            this.loadProducts();
            
            alert('Product saved successfully!');
            console.log('Product saved successfully');
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product: ' + error.message);
        }
    }

    deleteProduct(productId) {
        console.log('AdminManager.deleteProduct called with ID:', productId);
        if (confirm('Are you sure you want to delete this product?')) {
            console.log('User confirmed deletion');
            let products = this.getProducts();
            console.log('Products before deletion:', products.length);
            products = products.filter(p => p.id != productId);
            console.log('Products after deletion:', products.length);
            localStorage.setItem('pasni_products', JSON.stringify(products));
            
            // Trigger refresh on main website
            this.notifyWebsiteUpdate();
            
            this.loadProducts();
            alert('Product deleted successfully!');
        } else {
            console.log('User cancelled deletion');
        }
    }

    generateProductId() {
        // Generate a unique ID for new products
        const products = this.getProducts();
        const maxId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id) || 0)) : 0;
        return maxId + 1;
    }

    notifyWebsiteUpdate() {
        // Store a flag to indicate products were updated
        localStorage.setItem('pasni_products_updated', Date.now().toString());
        
        // If we're in the same window/tab, try to refresh cartManager
        if (typeof window !== 'undefined' && window.cartManager) {
            window.cartManager.refreshProducts();
        }
    }

    getProducts() {
        let products = JSON.parse(localStorage.getItem('pasni_products')) || [];
        
        // Add sample products if none exist
        if (products.length === 0) {
            products = [
                {
                    id: '1',
                    name: 'Traditional Pasni Set',
                    price: 5000,
                    image: 'assets/one.png',
                    description: 'Complete traditional Pasni ceremony set with all essentials.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2', 
                    name: 'Premium Decoration Package',
                    price: 8000,
                    image: 'assets/two.png',
                    description: 'Premium decoration package for special occasions.',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'Royal Ceremony Set',
                    price: 12000,
                    image: 'assets/three.png', 
                    description: 'Luxurious royal ceremony set for grand celebrations.',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('pasni_products', JSON.stringify(products));
            console.log('Added sample products:', products);
        }
        
        return products;
    }

    // Order Management
    loadOrders() {
        const orders = this.getOrders();
        const filteredOrders = this.currentFilter === 'all' 
            ? orders 
            : orders.filter(order => order.status === this.currentFilter);
        
        const container = document.getElementById('adminOrdersList');
        
        if (filteredOrders.length === 0) {
            container.innerHTML = '<p class="no-data">No orders found.</p>';
            return;
        }

        container.innerHTML = filteredOrders.map(order => `
            <div class="admin-order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order #${order.id.slice(-8)}</h3>
                        <p class="order-date">${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p class="order-customer">Customer: ${order.customerName}</p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${order.status}">${order.status.toUpperCase()}</span>
                        <p class="order-total">Total: Rs. ${order.total}</p>
                    </div>
                </div>
                <div class="order-items">
                    <h4>Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>Rs. ${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="approve-btn" onclick="adminManager.updateOrderStatus('${order.id}', 'approved')">Approve</button>
                        <button class="cancel-btn" onclick="adminManager.updateOrderStatus('${order.id}', 'cancelled')">Cancel</button>
                    ` : ''}
                    <button class="view-btn" onclick="adminManager.viewOrderDetails('${order.id}')">View Details</button>
                </div>
            </div>
        `).join('');
    }

    getOrders() {
        // Get orders from all users
        const users = JSON.parse(localStorage.getItem('pasni_users')) || [];
        let allOrders = [];
        
        users.forEach(user => {
            if (user.orders) {
                user.orders.forEach(order => {
                    allOrders.push({
                        ...order,
                        customerName: user.name,
                        customerEmail: user.email
                    });
                });
            }
        });
        
        return allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    updateOrderStatus(orderId, newStatus) {
        if (confirm(`Are you sure you want to ${newStatus} this order?`)) {
            let users = JSON.parse(localStorage.getItem('pasni_users')) || [];
            
            users.forEach(user => {
                if (user.orders) {
                    const orderIndex = user.orders.findIndex(order => order.id === orderId);
                    if (orderIndex !== -1) {
                        user.orders[orderIndex].status = newStatus;
                        user.orders[orderIndex].updatedAt = new Date().toISOString();
                    }
                }
            });
            
            localStorage.setItem('pasni_users', JSON.stringify(users));
            this.loadOrders();
            alert(`Order ${newStatus} successfully!`);
        }
    }

    viewOrderDetails(orderId) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            alert(`Order Details:
            
Order ID: ${order.id}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Status: ${order.status.toUpperCase()}
Total: Rs. ${order.total}
Date: ${new Date(order.createdAt).toLocaleString()}

Items:
${order.items.map(item => `• ${item.name} x ${item.quantity} = Rs. ${item.price * item.quantity}`).join('\n')}`);
        }
    }

    // Admin Management
    loadAdmins() {
        const admins = JSON.parse(localStorage.getItem('pasni_admins')) || [];
        const container = document.getElementById('adminsList');
        
        container.innerHTML = admins.map(admin => `
            <div class="admin-card">
                <div class="admin-info">
                    <h3>${admin.name}</h3>
                    <p>${admin.email}</p>
                    <p class="admin-role">${admin.role.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div class="admin-actions">
                    ${admin.email !== 'admin@pasni.com' ? `
                        <button class="delete-btn" onclick="adminManager.deleteAdmin('${admin.id}')">Remove</button>
                    ` : '<span class="system-admin">System Admin</span>'}
                </div>
            </div>
        `).join('');
    }

    showAddAdminForm() {
        console.log('Show add admin form clicked');
        const formContainer = document.getElementById('adminForm');
        if (formContainer) {
            formContainer.style.display = 'block';
        }
    }

    hideAdminForm() {
        console.log('Hide admin form clicked');
        const formContainer = document.getElementById('adminForm');
        if (formContainer) {
            formContainer.style.display = 'none';
        }
        const form = document.getElementById('adminManagementForm');
        if (form) form.reset();
    }

    saveNewAdmin() {
        const name = document.getElementById('newAdminName').value;
        const email = document.getElementById('newAdminEmail').value;
        const password = document.getElementById('newAdminPassword').value;

        // Check if admin already exists
        const existingAdmins = JSON.parse(localStorage.getItem('pasni_admins')) || [];
        if (existingAdmins.find(admin => admin.email === email)) {
            alert('An admin with this email already exists!');
            return;
        }

        const newAdmin = {
            id: 'admin_' + Date.now(),
            name,
            email,
            password, // In real app, this should be hashed
            role: 'admin',
            createdAt: new Date().toISOString()
        };

        existingAdmins.push(newAdmin);
        localStorage.setItem('pasni_admins', JSON.stringify(existingAdmins));
        
        this.loadAdmins();
        this.hideAdminForm();
        alert('Admin added successfully!');
    }

    deleteAdmin(adminId) {
        if (confirm('Are you sure you want to remove this admin?')) {
            let admins = JSON.parse(localStorage.getItem('pasni_admins')) || [];
            admins = admins.filter(admin => admin.id !== adminId);
            localStorage.setItem('pasni_admins', JSON.stringify(admins));
            this.loadAdmins();
            alert('Admin removed successfully!');
        }
    }

    logout() {
        console.log('Logout clicked');
        try {
            sessionStorage.removeItem('pasni_admin_session');
            alert('Logged out successfully');
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Error during logout:', error);
            window.location.href = 'admin-login.html';
        }
    }
}

// Wait for AdminAuth to be loaded before initializing
let adminManager = null;

// Global functions for onclick handlers with waiting mechanism
function waitForAdminManager(callback, maxAttempts = 20) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        if (adminManager) {
            clearInterval(checkInterval);
            callback();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error('AdminManager still not loaded after', attempts, 'attempts');
            // Try to force initialize
            initializeAdminDashboard();
            setTimeout(() => {
                if (adminManager) {
                    callback();
                } else {
                    alert('Unable to load admin manager. Please refresh the page.');
                }
            }, 1000);
        }
    }, 100);
}

window.editProduct = function(productId) {
    console.log('Global editProduct called with ID:', productId);
    if (adminManager) {
        console.log('Calling adminManager.editProduct');
        adminManager.editProduct(productId);
    } else {
        console.log('AdminManager not ready, waiting...');
        waitForAdminManager(() => {
            console.log('AdminManager ready, calling editProduct');
            adminManager.editProduct(productId);
        });
    }
};

window.deleteProduct = function(productId) {
    console.log('Global deleteProduct called with ID:', productId);
    if (adminManager) {
        console.log('Calling adminManager.deleteProduct');
        adminManager.deleteProduct(productId);
    } else {
        console.log('AdminManager not ready, waiting...');
        waitForAdminManager(() => {
            console.log('AdminManager ready, calling deleteProduct');
            adminManager.deleteProduct(productId);
        });
    }
};

window.updateOrderStatus = function(orderId, status) {
    if (adminManager) adminManager.updateOrderStatus(orderId, status);
};

window.viewOrderDetails = function(orderId) {
    if (adminManager) adminManager.viewOrderDetails(orderId);
};

window.deleteAdmin = function(adminId) {
    if (adminManager) adminManager.deleteAdmin(adminId);
};

window.logout = function() {
    if (adminManager) adminManager.logout();
};

window.showAddAdminForm = function() {
    if (adminManager) adminManager.showAddAdminForm();
};

// Backup initialization function for testing
window.forceInitAdminManager = function() {
    console.log('Force initializing AdminManager...');
    try {
        adminManager = new AdminManager();
        // Skip session check for testing
        adminManager.currentAdmin = { name: 'Test Admin', id: 'test' };
        adminManager.loadProducts();
        adminManager.loadOrders();
        adminManager.loadAdmins();
        console.log('AdminManager force initialized successfully');
    } catch (error) {
        console.error('Error force initializing AdminManager:', error);
    }
};

window.showAddProductForm = function() {
    if (adminManager) adminManager.showAddProductForm();
};

window.hideProductForm = function() {
    if (adminManager) adminManager.hideProductForm();
};

window.hideAdminForm = function() {
    if (adminManager) adminManager.hideAdminForm();
};

// Simplified initialization
function initializeAdminDashboard() {
    console.log('Starting admin dashboard initialization...');
    try {
        adminManager = new AdminManager();
        console.log('AdminManager created successfully!');
        
        // Verify functions are accessible
        console.log('Global functions check:');
        console.log('- editProduct:', typeof window.editProduct);
        console.log('- deleteProduct:', typeof window.deleteProduct);
        console.log('- logout:', typeof window.logout);
        console.log('- showAddProductForm:', typeof window.showAddProductForm);
        
    } catch (error) {
        console.error('Failed to create AdminManager:', error);
        // Try again after a short delay
        setTimeout(() => {
            console.log('Retrying AdminManager initialization...');
            try {
                adminManager = new AdminManager();
                console.log('AdminManager created on retry!');
            } catch (retryError) {
                console.error('Retry failed:', retryError);
            }
        }, 1000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminDashboard);
} else {
    // Initialize immediately if DOM is already ready
    initializeAdminDashboard();
}

// Also try to initialize after a small delay as backup
setTimeout(initializeAdminDashboard, 500);
