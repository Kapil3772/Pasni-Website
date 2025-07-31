// Cart Management System
class CartManager {
    constructor() {
        this.products = this.loadProducts();
        this.initializeCartSidebar();
    }

    loadProducts() {
        // Try to load products from simple admin first
        const simpleAdminProducts = JSON.parse(localStorage.getItem('simpleAdminProducts') || '[]');
        if (simpleAdminProducts && simpleAdminProducts.length > 0) {
            console.log('Loading products from simple admin:', simpleAdminProducts.length);
            return simpleAdminProducts;
        }

        // Try to load products from admin management
        const adminProducts = JSON.parse(localStorage.getItem('pasni_products') || '[]');
        if (adminProducts && adminProducts.length > 0) {
            console.log('Loading products from admin management:', adminProducts.length);
            return adminProducts;
        }

        // Fall back to default products if none exist
        const defaultProducts = [
            {
                id: 1,
                name: "Traditional Pasni Set",
                description: "Complete traditional set including silver bowl, spoon, and ceremonial items for the sacred rice feeding ceremony.",
                price: 2500,
                image: "assets/one.png"
            },
            {
                id: 2,
                name: "Premium Ceremony Package",
                description: "Deluxe package with ornate silver utensils, traditional ceremonial cloth, decorative items, and professional setup assistance.",
                price: 4000,
                image: "assets/two.png"
            },
            {
                id: 3,
                name: "Complete Event Setup",
                description: "Full-service package including all ceremonial items, traditional decorations, seating arrangements, and professional event coordination.",
                price: 6500,
                image: "assets/three.png"
            },
            {
                id: 4,
                name: "Royal Heritage Collection",
                description: "Premium collection inspired by Nepali royal traditions with exclusive ceremonial items and luxury accessories.",
                price: 8000,
                image: "assets/four.jpg"
            },
            {
                id: 5,
                name: "Cultural Celebration Package",
                description: "Comprehensive package for large gatherings with multiple ceremonial sets and traditional decorative elements.",
                price: 5500,
                image: "assets/five.jpg"
            }
        ];

        // Save default products for admin management
        localStorage.setItem('pasni_products', JSON.stringify(defaultProducts));
        return defaultProducts;
    }

    // Method to refresh products (called when admin updates products)
    refreshProducts() {
        this.products = this.loadProducts();
        // Update any existing cart items with new product info
        this.updateCartAfterProductChanges();
        // Refresh homepage slider if it exists
        if (typeof productSlider !== 'undefined' && productSlider && productSlider.refresh) {
            productSlider.refresh();
        }
    }

