
        let currentSlideIndex = 0;
        const slider = document.getElementById('productsSlider');
        const dots = document.querySelectorAll('.dot');
        const totalSlides = 4; // Number of slide positions
        const cardsPerSlide = 3; // Cards visible at once

        function updateSlider() {
            const slideWidth = 330; // 300px card width + 30px gap
            slider.style.transform = `translateX(-${currentSlideIndex * slideWidth}px)`;
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlideIndex);
            });
        }

        function nextSlide() {
            currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
            updateSlider();
        }

        function prevSlide() {
            currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
        }

        function currentSlide(n) {
            currentSlideIndex = n - 1;
            updateSlider();
        }

        // Auto-slide every 5 seconds
        setInterval(nextSlide, 5000);