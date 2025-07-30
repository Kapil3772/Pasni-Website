// Emergency fix for admin dashboard
// Run this in your browser console (F12)

console.log('=== EMERGENCY ADMIN FIX ===');

// 1. Clear any corrupted data
localStorage.removeItem('adminProducts');
localStorage.removeItem('adminOrders');
console.log('Cleared existing data');

// 2. Add test products
const testProducts = [
    {
        id: 1,
        name: 'Traditional Decoration Set',
        price: 299.99,
        category: 'decoration',
        image: 'assets/one.png',
        description: 'Beautiful traditional decoration set for ceremonies'
    },
    {
        id: 2,
        name: 'Flower Arrangement',
        price: 199.99,
        category: 'flowers',
        image: 'assets/two.png',
        description: 'Fresh flower arrangement for special occasions'
    },
    {
        id: 3,
        name: 'Catering Package',
        price: 499.99,
        category: 'catering',
        image: 'assets/three.png',
        description: 'Complete catering package for events'
    }
];

localStorage.setItem('adminProducts', JSON.stringify(testProducts));
console.log('Added test products:', testProducts.length);

// 3. Force recreate global functions
window.editProduct = function(productId) {
    console.log('EMERGENCY editProduct called with ID:', productId);
    
    const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const product = products.find(p => p.id == productId);
    
    if (product) {
        // Show edit form
        const form = document.getElementById('addProductForm');
        if (form) {
            form.style.display = 'block';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productDescription').value = product.description;
            console.log('Edit form populated for:', product.name);
        } else {
            alert('Product: ' + product.name + ' (ID: ' + productId + ')');
        }
    } else {
        console.error('Product not found:', productId);
        alert('Product not found: ' + productId);
    }
};

window.deleteProduct = function(productId) {
    console.log('EMERGENCY deleteProduct called with ID:', productId);
    
    if (confirm('Delete this product?')) {
        const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const filtered = products.filter(p => p.id != productId);
        localStorage.setItem('adminProducts', JSON.stringify(filtered));
        console.log('Product deleted, reloading...');
        location.reload();
    }
};

// 4. Force reload the page
setTimeout(() => {
    console.log('Reloading page in 2 seconds...');
    location.reload();
}, 2000);

console.log('=== EMERGENCY FIX COMPLETE ===');
console.log('Page will reload automatically...');