    updateCartAfterProductChanges() {
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.cart) {
            currentUser.cart.forEach(cartItem => {
                const updatedProduct = this.products.find(p => p.id == cartItem.id);
                if (updatedProduct) {
                    cartItem.name = updatedProduct.name;
                    cartItem.price = updatedProduct.price;
                    cartItem.image = updatedProduct.image;
                    cartItem.description = updatedProduct.description;
                }
            });
            this.updateUserData(currentUser);
            this.updateCartSidebar();
        }
    }

    initializeCartSidebar() {
    }

    initializeCartSidebar() {
        // Create cart sidebar HTML
        const cartSidebarHTML = `
            <div class="cart-overlay" id="cartOverlay" onclick="this.closeCart()"></div>
            <div class="cart-sidebar" id="cartSidebar">
                <div class="cart-sidebar-header">
                    <h3 class="cart-sidebar-title">Shopping Cart</h3>
                    <button class="cart-close-btn" onclick="cartManager.closeCart()">×</button>
                </div>
                <div class="cart-sidebar-content">
                    <div id="cartSidebarItems"></div>
                </div>
                <div class="cart-sidebar-footer" id="cartSidebarFooter" style="display: none;">
                    <div class="cart-sidebar-total">
                        <span>Total: <span id="cartSidebarTotal">Rs. 0</span></span>
                    </div>
                    <button class="cart-sidebar-checkout" onclick="cartManager.quickCheckout()">Quick Checkout</button>
                    <button class="cart-sidebar-view-cart" onclick="cartManager.viewFullCart()">View Full Cart</button>
                </div>
            </div>
            <div class="success-notification" id="successNotification"></div>
        `;
        
        // Add to body
        document.body.insertAdjacentHTML('beforeend', cartSidebarHTML);
        
        // Update cart sidebar on load
        this.updateCartSidebar();
    }

    isUserLoggedIn() {
        return localStorage.getItem('pasni_current_user') !== null;
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('pasni_current_user'));
    }

    addToCart(productId) {
        if (!this.isUserLoggedIn()) {
            // Redirect to auth page with current page as redirect
            const currentPage = window.location.pathname.split('/').pop();
            window.location.href = `auth.html?redirect=${currentPage}`;
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('Product not found!', 'error');
            return;
        }

        const user = this.getCurrentUser();
        if (!user.cart) user.cart = [];

        // Check if item already exists in cart
        const existingItem = user.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            this.showNotification(`${product.name} quantity updated!`, 'success');
        } else {
            user.cart.push({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                quantity: 1
            });
            this.showNotification(`${product.name} added to cart!`, 'success');
        }

        // Update localStorage
        this.updateUserData(user);
        this.updateCartCount();
        this.updateCartSidebar();
        
        // Show cart sidebar
        this.openCart();
    }

    addToCeremony(productId) {
        if (!this.isUserLoggedIn()) {
            const currentPage = window.location.pathname.split('/').pop();
            window.location.href = `auth.html?redirect=${currentPage}`;
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showNotification('Product not found!', 'error');
            return;
        }

        this.showNotification(`${product.name} added to ceremony planning!`, 'success');
    }

    updateUserData(user) {
        localStorage.setItem('pasni_current_user', JSON.stringify(user));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('pasni_users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('pasni_users', JSON.stringify(users));
        }
    }

    updateCartSidebar() {
        const cartItems = document.getElementById('cartSidebarItems');
        const cartFooter = document.getElementById('cartSidebarFooter');
        const user = this.getCurrentUser();
        
        if (!user || !user.cart || user.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty-sidebar">
                    <h3>Your cart is empty</h3>
                    <p>Add items to see them here</p>
                </div>
            `;
            cartFooter.style.display = 'none';
            return;
        }

        let cartHTML = '';
        let total = 0;

        user.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartHTML += `
                <div class="cart-sidebar-item">
                    <div class="cart-sidebar-item-image">
                        <img src="${item.image}" alt="${item.name}" />
                    </div>
                    <div class="cart-sidebar-item-details">
                        <div class="cart-sidebar-item-name">${item.name}</div>
                        <div class="cart-sidebar-item-price">Rs. ${item.price}/day</div>
                        <div class="cart-sidebar-item-controls">
                            <button class="cart-sidebar-qty-btn" onclick="cartManager.updateCartQuantity(${index}, -1)">-</button>
                            <span class="cart-sidebar-qty">${item.quantity}</span>
                            <button class="cart-sidebar-qty-btn" onclick="cartManager.updateCartQuantity(${index}, 1)">+</button>
                            <button class="cart-sidebar-remove" onclick="cartManager.removeFromCartSidebar(${index})">×</button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = cartHTML;
        document.getElementById('cartSidebarTotal').textContent = `Rs. ${total}`;
        cartFooter.style.display = 'block';
    }

    updateCartQuantity(index, change) {
        const user = this.getCurrentUser();
        if (user && user.cart[index]) {
            user.cart[index].quantity += change;
            if (user.cart[index].quantity <= 0) {
                user.cart.splice(index, 1);
            }
            this.updateUserData(user);
            this.updateCartCount();
            this.updateCartSidebar();
        }
    }

    removeFromCartSidebar(index) {
        const user = this.getCurrentUser();
        if (user && user.cart[index]) {
            const itemName = user.cart[index].name;
            user.cart.splice(index, 1);
            this.updateUserData(user);
            this.updateCartCount();
            this.updateCartSidebar();
            this.showNotification(`${itemName} removed from cart`, 'success');
        }
    }

    openCart() {
        document.getElementById('cartSidebar').classList.add('open');
        document.getElementById('cartOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('open');
        document.body.style.overflow = 'auto';
    }

    quickCheckout() {
        const user = this.getCurrentUser();
        if (!user || !user.cart || user.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
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
            status: 'pending',
            deliveryDate: '',
            notes: '',
            customerInfo: {
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        };

        // Add order to user's orders
        if (!user.orders) user.orders = [];
        user.orders.unshift(order);
        
        // Clear cart
        user.cart = [];
        
        // Update storage
        this.updateUserData(user);
        this.updateCartCount();
        this.updateCartSidebar();
        this.closeCart();
        
        this.showNotification(`Order #${order.id} placed successfully!`, 'success');
        
        // Redirect to order details
        setTimeout(() => {
            window.location.href = `profile.html?order=${order.id}`;
        }, 2000);
    }

    viewFullCart() {
        this.closeCart();
        window.location.href = 'profile.html';
    }

    showNotification(message, type) {
        const notification = document.getElementById('successNotification');
        notification.textContent = message;
        notification.className = 'success-notification';
        
        if (type === 'error') {
            notification.style.backgroundColor = '#f8d7da';
            notification.style.color = '#721c24';
        } else {
            notification.style.backgroundColor = '#d4edda';
            notification.style.color = '#155724';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    updateCartCount() {
        const user = this.getCurrentUser();
        if (user && user.cart) {
            const totalItems = user.cart.reduce((total, item) => total + item.quantity, 0);
            // Update cart count in header if element exists
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = totalItems;
            }
        }
    }

    getCartItemCount() {
        const user = this.getCurrentUser();
        if (user && user.cart) {
            return user.cart.reduce((total, item) => total + item.quantity, 0);
        }
        return 0;
    }
}

// Create global cartManager instance
const cartManager = new CartManager();

// Listen for admin product updates
window.addEventListener('storage', function(e) {
    if (e.key === 'pasni_products') {
        cartManager.refreshProducts();
    }
});

// Check for product updates on page load
document.addEventListener('DOMContentLoaded', function() {
    const lastUpdate = localStorage.getItem('pasni_products_updated');
    if (lastUpdate) {
        cartManager.refreshProducts();
    }
});

// Global functions for backward compatibility
function addToCart(productId) {
    cartManager.addToCart(productId);
}

function addToCeremony(productId) {
    cartManager.addToCeremony(productId);
}

// Make it globally available
window.cartManager = cartManager;

// Update existing slider functions to work with new cart system
const slider = document.getElementById('productsSlider');
if (slider) {
    const slideWidth = 395; // 365px card + 30px gap
    const cardsPerSlide = 3;

    let currentIndex = 0;

    const cards = Array.from(slider.children);
    const totalCards = cards.length;

    // Clone first few cards to the end for infinite scroll
    for (let i = 0; i < cardsPerSlide; i++) {
        const clone = cards[i].cloneNode(true);
        slider.appendChild(clone);
    }

    function updateSlider() {
        slider.style.transition = 'transform 0.5s ease';
        slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    function nextSlide() {
        currentIndex++;
        updateSlider();

        if (currentIndex === totalCards) {
            setTimeout(() => {
                slider.style.transition = 'none';
                currentIndex = 0;
                slider.style.transform = `translateX(0px)`;
            }, 500);
        }
    }

    function prevSlide() {
        if (currentIndex === 0) {
            slider.style.transition = 'none';
            currentIndex = totalCards;
            slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            setTimeout(() => {
                currentIndex--;
                updateSlider();
            }, 20);
        } else {
            currentIndex--;
            updateSlider();
        }
    }

    function currentSlide(n) {
        currentIndex = n;
        updateSlider();
    }

    // Auto-slide every 5 seconds (reduced from 500000)
    setInterval(nextSlide, 5000);

    // Make functions globally available
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;
    window.currentSlide = currentSlide;
}

// Header authentication state management
function updateHeaderAuthState() {
    const user = JSON.parse(localStorage.getItem('pasni_current_user'));
    const headerNav = document.querySelector('.header-nav');
    
    if (user) {
        // User is logged in - show profile link and cart button
        const existingProfileLink = headerNav.querySelector('a[href="profile.html"]');
        const existingCartBtn = headerNav.querySelector('.cart-btn');
        const existingAuthLink = headerNav.querySelector('a[href="auth.html"]');
        
        // Remove auth link if exists
        if (existingAuthLink) {
            existingAuthLink.remove();
        }
        
        // Add cart button if doesn't exist
        if (!existingCartBtn) {
            const cartBtn = document.createElement('button');
            cartBtn.className = 'cart-btn';
            cartBtn.onclick = () => cartManager.openCart();
            cartBtn.innerHTML = `
                Cart <span class="cart-count" id="cartCount">${cartManager.getCartItemCount()}</span>
            `;
            headerNav.appendChild(cartBtn);
        } else {
            document.getElementById('cartCount').textContent = cartManager.getCartItemCount();
        }
        
        // Add profile link if doesn't exist
        if (!existingProfileLink) {
            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.textContent = user.name.split(' ')[0];
            profileLink.style.fontWeight = 'bold';
            headerNav.appendChild(profileLink);
        }
    } else {
        // User is not logged in - show login link, remove cart and profile
        const existingProfileLink = headerNav.querySelector('a[href="profile.html"]');
        const existingCartBtn = headerNav.querySelector('.cart-btn');
        const existingAuthLink = headerNav.querySelector('a[href="auth.html"]');
        
        if (existingProfileLink) existingProfileLink.remove();
        if (existingCartBtn) existingCartBtn.remove();
        
        if (!existingAuthLink) {
            const authLink = document.createElement('a');
            authLink.href = 'auth.html';
            authLink.textContent = 'login';
            headerNav.appendChild(authLink);
        }
    }
}

// Update header when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderAuthState();
});
