// Profile and Cart Management
class ProfileManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('pasni_current_user'));
        this.users = JSON.parse(localStorage.getItem('pasni_users')) || [];
        
        if (!this.currentUser) {
            window.location.href = 'auth.html?redirect=profile.html';
            return;
        }
        
        this.initializePage();
    }

    initializePage() {
        this.loadUserInfo();
        this.loadCart();
        this.loadOrders();
    }

    loadUserInfo() {
        document.getElementById('userName').textContent = `Welcome back, ${this.currentUser.name}!`;
        document.getElementById('userEmail').textContent = this.currentUser.email;
        
        // Profile tab info
        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        document.getElementById('profilePhone').textContent = this.currentUser.phone;
        document.getElementById('profileDate').textContent = new Date(this.currentUser.createdAt).toLocaleDateString();
    }

    loadCart() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!this.currentUser.cart || this.currentUser.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <h3>Your cart is empty</h3>
                    <p>Start adding items to your cart to see them here.</p>
                    <button class="button" onclick="window.location.href='products.html'" style="margin-top: 20px;">Browse Products</button>
                </div>
            `;
            cartSummary.style.display = 'none';
            return;
        }

        let cartHTML = '';
        let total = 0;

        this.currentUser.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" />
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-desc">${item.description}</div>
                        <div class="cart-item-price">Rs. ${item.price}/day</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = cartHTML;
        document.getElementById('cartTotal').textContent = `Rs. ${total}`;
        cartSummary.style.display = 'block';
    }

    loadOrders() {
        const ordersList = document.getElementById('ordersList');
        
        if (!this.currentUser.orders || this.currentUser.orders.length === 0) {
            ordersList.innerHTML = `
                <div class="cart-empty">
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here once you make your first purchase.</p>
                </div>
            `;
            return;
        }

        let ordersHTML = '';
        this.currentUser.orders.forEach(order => {
            const itemCount = order.items.length;
            const firstItemName = order.items[0]?.name || 'Unknown Item';
            const deliveryInfo = order.deliveryDate ? `Delivery: ${new Date(order.deliveryDate).toLocaleDateString()}` : 'Delivery date not set';
            
            ordersHTML += `
                <div class="order-item">
                    <div class="order-header">
                        <div class="order-id">Order #${order.id}</div>
                        <div class="order-status ${order.status}">${order.status.toUpperCase()}</div>
                    </div>
                    <div class="order-details">
                        <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> Rs. ${order.total}</p>
                        <p><strong>Items:</strong> ${itemCount} item(s) - ${firstItemName}${itemCount > 1 ? ` and ${itemCount - 1} more` : ''}</p>
                        <p><strong>${deliveryInfo}</strong></p>
                        <div style="margin-top: 15px; display: flex; gap: 10px;">
                            <button class="button" onclick="window.location.href='order-details.html?order=${order.id}'">View Details</button>
                            ${order.status === 'pending' ? `<button class="button2" onclick="window.location.href='order-details.html?order=${order.id}'">Edit Order</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        ordersList.innerHTML = ordersHTML;
    }

    updateUser() {
        // Update user in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('pasni_users', JSON.stringify(this.users));
        }
        localStorage.setItem('pasni_current_user', JSON.stringify(this.currentUser));
    }
}

// Cart Functions
function updateQuantity(index, change) {
    const user = JSON.parse(localStorage.getItem('pasni_current_user'));
    if (user && user.cart[index]) {
        user.cart[index].quantity += change;
        if (user.cart[index].quantity <= 0) {
            user.cart.splice(index, 1);
        }
        localStorage.setItem('pasni_current_user', JSON.stringify(user));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('pasni_users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('pasni_users', JSON.stringify(users));
        }
        
        profileManager.currentUser = user;
        profileManager.loadCart();
    }
}

function removeFromCart(index) {
    const user = JSON.parse(localStorage.getItem('pasni_current_user'));
    if (user && user.cart[index]) {
        user.cart.splice(index, 1);
        localStorage.setItem('pasni_current_user', JSON.stringify(user));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('pasni_users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('pasni_users', JSON.stringify(users));
        }
        
        profileManager.currentUser = user;
        profileManager.loadCart();
    }
}

function checkout() {
    const user = JSON.parse(localStorage.getItem('pasni_current_user'));
    if (!user || !user.cart || user.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Calculate total
    const total = user.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: [...user.cart],
        total: total,
        status: 'pending'
    };

    // Add order to user's orders
    if (!user.orders) user.orders = [];
    user.orders.unshift(order);
    
    // Clear cart
    user.cart = [];
    
    // Update storage
    localStorage.setItem('pasni_current_user', JSON.stringify(user));
    
    // Update users array
    const users = JSON.parse(localStorage.getItem('pasni_users')) || [];
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('pasni_users', JSON.stringify(users));
    }
    
    alert(`Order placed successfully! Order #${order.id}\nTotal: Rs. ${total}`);
    
    profileManager.currentUser = user;
    profileManager.loadCart();
    profileManager.loadOrders();
}

function switchProfileTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.profile-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activate selected tab
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('pasni_current_user');
        window.location.href = 'index.html';
    }
}

// Initialize profile manager when page loads
let profileManager;
document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});
