// Order Details Management
class OrderDetailsManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('pasni_current_user'));
        this.users = JSON.parse(localStorage.getItem('pasni_users')) || [];
        this.orderId = this.getOrderIdFromURL();
        this.originalOrder = null;
        this.editMode = false;
        
        if (!this.currentUser) {
            window.location.href = 'auth.html?redirect=profile.html';
            return;
        }
        
        this.loadOrderDetails();
    }

    getOrderIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('order');
    }

    loadOrderDetails() {
        if (!this.orderId) {
            alert('Order not found!');
            window.location.href = 'profile.html';
            return;
        }

        const order = this.currentUser.orders?.find(o => o.id == this.orderId);
        if (!order) {
            alert('Order not found!');
            window.location.href = 'profile.html';
            return;
        }

        this.originalOrder = JSON.parse(JSON.stringify(order)); // Deep copy
        this.displayOrderDetails(order);
    }

    displayOrderDetails(order) {
        // Header information
        document.getElementById('orderTitle').textContent = `Order #${order.id}`;
        document.getElementById('orderStatusBadge').textContent = order.status.toUpperCase();
        document.getElementById('orderStatusBadge').className = `order-status-badge ${order.status}`;
        
        // Order info
        document.getElementById('orderDate').textContent = new Date(order.date).toLocaleDateString();
        document.getElementById('customerName').textContent = order.customerInfo.name;
        document.getElementById('customerPhone').textContent = order.customerInfo.phone;
        document.getElementById('customerEmail').textContent = order.customerInfo.email;
        
        // Delivery info
        document.getElementById('deliveryDate').value = order.deliveryDate || '';
        document.getElementById('orderNotes').value = order.notes || '';
        
        // Order items
        this.displayOrderItems(order.items);
        
        // Order summary
        this.displayOrderSummary(order);
    }

    displayOrderItems(items) {
        const itemsList = document.getElementById('orderItemsList');
        let itemsHTML = '';
        
        items.forEach((item, index) => {
            itemsHTML += `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${item.image}" alt="${item.name}" />
                    </div>
                    <div class="order-item-details">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-desc">${item.description}</div>
                        <div class="order-item-price">Rs. ${item.price}/day</div>
                    </div>
                    <div class="order-item-quantity" id="quantity-${index}">
                        <span>Qty: <strong>${item.quantity}</strong></span>
                        <div class="editing-controls" style="display: none;">
                            <input type="number" class="qty-input" value="${item.quantity}" 
                                   min="1" max="10" onchange="orderManager.updateItemQuantity(${index}, this.value)">
                            <button class="cart-sidebar-remove" onclick="orderManager.removeItem(${index})">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        itemsList.innerHTML = itemsHTML;
    }

    displayOrderSummary(order) {
        const subtotal = order.total;
        const deliveryFee = 500;
        const total = subtotal + deliveryFee;
        
        document.getElementById('subtotal').textContent = `Rs. ${subtotal}`;
        document.getElementById('deliveryFee').textContent = `Rs. ${deliveryFee}`;
        document.getElementById('totalAmount').textContent = `Rs. ${total}`;
    }

    updateItemQuantity(index, newQuantity) {
        const order = this.getCurrentOrder();
        if (order && order.items[index]) {
            order.items[index].quantity = parseInt(newQuantity);
            this.updateOrderTotal(order);
            this.displayOrderSummary(order);
        }
    }

    removeItem(index) {
        if (confirm('Are you sure you want to remove this item from your order?')) {
            const order = this.getCurrentOrder();
            if (order && order.items[index]) {
                order.items.splice(index, 1);
                this.displayOrderItems(order.items);
                this.updateOrderTotal(order);
                this.displayOrderSummary(order);
            }
        }
    }

    updateOrderTotal(order) {
        order.total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getCurrentOrder() {
        return this.currentUser.orders?.find(o => o.id == this.orderId);
    }

    saveChanges() {
        const order = this.getCurrentOrder();
        if (!order) return;

        // Update delivery info
        order.deliveryDate = document.getElementById('deliveryDate').value;
        order.notes = document.getElementById('orderNotes').value;
        
        // Update user data
        this.updateUserData();
        
        // Show success message
        cartManager.showNotification('Order updated successfully!', 'success');
        
        // Exit edit mode
        this.toggleEditMode();
    }

    updateUserData() {
        localStorage.setItem('pasni_current_user', JSON.stringify(this.currentUser));
        
        // Update users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('pasni_users', JSON.stringify(this.users));
        }
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        
        const editModeDiv = document.getElementById('editMode');
        const editBtn = document.getElementById('editBtn');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const deliveryDate = document.getElementById('deliveryDate');
        const orderNotes = document.getElementById('orderNotes');
        
        if (this.editMode) {
            // Enter edit mode
            editModeDiv.style.display = 'block';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            deliveryDate.readOnly = false;
            orderNotes.readOnly = false;
            
            // Show editing controls for quantities
            document.querySelectorAll('.editing-controls').forEach(ctrl => {
                ctrl.style.display = 'flex';
                ctrl.style.gap = '10px';
                ctrl.style.alignItems = 'center';
                ctrl.style.marginTop = '10px';
            });
            
            document.querySelectorAll('.order-item-quantity').forEach(qty => {
                qty.classList.add('editing');
            });
            
        } else {
            // Exit edit mode
            editModeDiv.style.display = 'none';
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            deliveryDate.readOnly = true;
            orderNotes.readOnly = true;
            
            // Hide editing controls
            document.querySelectorAll('.editing-controls').forEach(ctrl => {
                ctrl.style.display = 'none';
            });
            
            document.querySelectorAll('.order-item-quantity').forEach(qty => {
                qty.classList.remove('editing');
            });
        }
    }

    cancelEdit() {
        // Restore original order
        const orderIndex = this.currentUser.orders.findIndex(o => o.id == this.orderId);
        if (orderIndex !== -1) {
            this.currentUser.orders[orderIndex] = JSON.parse(JSON.stringify(this.originalOrder));
            this.displayOrderDetails(this.originalOrder);
        }
        
        this.toggleEditMode();
    }
}

// Global functions for HTML onclick events
function toggleEditMode() {
    orderManager.toggleEditMode();
}

function saveChanges() {
    orderManager.saveChanges();
}

function cancelEdit() {
    orderManager.cancelEdit();
}

// Initialize order manager when page loads
let orderManager;
document.addEventListener('DOMContentLoaded', () => {
    orderManager = new OrderDetailsManager();
});
