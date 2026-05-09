// carousel.js
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('scroll-wrapper');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    // ONLY run the logic if these elements exist on the current page
    if (wrapper && nextBtn && prevBtn) {
        
        nextBtn.addEventListener('click', () => {
            wrapper.scrollBy({ left: 300, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            wrapper.scrollBy({ left: -300, behavior: 'smooth' });
        });

        wrapper.addEventListener('scroll', () => {
            let scrollLeft = wrapper.scrollLeft;
            let maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

            prevBtn.classList.toggle('hidden', scrollLeft <= 0);
            nextBtn.classList.toggle('hidden', scrollLeft >= maxScroll);
        });
        
        // Trigger once to set initial button state
        wrapper.dispatchEvent(new Event('scroll'));
    }
});