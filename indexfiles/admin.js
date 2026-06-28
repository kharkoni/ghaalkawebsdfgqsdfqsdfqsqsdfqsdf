// ==========================================================================
// ADMIN DASHBOARD LOGIC - Frituur Magic
// ==========================================================================

// Firebase Configuration (Should match the client-side configuration)
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
        console.log("Firebase initialized successfully for Frituur Magic Admin.");
    } catch (error) {
        console.warn("Failed to initialize Firebase. Falling back to localStorage:", error);
    }
}

// State
let orders = [];
let activeFilter = 'pending'; // 'pending' or 'completed'
let knownOrderIds = new Set();
let isFirstLoad = true;

// Synthesize a notification chime sound (Web Audio API)
function playChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Chime note 1
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc1.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.35);

        // Chime note 2
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.47);
        osc2.start(audioCtx.currentTime + 0.12);
        osc2.stop(audioCtx.currentTime + 0.47);
        
        // Chime note 3
        const osc3 = audioCtx.createOscillator();
        const gain3 = audioCtx.createGain();
        osc3.connect(gain3);
        gain3.connect(audioCtx.destination);
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
        gain3.gain.setValueAtTime(0.08, audioCtx.currentTime + 0.24);
        gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.65);
        osc3.start(audioCtx.currentTime + 0.24);
        osc3.stop(audioCtx.currentTime + 0.65);
    } catch (e) {
        console.warn("Audio Context block or unsupported:", e);
    }
}

// Authentication Check
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    const loginContainer = document.getElementById('loginContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');

    if (isLoggedIn) {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'flex';
        initOrdersListener();
        requestNotificationPermission();
    } else {
        loginContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
    }
}

// Handle login submit
function handleLogin(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Verify credentials (1 / 1)
    if (username === '1' && password === '1') {
        sessionStorage.setItem('admin_logged_in', 'true');
        loginError.style.display = 'none';
        usernameInput.value = '';
        passwordInput.value = '';
        checkAuth();
        requestNotificationPermission();
    } else {
        loginError.style.display = 'block';
    }
}

// Handle logout click
function handleLogout() {
    sessionStorage.setItem('admin_logged_in', 'false');
    // Clear state
    orders = [];
    knownOrderIds.clear();
    isFirstLoad = true;
    checkAuth();
}

