// ==========================================================================
// SHOPPING CART & CHECKOUT LOGIC - Frituur Magic
// ==========================================================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBGsIwsDiBAKEb65Huw--_viejhlk65LiQ",
    authDomain: "frituur-4651d.firebaseapp.com",
    databaseURL: "https://frituur-4651d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "frituur-4651d",
    storageBucket: "frituur-4651d.firebasestorage.app",
    messagingSenderId: "638724729809",
    appId: "1:638724729809:web:91304779e2e920d8048ef0",
    measurementId: "G-Y68LEH497Q"
};

// Initialize Firebase if configured, otherwise fallback to localStorage
let useFirebase = false;
let database = null;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && !firebaseConfig.apiKey.startsWith("YOUR_")) {
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        useFirebase = true;
        console.log("Firebase initialized successfully for Frituur Magic.");
    } catch (error) {
        console.warn("Failed to initialize Firebase. Falling back to localStorage:", error);
    }
} else {
    console.log("Firebase is not configured. Using localStorage fallback for orders.");
}

// Cart State Management
let cart = [];

// Load cart from sessionStorage on page load
function loadCart() {
    const savedCart = sessionStorage.getItem('magic_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
    updateCartUI();
}

// Save cart to sessionStorage
function saveCart() {
    sessionStorage.setItem('magic_cart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
    }
    saveCart();
    updateCartUI();
    openCart();
}

// Update item quantity
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
        saveCart();
        updateCartUI();
    }
}

// Remove item from cart completely
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartUI();
}

// Calculate cart total price
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculate total item count
function calculateItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Format price helper
function formatPrice(amount) {
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Update UI elements for cart
function updateCartUI() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotal = document.getElementById('cartTotal');
    const cartFloatingCount = document.getElementById('cart-floating-count');
    const cartConfirmBtn = document.getElementById('cartConfirmBtn');

    if (!cartItemsList) return;

    // Clear list
    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<div class="cart-empty-message">Uw winkelwagen is leeg.</div>';
        cartTotal.textContent = formatPrice(0);
        cartConfirmBtn.disabled = true;
        if (cartFloatingCount) cartFloatingCount.textContent = '0';
        return;
    }

    // Populate items
    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        
        row.innerHTML = `
            <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">${formatPrice(item.price)} per stuk</span>
            </div>
            <div class="cart-qty-controls">
                <button class="cart-qty-btn decrease-qty-btn" data-name="${item.name}">-</button>
                <span class="cart-qty-value">${item.quantity}</span>
                <button class="cart-qty-btn increase-qty-btn" data-name="${item.name}">+</button>
            </div>
            <button class="cart-item-remove-btn" data-name="${item.name}" aria-label="Verwijderen">×</button>
        `;
        
        cartItemsList.appendChild(row);
    });

    // Update values
    const total = calculateTotal();
    cartTotal.textContent = formatPrice(total);
    cartConfirmBtn.disabled = false;
    
    if (cartFloatingCount) {
        cartFloatingCount.textContent = calculateItemCount();
    }

    // Bind item event listeners dynamically
    cartItemsList.querySelectorAll('.decrease-qty-btn').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.name, -1));
    });
    cartItemsList.querySelectorAll('.increase-qty-btn').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.name, 1));
    });
    cartItemsList.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.name));
    });
}

// Drawer visibility controls
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

function openCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Modal visibility controls
const checkoutModal = document.getElementById('checkoutModal');
const successModal = document.getElementById('successModal');

