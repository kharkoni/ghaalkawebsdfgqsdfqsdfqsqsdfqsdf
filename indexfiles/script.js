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
// NAVBAR SCROLL EFFECT - verbergen bij omlaag scrollen, tonen bij omhoog scrollen
// ========================================

const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;
let scrollThreshold = 100;
let navbarTicking = false;

function updateNavbar() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > scrollThreshold) {
        if (scrollTop > lastScrollTop) {
            navbar.style.transform = 'translate3d(0, -100%, 0)';
        } else {
            navbar.style.transform = 'translate3d(0, 0, 0)';
        }
    } else {
        navbar.style.transform = 'translate3d(0, 0, 0)';
    }

    lastScrollTop = scrollTop;
    navbarTicking = false;
}

window.addEventListener('scroll', () => {
    if (!navbarTicking) {
        window.requestAnimationFrame(updateNavbar);
        navbarTicking = true;
    }
}, { passive: true });

// ========================================
// SMOOTH SCROLL
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // Hoogte van de navbar
            const targetPosition = target.offsetTop - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// SWIPER CAROUSEL
// ========================================

// Swiper starten met automatische slide-animatie
let menuSwiper;

function activateSwiperWhenReady() {
    if (typeof Swiper === 'undefined') {
        console.log("Swiper library is not loaded on this page. Skipping Swiper initialization.");
        return;
    }
    menuSwiper = new Swiper('.menuSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            968: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
    });

    // Eerste animatie
    setTimeout(() => {
        menuSwiper.slideNext(0);
        setTimeout(() => {
            menuSwiper.slidePrev(300);
        }, 100);
    }, 800);
}

// Wachten tot de pagina geladen is
if ('requestIdleCallback' in window) {
    requestIdleCallback(activateSwiperWhenReady);
} else {
    setTimeout(activateSwiperWhenReady, 800);
}

// ========================================
// VOLLEDIG MENU MODAL
// ========================================

const menuModal = document.getElementById('menuModal');
const btnMenuComplet = document.getElementById('btnMenuComplet');
const btnCommanderModal = document.getElementById('btnCommanderModal');

// Modal openen als de knop bestaat
if (btnMenuComplet) {
    btnMenuComplet.addEventListener('click', () => {
        menuModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

// Modal sluiten
function closeModal() {
    if (menuModal) {
        menuModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

if (menuModal) {
    const modalCloseBtn = menuModal.querySelector('.modal-close');
    const modalOverlayDiv = menuModal.querySelector('.modal-overlay');

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlayDiv) modalOverlayDiv.addEventListener('click', closeModal);
}

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
    });
});

// ========================================
// SCROLL ANIMATIONS
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Animatie van de panda in de franchise sectie
const pandaSticker = document.querySelector('.sticker-panda-franchise');
if (pandaSticker) {
    observer.observe(pandaSticker);
}

// Elementen om te animeren (menu-card, restaurant-card)
const animatedElements = document.querySelectorAll('.menu-card, .restaurant-card');

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    cardObserver.observe(el);
});

// ========================================
// CONTACT FORM
// ========================================

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Bericht verzonden! We antwoorden je snel.');
        contactForm.reset();
    });
}

// ========================================
// BESTELKNOP - UBER EATS
// ========================================

const btnCommander = document.querySelector('.btn-commander');
const orderLink = 'menu.html';

if (btnCommander) {
    btnCommander.addEventListener('click', () => {
        window.location.href = orderLink;
    });
}

if (btnCommanderModal) {
    btnCommanderModal.addEventListener('click', () => {
        window.location.href = orderLink;
        closeModal();
    });
}

// Parallax Hero disabled to prevent page layout jitter

// ========================================
// LOADING ANIMATION & PAGE VISIBILITY
// ========================================

window.addEventListener('load', () => {
    // Smooth fade in
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';

    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    // Als de pagina met een hash opent, scroll naar de sectie
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const offset = 100;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 300);
    }
});

// ========================================
// VERBETERDE ZICHTBAARHEID - zorgen dat de content zichtbaar is
// ========================================

// Controleren of een element in de viewport staat
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top < window.innerHeight &&
        rect.bottom > 0
    );
}

// Binnenkomstanimatie voor secties (opacity-only to prevent layout shifts and scroll jumping)
const sections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

sections.forEach(section => {
    if (!section.classList.contains('hero')) {
        section.style.opacity = '0';
        section.style.transition = 'opacity 0.6s ease';
        sectionObserver.observe(section);
    }
});

// ========================================
// KNOP TERUG NAAR BOVEN
// ========================================

const scrollToTopBtn = document.getElementById('scrollToTop');

if (scrollToTopBtn) {
    // Knop tonen/verbergen op basis van scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    // Terug naar boven bij klik
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// ORDER BUTTONS REDIRECT
// ========================================

const orderButtons = document.querySelectorAll('.btn-commander-header, .btn-commander-hero, #floatingCheckout');

orderButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'menu.html';
    });
});

console.log("Frituur Magic - Site succesvol geladen!");