// Format currency
function formatPrice(amount) {
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Format timestamp to date string
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('nl-BE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize Orders Listener
function initOrdersListener() {
    if (useFirebase && database) {
        // Realtime Database listener
        database.ref('orders').on('value', (snapshot) => {
            const data = snapshot.val();
            const loadedOrders = [];
            
            if (data) {
                Object.keys(data).forEach(key => {
                    loadedOrders.push({
                        ...data[key],
                        // Ensure ID starts with #
                        id: data[key].id.startsWith('#') ? data[key].id : '#' + data[key].id
                    });
                });
            }
            
            // Sort by timestamp descending
            loadedOrders.sort((a, b) => b.timestamp - a.timestamp);
            
            processOrdersUpdate(loadedOrders);
        });
    } else {
        // LocalStorage polling fallback
        const loadFromLocal = () => {
            const localOrders = JSON.parse(localStorage.getItem('magic_orders') || '[]');
            localOrders.sort((a, b) => b.timestamp - a.timestamp);
            processOrdersUpdate(localOrders);
        };

        // Initial load
        loadFromLocal();

        // Listen to storage event (updates if another tab modifies orders)
        window.addEventListener('storage', loadFromLocal);

        // Also poll every 3 seconds just in case of local testing updates
        setInterval(loadFromLocal, 3000);
    }
}

// Process new orders list, compute stats, trigger notifications
function processOrdersUpdate(newOrders) {
    // Detect new pending orders to play chime sound
    let hasNewPendingOrder = false;
    let newOrderData = null;

    newOrders.forEach(order => {
        const orderId = order.id;
        if (!knownOrderIds.has(orderId)) {
            // New order seen
            if (!isFirstLoad && order.status === 'pending') {
                hasNewPendingOrder = true;
                newOrderData = order;
            }
            knownOrderIds.add(orderId);
        }
    });

    if (isFirstLoad) {
        isFirstLoad = false;
    }

    if (hasNewPendingOrder) {
        playChime();
        if (newOrderData) {
            triggerNativeNotification(newOrderData);
        }
    }

    orders = newOrders;
    updateStats();
    renderOrders();
}

// Calculate and update stats cards
function updateStats() {
    const statsPending = document.getElementById('statsPending');
    const statsCompleted = document.getElementById('statsCompleted');
    const statsRevenue = document.getElementById('statsRevenue');

    if (!statsPending || !statsCompleted || !statsRevenue) return;

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    
    // Revenue sum of completed orders
    const revenueSum = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (parseFloat(o.totalPrice) || 0), 0);

    statsPending.textContent = pendingCount;
    statsCompleted.textContent = completedCount;
    statsRevenue.textContent = formatPrice(revenueSum);
}

// Render filtered list of orders
function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    const ordersSectionTitle = document.getElementById('ordersSectionTitle');
    
    if (!ordersGrid) return;

    ordersGrid.innerHTML = '';

    const filtered = orders.filter(o => o.status === activeFilter);

    if (activeFilter === 'pending') {
        ordersSectionTitle.textContent = 'Inkomende Bestellingen';
    } else {
        ordersSectionTitle.textContent = 'Afgehaalde Bestellingen';
    }

    if (filtered.length === 0) {
        ordersGrid.innerHTML = `
            <div class="no-orders-message">
                Er zijn momenteel geen ${activeFilter === 'pending' ? 'inkomende' : 'afgehaalde'} bestellingen.
            </div>
        `;
        return;
    }

    filtered.forEach(order => {
        const card = document.createElement('div');
        card.className = `order-card ${order.status}`;
        
        // Item rows
        let itemsHtml = '';
        if (Array.isArray(order.items)) {
            order.items.forEach(item => {
                itemsHtml += `
                    <div class="order-item-line">
                        <span class="order-item-qty-name"><span class="order-item-qty">${item.quantity}x</span> ${item.name}</span>
                        <span class="order-item-price">${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `;
            });
        }

        // Action buttons based on status
        let actionsHtml = '';
        if (order.status === 'pending') {
            actionsHtml = `
                <div class="order-actions">
                    <button class="action-btn complete" data-id="${order.id}">✓ Afgehaald</button>
                    <button class="action-btn delete" data-id="${order.id}" aria-label="Verwijderen">×</button>
                </div>
            `;
        } else {
            actionsHtml = `
                <div class="order-actions">
                    <button class="action-btn delete" data-id="${order.id}" aria-label="Verwijderen">×</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="order-card-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status-badge status-${order.status}">
                    ${order.status === 'pending' ? 'In afwachting' : 'Afgehaald'}
                </span>
            </div>
            <div class="order-body">
                <div class="customer-info-box">
                    <div class="customer-name">${order.customerName}</div>
                    <a href="tel:${order.customerGsm.replace(/\s+/g, '')}" class="customer-gsm">
                        📞 ${order.customerGsm}
                    </a>
                    <div style="margin-top: 8px; font-weight: 800; font-size: 15px; color: var(--primary-rose); display: flex; align-items: center; gap: 6px;">
                        ⏱️ Afhalen om: <span style="background: rgba(251, 209, 13, 0.15); border: 1px solid rgba(251, 209, 13, 0.3); padding: 2px 8px; border-radius: 6px; color: var(--primary-rose);">${order.pickupTime || 'Niet opgegeven'}</span>
                    </div>
                </div>
                <div class="order-items-list">
                    ${itemsHtml}
                </div>
                <div class="order-time-row">
                    <span>Besteld om:</span>
                    <span>${formatTimestamp(order.timestamp)}</span>
                </div>
            </div>
            <div class="order-card-footer">
                <div class="order-total-block">
                    <span class="order-total-lbl">Te betalen:</span>
                    <span class="order-total-val">${formatPrice(order.totalPrice)}</span>
                </div>
                ${actionsHtml}
            </div>
        `;

        ordersGrid.appendChild(card);
    });

    // Bind action listeners
    ordersGrid.querySelectorAll('.action-btn.complete').forEach(btn => {
        btn.addEventListener('click', () => markAsCompleted(btn.dataset.id));
    });
    
    ordersGrid.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => deleteOrder(btn.dataset.id));
    });
}

