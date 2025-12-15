/**
 * Horizontal Cards Component
 * A horizontal scrolling card carousel component matching the CodeSignal Design System
 */

class HorizontalCards {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      throw new Error('HorizontalCards container not found');
    }

    // Configuration
    this.config = {
      cards: options.cards || [],
      cardWidth: options.cardWidth || 480,
      cardGap: options.cardGap || 24, // --UI-Spacing-spacing-mxl
      scrollOffset: options.scrollOffset || 520, // cardWidth + gap
      showNavigation: options.showNavigation !== false, // default true
      onCardChange: options.onCardChange || null,
      ...options
    };

    // State
    this.currentIndex = 0;
    this.scrollPosition = 0;
    this.centerPadding = 0; // Will be calculated based on viewport

    // Initialize
    this.init();
  }

  init() {
    // Create component structure
    this.container.innerHTML = '';
    this.container.className = 'horizontal-cards-container';
    
    // Create scroll wrapper
    this.scrollWrapper = document.createElement('div');
    this.scrollWrapper.className = 'horizontal-cards-scroll';
    
    // Create cards track
    this.track = document.createElement('div');
    this.track.className = 'horizontal-cards-track';
    
    // Create cards
    this.config.cards.forEach((cardData, index) => {
      const card = this.createCard(cardData, index);
      this.track.appendChild(card);
    });
    
    // Assemble scroll wrapper
    this.scrollWrapper.appendChild(this.track);
    
    // Append scroll wrapper to container first
    this.container.appendChild(this.scrollWrapper);
    
    // Create navigation buttons if enabled (after scroll wrapper so it appears below)
    if (this.config.showNavigation) {
      this.navContainer = document.createElement('div');
      this.navContainer.className = 'horizontal-cards-nav';
      
      this.prevButton = this.createNavButton('prev', this.getChevronLeftIcon());
      this.nextButton = this.createNavButton('next', this.getChevronRightIcon());
      
      this.navContainer.appendChild(this.prevButton);
      this.navContainer.appendChild(this.nextButton);
      
      this.container.appendChild(this.navContainer);
    }
    
    // Bind events
    this.bindEvents();
    
    // Calculate center padding and set initial position after a brief delay
    // to ensure viewport dimensions are available
    requestAnimationFrame(() => {
      this.calculateCenterPadding();
      // Force a layout recalculation to ensure padding is applied
      void this.scrollWrapper.offsetHeight;
      void this.track.offsetHeight;
      // Use scrollToIndex to ensure proper centering
      this.scrollToIndex(0);
      // Update state after positioning
      requestAnimationFrame(() => {
        this.updateState();
      });
    });
  }

  createCard(cardData, index) {
    const card = document.createElement('div');
    card.className = 'horizontal-cards-card';
    if (index === 0) {
      card.classList.add('horizontal-cards-card-active');
    }
    card.setAttribute('data-index', index);
    
    const content = document.createElement('div');
    content.className = 'horizontal-cards-card-content';
    
    // Title (supports HTML)
    if (cardData.title) {
      const title = document.createElement('h3');
      title.className = 'horizontal-cards-card-title heading-small strong';
      title.innerHTML = cardData.title;
      content.appendChild(title);
    }
    
    // Description (supports HTML)
    if (cardData.description) {
      const description = document.createElement('p');
      description.className = 'horizontal-cards-card-description body-medium';
      description.innerHTML = cardData.description;
      content.appendChild(description);
    }
    
    // Action area (only show if actionHtml or actionPlaceholder is provided)
    if (cardData.actionHtml) {
      const action = document.createElement('div');
      action.className = 'horizontal-cards-card-action';
      action.innerHTML = cardData.actionHtml;
      content.appendChild(action);
    } else if (cardData.actionPlaceholder) {
      const action = document.createElement('div');
      action.className = 'horizontal-cards-card-action';
      const placeholder = document.createElement('span');
      placeholder.className = 'horizontal-cards-card-action-placeholder';
      placeholder.textContent = cardData.actionPlaceholder;
      action.appendChild(placeholder);
      content.appendChild(action);
    }
    
    card.appendChild(content);
    return card;
  }

  createNavButton(direction, iconSvg) {
    const button = document.createElement('button');
    button.className = 'horizontal-cards-nav-button';
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', direction === 'prev' ? 'Previous card' : 'Next card');
    button.setAttribute('data-direction', direction);
    
    const icon = document.createElement('span');
    icon.className = 'horizontal-cards-nav-button-icon';
    icon.innerHTML = iconSvg;
    
    button.appendChild(icon);
    
    // Click handler
    button.addEventListener('click', () => {
      if (direction === 'prev') {
        this.scrollToPrevious();
      } else {
        this.scrollToNext();
      }
    });
    
    return button;
  }

  bindEvents() {
    // Scroll event
    this.scrollWrapper.addEventListener('scroll', () => {
      this.updateState();
    });
    
    // Keyboard navigation
    this.scrollWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.scrollToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.scrollToNext();
      }
    });
    
    // Make scroll wrapper focusable for keyboard navigation
    this.scrollWrapper.setAttribute('tabindex', '0');
    this.scrollWrapper.setAttribute('role', 'region');
    this.scrollWrapper.setAttribute('aria-label', 'Horizontal cards carousel');
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.scrollWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.scrollWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    });
    
    // Resize observer to update state on container resize
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculateCenterPadding();
        this.updateState();
        // Re-center current card after resize
        if (this.currentIndex >= 0) {
          this.scrollToIndex(this.currentIndex);
        }
      });
      this.resizeObserver.observe(this.scrollWrapper);
    }
  }

  handleSwipe(touchStartX, touchEndX) {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next
        this.scrollToNext();
      } else {
        // Swipe right - previous
        this.scrollToPrevious();
      }
    }
  }

  calculateCenterPadding() {
    // Calculate padding needed to center cards
    // Use getBoundingClientRect for accurate measurements
    const scrollRect = this.scrollWrapper.getBoundingClientRect();
    const viewportWidth = scrollRect.width;
    
    // Get actual card width from first card if available, otherwise use config
    let actualCardWidth = this.config.cardWidth;
    const firstCard = this.track.querySelector('.horizontal-cards-card');
    if (firstCard) {
      const cardRect = firstCard.getBoundingClientRect();
      actualCardWidth = cardRect.width;
    }
    
    // Calculate padding to center the card: (viewport width - card width) / 2
    this.centerPadding = Math.max(0, (viewportWidth - actualCardWidth) / 2);
    
    // Apply padding to track for centering
    this.track.style.paddingLeft = `${this.centerPadding}px`;
    this.track.style.paddingRight = `${this.centerPadding}px`;
  }

  scrollToNext() {
    const currentIndex = this.currentIndex;
    if (currentIndex < this.config.cards.length - 1) {
      this.scrollToIndex(currentIndex + 1);
    }
  }

  scrollToPrevious() {
    const currentIndex = this.currentIndex;
    if (currentIndex > 0) {
      this.scrollToIndex(currentIndex - 1);
    }
  }

  scrollToIndex(index) {
    if (index < 0 || index >= this.config.cards.length) {
      return;
    }
    
    // Recalculate center padding to ensure it's current
    this.calculateCenterPadding();
    
    // Get actual measurements
    const scrollRect = this.scrollWrapper.getBoundingClientRect();
    const viewportWidth = scrollRect.width;
    
    // Get actual card width from DOM
    const cards = this.track.querySelectorAll('.horizontal-cards-card');
    let actualCardWidth = this.config.cardWidth;
    let actualCardGap = this.config.cardGap;
    
    if (cards.length > 0) {
      const firstCardRect = cards[0].getBoundingClientRect();
      actualCardWidth = firstCardRect.width;
      
      // Calculate gap from actual card positions if we have multiple cards
      if (cards.length > 1) {
        const secondCardRect = cards[1].getBoundingClientRect();
        actualCardGap = secondCardRect.left - firstCardRect.right;
      }
    }
    
    // For index 0, scroll should be 0 since padding already centers it
    if (index === 0) {
      this.scrollWrapper.scrollTo({
        left: 0,
        behavior: index === this.currentIndex ? 'auto' : 'smooth'
      });
      return;
    }
    
    // For other cards, calculate scroll position
    // Card's position from the start of the track content (after padding)
    const cardOffsetFromTrackStart = index * (actualCardWidth + actualCardGap);
    
    // Card center relative to track start (including padding)
    const cardCenterFromTrackStart = this.centerPadding + cardOffsetFromTrackStart + (actualCardWidth / 2);
    const viewportCenter = viewportWidth / 2;
    
    // Scroll position is how much we need to scroll the track to align centers
    const scrollPosition = cardCenterFromTrackStart - viewportCenter;
    
    // Ensure we don't scroll past the bounds
    const maxScroll = this.track.scrollWidth - viewportWidth;
    const clampedScroll = Math.max(0, Math.min(scrollPosition, maxScroll));
    
    this.scrollWrapper.scrollTo({
      left: clampedScroll,
      behavior: 'smooth'
    });
  }

  updateState() {
    const scrollLeft = this.scrollWrapper.scrollLeft;
    const scrollWidth = this.track.scrollWidth;
    const clientWidth = this.scrollWrapper.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    
    // Calculate current card index based on scroll position
    // Account for center padding when calculating which card is visible
    const adjustedScroll = scrollLeft + (clientWidth - this.config.cardWidth) / 2;
    const cardPosition = adjustedScroll - this.centerPadding;
    const newIndex = Math.round(cardPosition / (this.config.cardWidth + this.config.cardGap));
    const clampedIndex = Math.max(0, Math.min(newIndex, this.config.cards.length - 1));
    
    // Update navigation buttons
    if (this.config.showNavigation) {
      this.prevButton.disabled = clampedIndex === 0;
      this.nextButton.disabled = clampedIndex === this.config.cards.length - 1;
    }
    
    // Update current index if changed
    if (clampedIndex !== this.currentIndex) {
      this.currentIndex = clampedIndex;
      
      // Update active card class
      const cards = this.track.querySelectorAll('.horizontal-cards-card');
      cards.forEach((card, index) => {
        if (index === clampedIndex) {
          card.classList.add('horizontal-cards-card-active');
        } else {
          card.classList.remove('horizontal-cards-card-active');
        }
      });
      
      // Call callback
      if (this.config.onCardChange) {
        this.config.onCardChange(clampedIndex, this.config.cards[clampedIndex]);
      }
    }
    
    this.scrollPosition = scrollLeft;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getCurrentCard() {
    return this.config.cards[this.currentIndex] || null;
  }

  // SVG Icons
  getChevronLeftIcon() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  getChevronRightIcon() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  destroy() {
    // Remove event listeners and clean up
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.container.innerHTML = '';
    this.container.className = '';
  }
}

// Export for ES6 modules
export default HorizontalCards;

// Also make available globally
if (typeof window !== 'undefined') {
  window.HorizontalCards = HorizontalCards;
}

