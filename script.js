// =====================================================
// SILO FORTUNE - JavaScript Functionality
// =====================================================

document.addEventListener('DOMContentLoaded', function () {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Active Navigation Link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Filter Functionality for Tables
    const filterSelects = document.querySelectorAll('.filter-select');
    const searchInput = document.querySelector('.search-input');
    const tableRows = document.querySelectorAll('.data-table tbody tr');

    function filterTable() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const filters = {};

        filterSelects.forEach(select => {
            filters[select.dataset.filter] = select.value.toLowerCase();
        });

        tableRows.forEach(row => {
            let show = true;
            const cells = row.querySelectorAll('td');

            // Search filter
            if (searchTerm) {
                const rowText = row.textContent.toLowerCase();
                if (!rowText.includes(searchTerm)) show = false;
            }

            // Dropdown filters
            Object.keys(filters).forEach(filterKey => {
                if (filters[filterKey] && filters[filterKey] !== 'all') {
                    const cellIndex = parseInt(filterKey);
                    if (cells[cellIndex]) {
                        const cellText = cells[cellIndex].textContent.toLowerCase();
                        if (!cellText.includes(filters[filterKey])) show = false;
                    }
                }
            });

            row.style.display = show ? '' : 'none';
        });
    }

    filterSelects.forEach(select => select.addEventListener('change', filterTable));
    if (searchInput) searchInput.addEventListener('input', filterTable);

    // Animate Stats on Scroll
    const observerOptions = { threshold: 0.5, rootMargin: '0px' };

    const animateValue = (element, start, end, duration) => {
        const range = end - start;
        const startTime = performance.now();

        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (range * easeOut));

            element.textContent = current.toLocaleString() + (element.dataset.suffix || '');

            if (progress < 1) requestAnimationFrame(updateValue);
        };

        requestAnimationFrame(updateValue);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValue = entry.target.querySelector('.stat-value');
                if (statValue && !statValue.dataset.animated) {
                    const finalValue = parseInt(statValue.dataset.value) || parseInt(statValue.textContent);
                    if (!isNaN(finalValue)) {
                        statValue.dataset.animated = 'true';
                        animateValue(statValue, 0, finalValue, 1500);
                    }
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stat-card, .stat-group').forEach(card => statsObserver.observe(card));

    // Form Submission Handler
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }

    // Card Hover Effects
    const cards = document.querySelectorAll('.card, .blog-card, .team-card, .job-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });
});