// Mark order as completed
function markAsCompleted(orderId) {
    if (useFirebase && database) {
        database.ref('orders/' + orderId.replace('#', '')).update({
            status: 'completed'
        }).catch(err => {
            console.error("Firebase update failed:", err);
        });
    } else {
        // LocalStorage fallback
        try {
            const localOrders = JSON.parse(localStorage.getItem('magic_orders') || '[]');
            const order = localOrders.find(o => o.id === orderId);
            if (order) {
                order.status = 'completed';
                localStorage.setItem('magic_orders', JSON.stringify(localOrders));
                // Reload UI
                processOrdersUpdate(localOrders);
            }
        } catch (e) {
            console.error("Local status update failed:", e);
        }
    }
}

// Delete order
function deleteOrder(orderId) {
    if (!confirm(`Weet u zeker dat u bestelling ${orderId} wilt verwijderen?`)) {
        return;
    }

    if (useFirebase && database) {
        database.ref('orders/' + orderId.replace('#', '')).remove()
            .catch(err => {
                console.error("Firebase deletion failed:", err);
            });
    } else {
        // LocalStorage fallback
        try {
            let localOrders = JSON.parse(localStorage.getItem('magic_orders') || '[]');
            localOrders = localOrders.filter(o => o.id !== orderId);
            localStorage.setItem('magic_orders', JSON.stringify(localOrders));
            
            // Remove from known IDs so sound can play if placed again
            knownOrderIds.delete(orderId);
            
            // Reload UI
            processOrdersUpdate(localOrders);
        } catch (e) {
            console.error("Local deletion failed:", e);
        }
    }
}

// Request permission for system notifications
function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log("Notification permission state:", permission);
            });
        }
    }
}

// Trigger native OS notification
function triggerNativeNotification(order) {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            let itemsText = '';
            if (Array.isArray(order.items)) {
                itemsText = order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
            }
            
            const notification = new Notification(`Nieuwe Bestelling! ${order.id}`, {
                body: `${order.customerName} (${order.customerGsm})\n⏱️ Afhaaltijd: ${order.pickupTime || '?'}\nTotaal: ${formatPrice(order.totalPrice)}\nProducten: ${itemsText}`,
                icon: 'indexfiles/friethuis-logo.png',
                badge: 'indexfiles/friethuis-logo.png',
                tag: order.id,
                requireInteraction: true
            });

            notification.onclick = function() {
                window.focus();
                this.close();
            };
        } catch (err) {
            console.warn("Failed to display system notification:", err);
        }
    }
}

// Bind event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial Auth check
    checkAuth();

    // Request notification permission if already logged in
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
        requestNotificationPermission();
    }

    // Forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Filters toggles
    const togglePending = document.getElementById('togglePending');
    const toggleCompleted = document.getElementById('toggleCompleted');

    if (togglePending && toggleCompleted) {
        togglePending.addEventListener('click', () => {
            togglePending.classList.add('active');
            toggleCompleted.classList.remove('active');
            activeFilter = 'pending';
            renderOrders();
        });

        toggleCompleted.addEventListener('click', () => {
            toggleCompleted.classList.add('active');
            togglePending.classList.remove('active');
            activeFilter = 'completed';
            renderOrders();
        });
    }
});
