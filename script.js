// Slider functionality
class ProductSlider {
  constructor() {
    this.slider = null;
    this.cards = [];
    this.totalCards = 0;
    this.cardWidth = 350; // 320px width + 30px gap
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.allCards = [];
    this.startIndex = 2;
    this.autoSlideInterval = null;
    
    this.initializeSlider();
  }

  initializeSlider() {
    // Wait for products to be loaded by cartManager
    if (typeof cartManager === 'undefined' || !cartManager.products || cartManager.products.length === 0) {
      setTimeout(() => this.initializeSlider(), 100);
      return;
    }
    
    this.loadDynamicProducts();
    this.setupSliderElements();
    this.setupInfiniteLoop();
    this.initializeSliderPosition();
    this.bindEvents();
    this.updateCards();
    this.startAutoSlide();
  }

  loadDynamicProducts() {
    const products = cartManager.products;
    const sliderContainer = document.getElementById('dynamicProductsSlider');
    const dotsContainer = document.getElementById('dynamicSliderDots');
    
    if (!sliderContainer || !dotsContainer) return;

    // Generate product cards HTML
    sliderContainer.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-card-title">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/placeholder.png'">
        </div>
      </div>
    `).join('');

    // Generate dots HTML
    dotsContainer.innerHTML = products.map((_, index) => `
      <span class="dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
    `).join('');

    this.totalCards = products.length;
  }

  setupSliderElements() {
    this.slider = document.querySelector('.products-slider');
    this.cards = Array.from(this.slider.children);
    this.prevBtn = document.querySelector('.slider-btn.prev');
    this.nextBtn = document.querySelector('.slider-btn.next');
    
    if (!this.slider || this.cards.length === 0) {
      console.error('Slider elements not found or no products loaded');
      return;
    }
  }

  setupInfiniteLoop() {
    if (this.totalCards < 2) return; // Need at least 2 cards for infinite loop
    
    // Clone first two and last two cards for infinite scrolling
    const firstCard = this.cards[0].cloneNode(true);
    const secondCard = this.cards[1] ? this.cards[1].cloneNode(true) : this.cards[0].cloneNode(true);
    const lastCard = this.cards[this.totalCards - 1].cloneNode(true);
    const secondLastCard = this.cards[this.totalCards - 2] ? this.cards[this.totalCards - 2].cloneNode(true) : this.cards[this.totalCards - 1].cloneNode(true);
    
    // Add clones at the beginning and end
    this.slider.insertBefore(secondLastCard, this.slider.firstChild);
    this.slider.insertBefore(lastCard, this.slider.firstChild);
    this.slider.appendChild(firstCard);
    this.slider.appendChild(secondCard);
    
    // Update card references
    this.allCards = Array.from(this.slider.children);
    this.currentIndex = this.startIndex;
  }

  initializeSliderPosition() {
    if (!this.slider) return;
    
    // Position slider to show first real card in center of 3-card view
    const initialTransform = -(this.currentIndex * this.cardWidth - this.cardWidth);
    this.slider.style.transform = `translateX(${initialTransform}px)`;
    this.slider.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  }

  updateCards() {
    if (!this.allCards || this.allCards.length === 0) return;
    
    // Remove all active classes
    this.allCards.forEach(card => card.classList.remove('active'));
    
    // Add active class to center card
    if (this.allCards[this.currentIndex]) {
      this.allCards[this.currentIndex].classList.add('active');
    }
    
    // Update dots if they exist
    const dots = document.querySelectorAll('.dot');
    if (dots.length > 0) {
      const realIndex = (this.currentIndex - this.startIndex + this.totalCards) % this.totalCards;
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === realIndex);
      });
    }
  }

  slide(direction) {
    if (this.isTransitioning || !this.slider) return;
    
    this.isTransitioning = true;
    
    if (direction === 'next') {
      this.currentIndex++;
    } else {
      this.currentIndex--;
    }
    
    // Calculate transform for 3-card view with center positioning
    const newTransform = -(this.currentIndex * this.cardWidth - this.cardWidth);
    
    this.slider.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    this.slider.style.transform = `translateX(${newTransform}px)`;
    
    // Handle infinite loop wraparound
    setTimeout(() => {
      if (this.currentIndex >= this.allCards.length - 2) {
        // Wrapped past last real card, jump to beginning
        this.currentIndex = this.startIndex;
        this.slider.style.transition = 'none';
        const wrapTransform = -(this.currentIndex * this.cardWidth - this.cardWidth);
        this.slider.style.transform = `translateX(${wrapTransform}px)`;
      } else if (this.currentIndex <= 1) {
        // Wrapped before first real card, jump to end
        this.currentIndex = this.allCards.length - 3;
        this.slider.style.transition = 'none';
        const wrapTransform = -(this.currentIndex * this.cardWidth - this.cardWidth);
        this.slider.style.transform = `translateX(${wrapTransform}px)`;
      }
      
      this.updateCards();
      
      // Re-enable transition after a frame
      requestAnimationFrame(() => {
        if (this.slider) {
          this.slider.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        this.isTransitioning = false;
      });
    }, 600);
    
    this.updateCards();
  }

  goToSlide(index) {
    if (this.isTransitioning || !this.slider) return;
    
    this.currentIndex = this.startIndex + index;
    const newTransform = -(this.currentIndex * this.cardWidth - this.cardWidth);
    
    this.slider.style.transform = `translateX(${newTransform}px)`;
    this.updateCards();
  }

  bindEvents() {
    // Navigation buttons
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.slide('next'));
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.slide('prev'));
    
    // Dots navigation
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Pause auto-slide on hover
    if (this.slider) {
      this.slider.addEventListener('mouseenter', () => this.stopAutoSlide());
      this.slider.addEventListener('mouseleave', () => this.startAutoSlide());
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.slider) {
        const newTransform = -(this.currentIndex * this.cardWidth - this.cardWidth);
        this.slider.style.transform = `translateX(${newTransform}px)`;
      }
    });
  }

  startAutoSlide() {
    this.stopAutoSlide(); // Clear any existing interval
    this.autoSlideInterval = setInterval(() => {
      if (!this.isTransitioning) {
        this.slide('next');
      }
    }, 4000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  // Method to refresh slider when products are updated
  refresh() {
    this.stopAutoSlide();
    this.loadDynamicProducts();
    this.setupSliderElements();
    this.setupInfiniteLoop();
    this.initializeSliderPosition();
    this.updateCards();
    this.startAutoSlide();
  }
}

// Global slider instance
let productSlider = null;

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for cartManager to initialize
  setTimeout(() => {
    productSlider = new ProductSlider();
  }, 200);
});

// Listen for product updates from admin
window.addEventListener('storage', function(e) {
  if (e.key === 'pasni_products' && productSlider) {
    setTimeout(() => {
      productSlider.refresh();
    }, 100);
  }
});

