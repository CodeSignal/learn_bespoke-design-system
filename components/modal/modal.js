/**
 * Modal Component
 * A customizable modal component matching the CodeSignal Design System
 */

class Modal {
  constructor(options = {}) {
    // Configuration
    this.config = {
      size: options.size || 'medium', // 'small', 'medium', 'large', 'xlarge'
      title: options.title || null,
      content: options.content || null, // Can be HTML string, DOM element, or selector
      showCloseButton: options.showCloseButton !== undefined ? options.showCloseButton : true,
      footerButtons: options.footerButtons || null, // Array of button configs or null to hide footer
      closeOnOverlayClick: options.closeOnOverlayClick !== undefined ? options.closeOnOverlayClick : true,
      closeOnEscape: options.closeOnEscape !== undefined ? options.closeOnEscape : true,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null,
      ...options
    };

    // State
    this.isOpen = false;
    this.previousActiveElement = null;
    this.bodyScrollLocked = false;

    // Create modal structure
    this.init();
  }

  init() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-labelledby', 'modal-title');

    // Create dialog
    this.dialog = document.createElement('div');
    this.dialog.className = `modal-dialog size-${this.config.size}`;

    // Create header
    this.header = document.createElement('div');
    this.header.className = 'modal-header';

    if (this.config.title) {
      this.title = document.createElement('h2');
      this.title.className = 'modal-title';
      this.title.id = 'modal-title';
      this.title.textContent = this.config.title;
      this.header.appendChild(this.title);
    }

    if (this.config.showCloseButton) {
      this.closeButton = document.createElement('button');
      this.closeButton.className = 'modal-close-button';
      this.closeButton.setAttribute('type', 'button');
      this.closeButton.setAttribute('aria-label', 'Close modal');
      this.closeButton.innerHTML = this.getCloseIcon();
      this.header.appendChild(this.closeButton);
    }

    // Only append header if it has content
    if (this.config.title || this.config.showCloseButton) {
      // Header will be appended to dialog
    } else {
      // Hide header if no title and no close button
      this.header.style.display = 'none';
    }

    // Create content area
    this.content = document.createElement('div');
    this.content.className = 'modal-content';
    this.setContent(this.config.content);

    // Create footer
    this.footer = null;
    if (this.config.footerButtons) {
      this.footer = document.createElement('div');
      this.footer.className = 'modal-footer';
      const buttonsRow = document.createElement('div');
      buttonsRow.className = 'modal-footer-buttons';
      this.createFooterButtons(buttonsRow);
      this.footer.appendChild(buttonsRow);
    }

    // Assemble structure
    if (this.config.title || this.config.showCloseButton) {
      this.dialog.appendChild(this.header);
    }
    this.dialog.appendChild(this.content);
    if (this.footer) {
      this.dialog.appendChild(this.footer);
    }
    this.overlay.appendChild(this.dialog);

    // Bind events
    this.bindEvents();

    // Append to body (but keep hidden until opened)
    document.body.appendChild(this.overlay);
  }

  setContent(content) {
    // Clear existing content
    this.content.innerHTML = '';

    if (!content) {
      return;
    }

    // Handle different content types
    if (content instanceof HTMLElement) {
      // DOM element
      this.content.appendChild(content);
    } else if (typeof content === 'object' && content.nodeType) {
      // Node object
      this.content.appendChild(content);
    } else if (typeof content === 'string') {
      // Check if it's a CSS selector first
      if (content.startsWith('#') || content.startsWith('.')) {
        // CSS selector (ID or class)
        const element = document.querySelector(content);
        if (element) {
          // Clone the element to avoid moving it from its original location
          const cloned = element.cloneNode(true);
          // Remove any hidden/display:none classes that might prevent content from showing
          cloned.classList.remove('hidden-content');
          cloned.style.display = '';
          this.content.appendChild(cloned);
        }
      } else {
        // HTML string
        this.content.innerHTML = content;
      }
    }
  }

  createFooterButtons(container) {
    if (!this.config.footerButtons || !Array.isArray(this.config.footerButtons)) {
      return;
    }

    this.config.footerButtons.forEach((buttonConfig, index) => {
      const button = document.createElement('button');
      button.className = 'button';
      
      // Determine button type
      if (buttonConfig.type === 'secondary') {
        button.classList.add('button-secondary');
      } else if (buttonConfig.type === 'tertiary') {
        button.classList.add('button-tertiary');
      } else {
        button.classList.add('button-primary');
      }

      button.textContent = buttonConfig.label || 'Button';
      
      if (buttonConfig.onClick) {
        button.addEventListener('click', (e) => {
          buttonConfig.onClick(e, this);
        });
      } else {
        // Default: close modal on click
        button.addEventListener('click', () => {
          this.close();
        });
      }

      container.appendChild(button);
    });
  }

  bindEvents() {
    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.close();
      });
    }

    // Overlay click
    if (this.config.closeOnOverlayClick) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.config.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }

    // Prevent dialog clicks from closing modal
    this.dialog.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.previousActiveElement = document.activeElement;

    // Show overlay
    this.overlay.classList.add('open');
    this.overlay.setAttribute('aria-hidden', 'false');

    // Lock body scroll
    this.lockBodyScroll();

    // Focus management
    if (this.closeButton) {
      this.closeButton.focus();
    } else if (this.title) {
      this.title.focus();
    }

    // Call onOpen callback
    if (this.config.onOpen) {
      this.config.onOpen(this);
    }
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    // Hide overlay
    this.overlay.classList.remove('open');
    this.overlay.setAttribute('aria-hidden', 'true');

    // Unlock body scroll
    this.unlockBodyScroll();

    // Restore focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }

    // Call onClose callback
    if (this.config.onClose) {
      this.config.onClose(this);
    }
  }

  lockBodyScroll() {
    if (this.bodyScrollLocked) return;
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    this.bodyScrollLocked = true;
  }

  unlockBodyScroll() {
    if (!this.bodyScrollLocked) return;
    
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    this.bodyScrollLocked = false;
  }

  updateContent(content) {
    this.setContent(content);
  }

  updateTitle(title) {
    if (this.title) {
      this.title.textContent = title;
    } else if (title) {
      // Create title if it doesn't exist
      this.title = document.createElement('h2');
      this.title.className = 'modal-title';
      this.title.id = 'modal-title';
      this.title.textContent = title;
      this.header.insertBefore(this.title, this.closeButton || null);
    }
  }

  getCloseIcon() {
    return `<span class="modal-close-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>`;
  }

  destroy() {
    // Remove event listeners
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }

    // Unlock body scroll if still locked
    this.unlockBodyScroll();

    // Remove from DOM
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

// Export for ES6 modules
export default Modal;

// Also make available globally
if (typeof window !== 'undefined') {
  window.Modal = Modal;
}

