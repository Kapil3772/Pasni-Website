  const slider = document.getElementById('productsSlider');
  const slideWidth = 395; // 365px card + 30px gap
  const cardsPerSlide = 3;

  let currentIndex = 0;

  const cards = Array.from(slider.children);
  const totalCards = cards.length;

  // Clone first few cards to the end
  for (let i = 0; i < cardsPerSlide; i++) {
    const clone = cards[i].cloneNode(true);
    slider.appendChild(clone);
  }

  function updateSlider() {
    slider.style.transition = 'transform 0.5s ease';
    slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  function nextSlide() {
    currentIndex++;
    updateSlider();

    if (currentIndex === totalCards) {
      setTimeout(() => {
        slider.style.transition = 'none';
        currentIndex = 0;
        slider.style.transform = `translateX(0px)`;
      }, 500);
    }
  }

  function prevSlide() {
    if (currentIndex === 0) {
      slider.style.transition = 'none';
      currentIndex = totalCards;
      slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      setTimeout(() => {
        currentIndex--;
        updateSlider();
      }, 20);
    } else {
      currentIndex--;
      updateSlider();
    }
  }

  function currentSlide(n) {
    currentIndex = n;
    updateSlider();
  }

  // Auto-slide every 5 seconds
  setInterval(nextSlide, 500000);

