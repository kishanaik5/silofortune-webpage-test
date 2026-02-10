
document.addEventListener('DOMContentLoaded', () => {
    // Product Slider Logic
    const slider = document.getElementById('productsSlider');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (slider && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: 340, // width of card + gap
                behavior: 'smooth'
            });
        });

        prevBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: -340,
                behavior: 'smooth'
            });
        });
    }

    // Toggle Mobile Navigation
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});
