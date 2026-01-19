/**
 * Split Panel Component
 * A resizable split panel component matching the CodeSignal Design System
 */

class SplitPanel {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('SplitPanel container not found');
    }

    // Configuration
    this.config = {
      orientation: options.orientation || 'horizontal', // 'horizontal' or 'vertical'
      initialSplit: options.initialSplit !== undefined ? options.initialSplit : 50, // Percentage (0-100)
      minLeft: options.minLeft !== undefined ? options.minLeft : 10, // Minimum percentage for left panel
      minRight: options.minRight !== undefined ? options.minRight : 10, // Minimum percentage for right panel
      disabled: options.disabled || false,
      onChange: options.onChange || null,
      ...options
    };

    // State
    this.isDragging = false;
    this.startPosition = 0;
    this.startSplit = 0;
    this.currentSplit = this.config.initialSplit; // Store current percentage to maintain ratio on resize

    // Initialize
    this.init();
  }

  init() {
    // Create split panel structure
    this.container.innerHTML = '';
    this.container.className = 'split-panel-container';
    
    if (this.config.orientation === 'vertical') {
      this.container.classList.add('vertical');
    }

    if (this.config.disabled) {
      this.container.classList.add('disabled');
    }

    // Create left panel
    this.leftPanel = document.createElement('div');
    this.leftPanel.className = 'split-panel-left';
    this.container.appendChild(this.leftPanel);

    // Create divider
    this.divider = document.createElement('div');
    this.divider.className = 'split-panel-divider';
    this.divider.setAttribute('role', 'separator');
    this.divider.setAttribute('aria-orientation', this.config.orientation);
    this.divider.setAttribute('aria-valuemin', this.config.minLeft);
    this.divider.setAttribute('aria-valuemax', 100 - this.config.minRight);
    this.divider.setAttribute('tabindex', this.config.disabled ? '-1' : '0');
    
    // Create divider handle
    const dividerHandle = document.createElement('div');
    dividerHandle.className = 'split-panel-divider-handle';
    this.divider.appendChild(dividerHandle);
    
    this.container.appendChild(this.divider);

    // Create right panel
    this.rightPanel = document.createElement('div');
    this.rightPanel.className = 'split-panel-right';
    this.container.appendChild(this.rightPanel);

    // Set initial split
    this.setSplit(this.config.initialSplit);

    // Bind events
    this.bindEvents();
    
    // Add resize observer to maintain split ratio when container resizes
    this.resizeObserver = new ResizeObserver(() => {
      // Maintain the stored percentage ratio when container resizes
      // Don't recalculate from pixels - just reapply the stored percentage
      if (!this.isDragging) {
        this.setSplit(this.currentSplit, true); // Skip callback to avoid infinite loops
      }
    });
    this.resizeObserver.observe(this.container);
  }

  bindEvents() {
    // Mouse events - use capture phase to catch events before they reach iframe
    this.divider.addEventListener('mousedown', (e) => this.startDrag(e), true);
    
    // Touch events
    this.divider.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false, capture: true });

    // Global mouse/touch events for dragging - use capture phase
    document.addEventListener('mousemove', (e) => this.handleDrag(e), true);
    document.addEventListener('mouseup', () => this.endDrag(), true);
    document.addEventListener('touchmove', (e) => this.handleDrag(e), { passive: false, capture: true });
    document.addEventListener('touchend', () => this.endDrag(), true);
    document.addEventListener('touchcancel', () => this.endDrag(), true);

    // Keyboard navigation
    this.divider.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  startDrag(e) {
    if (this.config.disabled) return;

    e.preventDefault();
    e.stopPropagation();

    this.isDragging = true;
    this.divider.classList.add('dragging');
    this.container.classList.add('dragging'); // Add class to container for CSS
    
    // Immediately disable pointer events on all panels and their children
    this.leftPanel.style.pointerEvents = 'none';
    this.rightPanel.style.pointerEvents = 'none';
    
    document.body.style.cursor = this.config.orientation === 'vertical' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    // Use stored percentage as starting point for consistent behavior
    this.startPosition = this.config.orientation === 'vertical' 
      ? (e.clientY || (e.touches && e.touches[0].clientY))
      : (e.clientX || (e.touches && e.touches[0].clientX));
    this.startSplit = this.currentSplit; // Use stored percentage, not pixel-based calculation
  }

  handleDrag(e) {
    if (!this.isDragging) return;

    e.preventDefault();

    const rect = this.container.getBoundingClientRect();
    let newSplit;

    if (this.config.orientation === 'vertical') {
      const currentPosition = e.clientY || (e.touches && e.touches[0].clientY);
      const delta = currentPosition - this.startPosition;
      const deltaPercent = (delta / rect.height) * 100;
      newSplit = this.startSplit + deltaPercent;
    } else {
      const currentPosition = e.clientX || (e.touches && e.touches[0].clientX);
      const delta = currentPosition - this.startPosition;
      const deltaPercent = (delta / rect.width) * 100;
      newSplit = this.startSplit + deltaPercent;
    }

    // Clamp to min/max values
    newSplit = Math.max(this.config.minLeft, Math.min(100 - this.config.minRight, newSplit));

    this.setSplit(newSplit, true);
  }

  endDrag() {
    if (this.isDragging) {
      this.isDragging = false;
      this.divider.classList.remove('dragging');
      this.container.classList.remove('dragging'); // Remove class from container
      
      // Re-enable pointer events on panels
      this.leftPanel.style.pointerEvents = '';
      this.rightPanel.style.pointerEvents = '';
      
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      // Fire onChange callback with final value
      if (this.config.onChange) {
        this.config.onChange(this.getSplit());
      }
    }
  }

  handleKeyDown(e) {
    if (this.config.disabled) return;

    const step = e.shiftKey ? 10 : 1;
    let newSplit = this.getSplit();

    if (this.config.orientation === 'vertical') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        newSplit = Math.min(100 - this.config.minRight, newSplit + step);
        this.setSplit(newSplit);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        newSplit = Math.max(this.config.minLeft, newSplit - step);
        this.setSplit(newSplit);
      }
    } else {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        newSplit = Math.min(100 - this.config.minRight, newSplit + step);
        this.setSplit(newSplit);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        newSplit = Math.max(this.config.minLeft, newSplit - step);
        this.setSplit(newSplit);
      }
    }

    if (e.key === 'Home') {
      e.preventDefault();
      this.setSplit(this.config.minLeft);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.setSplit(100 - this.config.minRight);
    }
  }

  setSplit(percent, skipCallback = false) {
    // Clamp to valid range
    percent = Math.max(this.config.minLeft, Math.min(100 - this.config.minRight, percent));
    
    // Store the current percentage to maintain ratio on resize
    this.currentSplit = percent;

    // Get container dimensions for min-width calculation
    const rect = this.container.getBoundingClientRect();
    const containerSize = this.config.orientation === 'vertical' ? rect.height : rect.width;
    const dividerSize = 4; // Divider's flex-basis
    
    // Calculate minimum widths in pixels based on minLeft/minRight percentages
    const minLeftPx = (containerSize * this.config.minLeft) / 100;
    const minRightPx = (containerSize * this.config.minRight) / 100;
    
    // Calculate current widths
    const leftSizePx = (containerSize * percent) / 100;
    const rightSizePx = containerSize - leftSizePx - dividerSize;

    // Set flex-basis and constraints for left panel
    this.leftPanel.style.flexBasis = `${leftSizePx}px`;
    this.leftPanel.style.flexGrow = '0';
    this.leftPanel.style.flexShrink = '1'; // Allow shrinking
    this.leftPanel.style.minWidth = `${minLeftPx}px`; // Prevent shrinking below minimum

    // Set flex-basis and constraints for right panel
    this.rightPanel.style.flexBasis = `${rightSizePx}px`;
    this.rightPanel.style.flexGrow = '0';
    this.rightPanel.style.flexShrink = '1'; // Allow shrinking
    this.rightPanel.style.minWidth = `${minRightPx}px`; // Prevent shrinking below minimum

    // Update aria attributes
    this.divider.setAttribute('aria-valuenow', Math.round(percent));

    // Fire onChange callback if not skipping
    if (!skipCallback && this.config.onChange) {
      this.config.onChange(percent);
    }
  }

  getSplit() {
    const rect = this.container.getBoundingClientRect();
    if (this.config.orientation === 'vertical') {
      return (this.leftPanel.offsetHeight / rect.height) * 100;
    } else {
      return (this.leftPanel.offsetWidth / rect.width) * 100;
    }
  }

  getLeftPanel() {
    return this.leftPanel;
  }

  getRightPanel() {
    return this.rightPanel;
  }

  setDisabled(disabled) {
    this.config.disabled = disabled;

    if (disabled) {
      this.container.classList.add('disabled');
      this.divider.setAttribute('tabindex', '-1');
    } else {
      this.container.classList.remove('disabled');
      this.divider.setAttribute('tabindex', '0');
    }
  }

  destroy() {
    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Remove event listeners and clean up
    this.container.innerHTML = '';
    this.container.className = '';
  }
}

// Export for ES6 modules
export default SplitPanel;

// Also make available globally
if (typeof window !== 'undefined') {
  window.SplitPanel = SplitPanel;
}