function openCheckout() {
    closeCart();
    if (checkoutModal) {
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCheckout() {
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function openSuccess(orderCode) {
    const successOrderCode = document.getElementById('successOrderCode');
    if (successOrderCode) {
        successOrderCode.textContent = `Bestelcode: ${orderCode}`;
    }
    if (successModal) {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSuccess() {
    if (successModal) {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Fries Size Modal visibility controls
const friesSizeModal = document.getElementById('friesSizeModal');

function openFriesSizeModal() {
    if (friesSizeModal) {
        friesSizeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeFriesSizeModal() {
    if (friesSizeModal) {
        friesSizeModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Generate unique order code
function generateOrderCode() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `#MAG-${rand}`;
}

// Handle Order Placement
function handleCheckoutFormSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('customerName');
    const gsmInput = document.getElementById('customerGsm');
    const timeInput = document.getElementById('pickupTime');

    if (!nameInput || !gsmInput || !timeInput || cart.length === 0) return;

    const orderName = nameInput.value.trim();
    const orderGsm = gsmInput.value.trim();
    const orderTime = timeInput.value.trim();

    if (!orderName || !orderGsm || !orderTime) {
        alert("Vul alstublieft alle velden in.");
        return;
    }

    const orderCode = generateOrderCode();
    const orderData = {
        id: orderCode,
        customerName: orderName,
        customerGsm: orderGsm,
        pickupTime: orderTime,
        items: cart,
        totalPrice: calculateTotal(),
        timestamp: Date.now(),
        status: "pending"
    };

    if (useFirebase && database) {
        // Push to Firebase Realtime Database
        database.ref('orders/' + orderCode.replace('#', '')).set(orderData)
            .then(() => {
                onOrderSuccess(orderCode);
            })
            .catch(error => {
                console.error("Firebase push failed. Saving to local storage instead:", error);
                saveOrderLocally(orderData);
                onOrderSuccess(orderCode);
            });
    } else {
        // Fallback: save to localStorage
        saveOrderLocally(orderData);
        onOrderSuccess(orderCode);
    }
}

// Helper to save order to localStorage
function saveOrderLocally(orderData) {
    try {
        const localOrders = JSON.parse(localStorage.getItem('magic_orders') || '[]');
        localOrders.push(orderData);
        localStorage.setItem('magic_orders', JSON.stringify(localOrders));
        // Dispatch local event for testing admin on same browser
        window.dispatchEvent(new Event('storage'));
    } catch (e) {
        console.error("Failed to save order to local storage:", e);
    }
}

// Post-order processing
function onOrderSuccess(orderCode) {
    // Clear cart state
    cart = [];
    saveCart();
    updateCartUI();

    // Reset form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.reset();

    // Close checkout and open success screen
    closeCheckout();
    openSuccess(orderCode);
}

// Bind DOM Events
document.addEventListener('DOMContentLoaded', () => {
    // Load initial cart state
    loadCart();

    // Auto-open cart if URL hash is #cart
    if (window.location.hash === '#cart') {
        setTimeout(openCart, 300);
    }

    // Make header BESTELLEN button open the cart directly while on the menu page (disabled)
    /*
    const headerOrderBtn = document.querySelector('.btn-commander-header');
    if (headerOrderBtn) {
        headerOrderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }
    */

    // Product cards "Bestellen" click handler
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('add-to-cart-btn')) {
            const name = e.target.dataset.name;
            const price = e.target.dataset.price;
            if (name && price) {
                addToCart(name, price);
            }
        }
    });

    // Toggle triggers
    const cartCloseBtn = document.getElementById('cartClose');
    const cartOverlayBtn = document.getElementById('cartOverlay');
    const openCartTriggers = document.querySelectorAll('.open-cart-trigger');
    const floatingCheckoutBtn = document.getElementById('floatingCheckout');
    const cartConfirmBtn = document.getElementById('cartConfirmBtn');
    const checkoutCloseBtn = document.getElementById('checkoutClose');
    const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
    const checkoutForm = document.getElementById('checkoutForm');
    const successCloseBtn = document.getElementById('successCloseBtn');
    const successModalOverlay = document.getElementById('successModalOverlay');

    // Sidebar triggers
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartOverlayBtn) cartOverlayBtn.addEventListener('click', closeCart);
    
    openCartTriggers.forEach(trigger => {
        trigger.addEventListener('click', openCart);
    });

    if (floatingCheckoutBtn) {
        floatingCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }

    // Checkout modal triggers
    if (cartConfirmBtn) cartConfirmBtn.addEventListener('click', openCheckout);
    if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckout);
    if (checkoutModalOverlay) checkoutModalOverlay.addEventListener('click', closeCheckout);

    // Success modal triggers
    if (successCloseBtn) successCloseBtn.addEventListener('click', closeSuccess);
    if (successModalOverlay) successModalOverlay.addEventListener('click', closeSuccess);

    // Fries Size Modal triggers
    const chooseFriesBtn = document.querySelector('.choose-fries-btn');
    const friesSizeCloseBtn = document.getElementById('friesSizeClose');
    const friesSizeOverlayBtn = document.getElementById('friesSizeModalOverlay');
    const friesSizeRowBtns = document.querySelectorAll('.fries-size-row-btn');

    if (chooseFriesBtn) {
        chooseFriesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openFriesSizeModal();
        });
    }

    if (friesSizeCloseBtn) friesSizeCloseBtn.addEventListener('click', closeFriesSizeModal);
    if (friesSizeOverlayBtn) friesSizeOverlayBtn.addEventListener('click', closeFriesSizeModal);

    friesSizeRowBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            const price = btn.dataset.price;
            if (size && price) {
                addToCart(`Verse Frieten (${size})`, price);
                closeFriesSizeModal();
            }
        });
    });

    // Form submit
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutFormSubmit);
    }

    // Keyboard handlers (Escape key)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeCheckout();
            closeSuccess();
            closeFriesSizeModal();
        }
    });
});
