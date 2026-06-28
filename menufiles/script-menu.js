// ========================================
// MENU SIDEBAR
// ========================================

const hamburger = document.getElementById('hamburger');
const menuSidebar = document.getElementById('menuSidebar');
const menuClose = document.getElementById('menuClose');
const menuOverlay = document.getElementById('menuOverlay');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

// Menu zijbalk openen
hamburger.addEventListener('click', () => {
    menuSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Menu zijbalk sluiten
function closeSidebar() {
    menuSidebar.classList.remove('active');
    document.body.style.overflow = 'auto';
}

menuClose.addEventListener('click', closeSidebar);
menuOverlay.addEventListener('click', closeSidebar);

// Sluiten na klik op een link
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeSidebar();
    });
});

// Sluiten met Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuSidebar.classList.contains('active')) {
        closeSidebar();
    }
});

// ========================================
// NAVBAR SCROLL EFFECT
// ========================================

const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;
let scrollThreshold = 100;

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > scrollThreshold) {
        if (scrollTop > lastScrollTop) {
            // Omlaag scrollen - navbar verbergen
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Omhoog scrollen - navbar tonen
            navbar.style.transform = 'translateY(0)';
        }
    } else {
        // Bovenaan de pagina - navbar tonen
        navbar.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
});

// ========================================
// TABS NAVIGATION
// ========================================

const tabBtns = document.querySelectorAll('.tab-btn');
const menuCategories = document.querySelectorAll('.menu-category');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetCategory = btn.dataset.category;

        // Actieve tab bijwerken
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Actieve categorie bijwerken
        menuCategories.forEach(cat => cat.classList.remove('active'));
        document.getElementById(targetCategory).classList.add('active');

        // Scroll naar de producten zodat ze direct zichtbaar zijn
        const menuItemsSection = document.querySelector('.menu-items-section');
        if (menuItemsSection) {
            const offset = 20; // Kleine ruimte bovenaan
            const targetPosition = menuItemsSection.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});



// ========================================
// MENU SEARCH FILTERING
// ========================================

const menuSearchInput = document.getElementById('menuSearchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const noResultsMessage = document.getElementById('noResultsMessage');
const menuItemsContainer = document.querySelector('.menu-items-container');
const menuTabs = document.querySelector('.menu-tabs');

if (menuSearchInput) {
    menuSearchInput.addEventListener('input', () => {
        const query = menuSearchInput.value.toLowerCase().trim();
        
        if (query.length > 0) {
            // Show clear button
            if (clearSearchBtn) clearSearchBtn.style.display = 'flex';
            
            // Hide tabs menu
            if (menuTabs) menuTabs.style.display = 'none';
            
            // Add searching class to container
            if (menuItemsContainer) menuItemsContainer.classList.add('searching');
            
            let totalMatches = 0;
            
            // Process each category
            menuCategories.forEach(category => {
                let categoryMatches = 0;
                
                // Check all cards within this category
                const productCards = category.querySelectorAll('.product-card:not(.info-card)');
                const sauceCards = category.querySelectorAll('.sauce-card');
                
                productCards.forEach(card => {
                    const name = card.querySelector('.product-name').textContent.toLowerCase();
                    const description = card.querySelector('.product-description').textContent.toLowerCase();
                    
                    if (name.includes(query) || description.includes(query)) {
                        card.style.display = '';
                        categoryMatches++;
                        totalMatches++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                sauceCards.forEach(card => {
                    const name = card.querySelector('.sauce-name').textContent.toLowerCase();
                    
                    if (name.includes(query)) {
                        card.style.display = '';
                        categoryMatches++;
                        totalMatches++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Hide or show the category container and header
                if (categoryMatches > 0) {
                    category.classList.add('active');
                    category.style.display = 'block';
                    
                    // Show dynamic header if not already created
                    let header = category.querySelector('.category-search-header');
                    if (!header) {
                        header = document.createElement('h2');
                        header.className = 'category-search-header';
                        
                        // Find matching tab name
                        const tabBtn = document.querySelector(`[data-category="${category.id}"]`);
                        header.textContent = tabBtn ? tabBtn.textContent : category.id.toUpperCase();
                        
                        category.insertBefore(header, category.firstChild);
                    }
                    header.style.display = 'block';
                } else {
                    category.classList.remove('active');
                    category.style.display = 'none';
                }
            });
            
            // Show no results message if needed
            if (totalMatches === 0) {
                if (noResultsMessage) noResultsMessage.style.display = 'block';
            } else {
                if (noResultsMessage) noResultsMessage.style.display = 'none';
            }
            
        } else {
            resetSearch();
        }
    });
    
    // Clear search button click
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            menuSearchInput.value = '';
            resetSearch();
        });
    }
}

function resetSearch() {
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    if (menuTabs) menuTabs.style.display = 'flex';
    if (menuItemsContainer) menuItemsContainer.classList.remove('searching');
    if (noResultsMessage) noResultsMessage.style.display = 'none';
    
    // Restore default category visibility
    const activeTab = document.querySelector('.tab-btn.active');
    const activeCategoryId = activeTab ? activeTab.dataset.category : 'kip-friet';
    
    menuCategories.forEach(category => {
        // Reset category headers
        const header = category.querySelector('.category-search-header');
        if (header) {
            header.style.display = 'none';
        }
        
        // Reset card display styles
        const cards = category.querySelectorAll('.product-card, .sauce-card');
        cards.forEach(card => card.style.display = '');
        
        // Toggle category display
        if (category.id === activeCategoryId) {
            category.classList.add('active');
            category.style.display = 'block';
        } else {
            category.classList.remove('active');
            category.style.display = 'none';
        }
    });
}

console.log("Menu Frituur Magic geladen!");
