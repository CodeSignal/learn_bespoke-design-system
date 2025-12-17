/**
 * Numeric Slider Component
 * A customizable numeric slider component matching the CodeSignal Design System
 */

class NumericSlider {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('NumericSlider container not found');
    }

    // Configuration
    const defaultTheme = options.theme || 'default';

    // Determine theme values - allow individual overrides or use theme preset
    let trackTheme, filledTheme, handleTheme;

    if (options.trackTheme !== undefined || options.filledTheme !== undefined || options.handleTheme !== undefined) {
      // Individual overrides provided
      trackTheme = options.trackTheme || (defaultTheme === 'primary' ? 'primary' : 'neutral');
      filledTheme = options.filledTheme || 'primary';
      handleTheme = options.handleTheme || 'primary';
    } else {
      // Use theme preset
      if (defaultTheme === 'primary') {
        trackTheme = 'primary';
        filledTheme = 'primary';
        handleTheme = 'primary';
      } else {
        // 'default' theme: neutral track, primary filled, primary handles
        trackTheme = 'neutral';
        filledTheme = 'primary';
        handleTheme = 'primary';
      }
    }

    this.config = {
      type: options.type || 'single', // 'single' or 'range'
      min: options.min !== undefined ? options.min : 0,
      max: options.max !== undefined ? options.max : 100,
      step: options.step !== undefined ? options.step : 1,
      value: options.value !== undefined ? options.value : null, // For single: number, for range: [min, max]
      showInputs: options.showInputs !== undefined ? options.showInputs : false,
      theme: defaultTheme, // 'default' or 'primary' - kept for backward compatibility
      trackTheme: trackTheme, // 'neutral' or 'primary'
      filledTheme: filledTheme, // 'neutral' or 'primary'
      handleTheme: handleTheme, // 'neutral' or 'primary'
      continuousUpdates: options.continuousUpdates !== undefined ? options.continuousUpdates : false, // Fire onChange during drag
      throttleMs: options.throttleMs !== undefined ? options.throttleMs : 16, // Throttle interval (~60fps)
      onChange: options.onChange || null,
      onInputChange: options.onInputChange || null,
      disabled: options.disabled || false,
      ...options
    };

    // State
    this.isDragging = false;
    this.activeHandle = null;
    this.startX = 0;
    this.startValue = null;
    this.lastCallbackTime = 0; // For throttling continuous updates

    // Initialize values
    if (this.config.type === 'range') {
      this.values = Array.isArray(this.config.value)
        ? [Math.max(this.config.min, this.config.value[0]), Math.min(this.config.max, this.config.value[1])]
        : [this.config.min, this.config.max];
      // Ensure min <= max
      if (this.values[0] > this.values[1]) {
        this.values = [this.values[1], this.values[0]];
      }
    } else {
      this.values = this.config.value !== null && this.config.value !== undefined
        ? Math.max(this.config.min, Math.min(this.config.max, this.config.value))
        : this.config.min;
    }

    // Initialize
    this.init();
  }

  init() {
    // Create slider structure
    this.container.innerHTML = '';
    this.container.className = 'numeric-slider-container';

    // Keep theme-primary class for backward compatibility
    if (this.config.theme === 'primary') {
      this.container.classList.add('theme-primary');
    }

    if (this.config.disabled) {
      this.container.classList.add('disabled');
    }

    if (!this.config.showInputs) {
      this.container.classList.add('hide-inputs');
    } else {
      this.container.classList.add('with-inputs');
    }

    // Generate unique ID prefix for inputs
    const containerId = this.container.id || `slider-${Math.random().toString(36).substr(2, 9)}`;
    this.inputIdPrefix = containerId;

    // Create input fields if needed
    if (this.config.showInputs) {
      if (this.config.type === 'range') {
        // Min input (left side)
        this.minInput = document.createElement('input');
        this.minInput.type = 'number';
        this.minInput.className = 'input numeric-slider-input';
        this.minInput.id = `${this.inputIdPrefix}-min`;
        this.minInput.name = `${this.inputIdPrefix}-min`;
        this.minInput.value = this.values[0];
        this.minInput.min = this.config.min;
        this.minInput.max = this.config.max;
        this.minInput.step = this.config.step;
        this.minInput.disabled = this.config.disabled;
        this.container.appendChild(this.minInput);
      } else {
        // Single value input
        this.valueInput = document.createElement('input');
        this.valueInput.type = 'number';
        this.valueInput.className = 'input numeric-slider-input';
        this.valueInput.id = `${this.inputIdPrefix}-value`;
        this.valueInput.name = `${this.inputIdPrefix}-value`;
        this.valueInput.value = this.values;
        this.valueInput.min = this.config.min;
        this.valueInput.max = this.config.max;
        this.valueInput.step = this.config.step;
        this.valueInput.disabled = this.config.disabled;
        this.container.appendChild(this.valueInput);
      }
    }

    // Create slider wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'numeric-slider-wrapper';
    this.wrapper.setAttribute('role', 'slider');
    this.wrapper.setAttribute('aria-valuemin', this.config.min);
    this.wrapper.setAttribute('aria-valuemax', this.config.max);
    this.wrapper.setAttribute('tabindex', this.config.disabled ? '-1' : '0');

    if (this.config.type === 'range') {
      this.wrapper.setAttribute('aria-valuenow', `${this.values[0]},${this.values[1]}`);
      this.wrapper.setAttribute('aria-label', `Range slider from ${this.values[0]} to ${this.values[1]}`);
    } else {
      this.wrapper.setAttribute('aria-valuenow', this.values);
      this.wrapper.setAttribute('aria-label', `Slider value ${this.values}`);
    }

    // Create track
    this.track = document.createElement('div');
    this.track.className = 'numeric-slider-track';
    if (this.config.trackTheme === 'primary') {
      this.track.classList.add('theme-primary');
    }

    // Create filled track
    this.filled = document.createElement('div');
    this.filled.className = 'numeric-slider-filled';
    if (this.config.filledTheme === 'primary') {
      this.filled.classList.add('theme-primary');
    }

    // Create handles
    if (this.config.type === 'range') {
      // Min handle
      this.minHandle = document.createElement('button');
      this.minHandle.className = 'numeric-slider-handle';
      if (this.config.handleTheme === 'primary') {
        this.minHandle.classList.add('theme-primary');
      }
      this.minHandle.setAttribute('type', 'button');
      this.minHandle.setAttribute('aria-label', `Minimum value: ${this.values[0]}`);
      this.minHandle.setAttribute('tabindex', this.config.disabled ? '-1' : '0');
      this.minHandle.disabled = this.config.disabled;

      // Max handle
      this.maxHandle = document.createElement('button');
      this.maxHandle.className = 'numeric-slider-handle';
      if (this.config.handleTheme === 'primary') {
        this.maxHandle.classList.add('theme-primary');
      }
      this.maxHandle.setAttribute('type', 'button');
      this.maxHandle.setAttribute('aria-label', `Maximum value: ${this.values[1]}`);
      this.maxHandle.setAttribute('tabindex', this.config.disabled ? '-1' : '0');
      this.maxHandle.disabled = this.config.disabled;

      this.track.appendChild(this.filled);
      this.track.appendChild(this.minHandle);
      this.track.appendChild(this.maxHandle);
    } else {
      // Single handle
      this.handle = document.createElement('button');
      this.handle.className = 'numeric-slider-handle style-marker';
      if (this.config.handleTheme === 'primary') {
        this.handle.classList.add('theme-primary');
      }
      this.handle.setAttribute('type', 'button');
      this.handle.setAttribute('aria-label', `Value: ${this.values}`);
      this.handle.setAttribute('tabindex', this.config.disabled ? '-1' : '0');
      this.handle.disabled = this.config.disabled;

      this.track.appendChild(this.filled);
      this.track.appendChild(this.handle);
    }

    this.wrapper.appendChild(this.track);
    this.container.appendChild(this.wrapper);

    // Add max input after slider wrapper for range sliders
    if (this.config.showInputs && this.config.type === 'range') {
      // Max input (right side)
      this.maxInput = document.createElement('input');
      this.maxInput.type = 'number';
      this.maxInput.className = 'input numeric-slider-input';
      this.maxInput.id = `${this.inputIdPrefix}-max`;
      this.maxInput.name = `${this.inputIdPrefix}-max`;
      this.maxInput.value = this.values[1];
      this.maxInput.min = this.config.min;
      this.maxInput.max = this.config.max;
      this.maxInput.step = this.config.step;
      this.maxInput.disabled = this.config.disabled;
      this.container.appendChild(this.maxInput);
    }

    // Update visual state
    this.updateVisuals();

    // Bind events
    this.bindEvents();
  }

  bindEvents() {
    // Track click
    this.track.addEventListener('click', (e) => {
      if (this.config.disabled || this.isDragging) return;
      if (e.target === this.track || e.target === this.filled) {
        this.handleTrackClick(e);
      }
    });

    // Handle mouse events
    if (this.config.type === 'range') {
      this.minHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'min'));
      this.maxHandle.addEventListener('mousedown', (e) => this.startDrag(e, 'max'));
    } else {
      this.handle.addEventListener('mousedown', (e) => this.startDrag(e, 'single'));
    }

    // Touch events
    if (this.config.type === 'range') {
      this.minHandle.addEventListener('touchstart', (e) => this.startDrag(e, 'min'));
      this.maxHandle.addEventListener('touchstart', (e) => this.startDrag(e, 'max'));
    } else {
      this.handle.addEventListener('touchstart', (e) => this.startDrag(e, 'single'));
    }

    // Input field events
    if (this.config.showInputs) {
      if (this.config.type === 'range') {
        this.minInput.addEventListener('input', (e) => this.handleInputChange(e, 'min'));
        this.minInput.addEventListener('blur', (e) => this.handleInputBlur(e, 'min'));
        this.maxInput.addEventListener('input', (e) => this.handleInputChange(e, 'max'));
        this.maxInput.addEventListener('blur', (e) => this.handleInputBlur(e, 'max'));
      } else {
        this.valueInput.addEventListener('input', (e) => this.handleInputChange(e, 'single'));
        this.valueInput.addEventListener('blur', (e) => this.handleInputBlur(e, 'single'));
      }
    }

    // Keyboard navigation
    this.wrapper.addEventListener('keydown', (e) => this.handleKeyDown(e));
    if (this.config.type === 'range') {
      this.minHandle.addEventListener('keydown', (e) => this.handleKeyDown(e, 'min'));
      this.maxHandle.addEventListener('keydown', (e) => this.handleKeyDown(e, 'max'));
    } else {
      this.handle.addEventListener('keydown', (e) => this.handleKeyDown(e, 'single'));
    }

    // Global mouse/touch events for dragging
    document.addEventListener('mousemove', (e) => this.handleDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchmove', (e) => this.handleDrag(e));
    document.addEventListener('touchend', () => this.endDrag());
  }

  handleTrackClick(e) {
    const rect = this.track.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const clickPercent = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    const newValue = this.config.min + clickPercent * (this.config.max - this.config.min);
    const snappedValue = this.snapToStep(newValue);

    if (this.config.type === 'range') {
      // Determine which handle is closer
      const minDist = Math.abs(snappedValue - this.values[0]);
      const maxDist = Math.abs(snappedValue - this.values[1]);

      if (minDist < maxDist) {
        this.setValue([snappedValue, this.values[1]], 'min');
      } else {
        this.setValue([this.values[0], snappedValue], 'max');
      }
    } else {
      this.setValue(snappedValue);
    }
  }

  startDrag(e, handleType) {
    if (this.config.disabled) return;

    e.preventDefault();
    e.stopPropagation();

    this.isDragging = true;
    this.activeHandle = handleType;
    this.startX = e.clientX || (e.touches && e.touches[0].clientX);

    if (handleType === 'min') {
      this.startValue = this.values[0];
      this.minHandle.classList.add('dragging');
    } else if (handleType === 'max') {
      this.startValue = this.values[1];
      this.maxHandle.classList.add('dragging');
    } else {
      this.startValue = this.values;
      this.handle.classList.add('dragging');
    }
  }

  handleDrag(e) {
    if (!this.isDragging || !this.activeHandle) return;

    e.preventDefault();

    const rect = this.track.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const percent = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    const newValue = this.config.min + percent * (this.config.max - this.config.min);
    const snappedValue = this.snapToStep(newValue);

    // Determine if we should trigger callback based on continuousUpdates and throttling
    const shouldTrigger = this.config.continuousUpdates &&
      (Date.now() - this.lastCallbackTime >= this.config.throttleMs);

    if (shouldTrigger) {
      this.lastCallbackTime = Date.now();
    }

    if (this.activeHandle === 'min') {
      const newMin = Math.max(this.config.min, Math.min(snappedValue, this.values[1]));
      this.setValue([newMin, this.values[1]], 'min', shouldTrigger);
    } else if (this.activeHandle === 'max') {
      const newMax = Math.min(this.config.max, Math.max(snappedValue, this.values[0]));
      this.setValue([this.values[0], newMax], 'max', shouldTrigger);
    } else {
      this.setValue(snappedValue, 'single', shouldTrigger);
    }
  }

  endDrag() {
    if (this.isDragging) {
      const activeHandle = this.activeHandle;
      this.isDragging = false;
      this.activeHandle = null;

      if (this.minHandle) this.minHandle.classList.remove('dragging');
      if (this.maxHandle) this.maxHandle.classList.remove('dragging');
      if (this.handle) this.handle.classList.remove('dragging');

      // Always fire onChange on drag end with final value
      if (this.config.onChange) {
        this.config.onChange(this.values, activeHandle || 'single');
      }
    }
  }

  handleInputChange(e, handleType) {
    const value = parseFloat(e.target.value);

    if (isNaN(value)) return;

    if (handleType === 'min') {
      const newMin = Math.max(this.config.min, Math.min(value, this.values[1]));
      this.setValue([newMin, this.values[1]], 'min');
    } else if (handleType === 'max') {
      const newMax = Math.min(this.config.max, Math.max(value, this.values[0]));
      this.setValue([this.values[0], newMax], 'max');
    } else {
      const clampedValue = Math.max(this.config.min, Math.min(this.config.max, value));
      this.setValue(clampedValue);
    }
  }

  handleInputBlur(e, handleType) {
    const value = parseFloat(e.target.value);

    if (isNaN(value)) {
      // Reset to current value if invalid
      if (handleType === 'min') {
        e.target.value = this.values[0];
      } else if (handleType === 'max') {
        e.target.value = this.values[1];
      } else {
        e.target.value = this.values;
      }
    } else {
      // Ensure value is within bounds
      if (handleType === 'min') {
        const newMin = Math.max(this.config.min, Math.min(value, this.values[1]));
        e.target.value = newMin;
        this.setValue([newMin, this.values[1]], 'min');
      } else if (handleType === 'max') {
        const newMax = Math.min(this.config.max, Math.max(value, this.values[0]));
        e.target.value = newMax;
        this.setValue([this.values[0], newMax], 'max');
      } else {
        const clampedValue = Math.max(this.config.min, Math.min(this.config.max, value));
        e.target.value = clampedValue;
        this.setValue(clampedValue);
      }
    }
  }

  handleKeyDown(e, handleType) {
    if (this.config.disabled) return;

    const step = e.shiftKey ? this.config.step * 10 : this.config.step;
    let newValue;

    if (this.config.type === 'range') {
      if (handleType === 'min') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          newValue = Math.min(this.values[0] + step, this.values[1]);
          this.setValue([newValue, this.values[1]], 'min');
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          newValue = Math.max(this.values[0] - step, this.config.min);
          this.setValue([newValue, this.values[1]], 'min');
        }
      } else if (handleType === 'max') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          newValue = Math.min(this.values[1] + step, this.config.max);
          this.setValue([this.values[0], newValue], 'max');
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          newValue = Math.max(this.values[1] - step, this.values[0]);
          this.setValue([this.values[0], newValue], 'max');
        }
      }
    } else {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        newValue = Math.min(this.values + step, this.config.max);
        this.setValue(newValue);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        newValue = Math.max(this.values - step, this.config.min);
        this.setValue(newValue);
      }
    }

    if (e.key === 'Home') {
      e.preventDefault();
      if (this.config.type === 'range' && handleType === 'min') {
        this.setValue([this.config.min, this.values[1]], 'min');
      } else if (this.config.type === 'range' && handleType === 'max') {
        this.setValue([this.values[0], this.config.min], 'max');
      } else {
        this.setValue(this.config.min);
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      if (this.config.type === 'range' && handleType === 'min') {
        this.setValue([this.config.max, this.values[1]], 'min');
      } else if (this.config.type === 'range' && handleType === 'max') {
        this.setValue([this.values[0], this.config.max], 'max');
      } else {
        this.setValue(this.config.max);
      }
    }
  }

  snapToStep(value) {
    return Math.round((value - this.config.min) / this.config.step) * this.config.step + this.config.min;
  }

  updateVisuals() {
    const range = this.config.max - this.config.min;

    if (this.config.type === 'range') {
      const minPercent = ((this.values[0] - this.config.min) / range) * 100;
      const maxPercent = ((this.values[1] - this.config.min) / range) * 100;

      // Position handles
      this.minHandle.style.left = `${minPercent}%`;
      this.maxHandle.style.left = `${maxPercent}%`;

      // Update filled track
      this.filled.style.left = `${minPercent}%`;
      this.filled.style.width = `${maxPercent - minPercent}%`;

      // Update inputs
      if (this.config.showInputs) {
        this.minInput.value = Math.round(this.values[0]);
        this.maxInput.value = Math.round(this.values[1]);
      }

      // Update aria attributes
      this.wrapper.setAttribute('aria-valuenow', `${this.values[0]},${this.values[1]}`);
      this.wrapper.setAttribute('aria-label', `Range slider from ${this.values[0]} to ${this.values[1]}`);
      this.minHandle.setAttribute('aria-label', `Minimum value: ${this.values[0]}`);
      this.maxHandle.setAttribute('aria-label', `Maximum value: ${this.values[1]}`);
    } else {
      const percent = ((this.values - this.config.min) / range) * 100;

      // Position handle
      this.handle.style.left = `${percent}%`;

      // Update filled track
      this.filled.style.left = '0%';
      this.filled.style.width = `${percent}%`;

      // Update input
      if (this.config.showInputs) {
        this.valueInput.value = Math.round(this.values);
      }

      // Update aria attributes
      this.wrapper.setAttribute('aria-valuenow', this.values);
      this.wrapper.setAttribute('aria-label', `Slider value ${this.values}`);
      this.handle.setAttribute('aria-label', `Value: ${this.values}`);
    }
  }

  setValue(value, source = null, triggerCallback = true) {
    if (this.config.type === 'range') {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Range slider requires an array of two values');
      }
      this.values = [
        Math.max(this.config.min, Math.min(value[0], value[1], this.config.max)),
        Math.min(this.config.max, Math.max(value[0], value[1], this.config.min))
      ];
      // Ensure min <= max
      if (this.values[0] > this.values[1]) {
        this.values = [this.values[1], this.values[0]];
      }
    } else {
      this.values = Math.max(this.config.min, Math.min(this.config.max, value));
    }

    this.updateVisuals();

    if (triggerCallback && this.config.onChange) {
      this.config.onChange(this.values, source);
    }

    if (triggerCallback && this.config.onInputChange && source) {
      this.config.onInputChange(this.values, source);
    }
  }

  getValue() {
    return this.values;
  }

  setDisabled(disabled) {
    this.config.disabled = disabled;

    if (disabled) {
      this.container.classList.add('disabled');
      this.wrapper.setAttribute('tabindex', '-1');
      if (this.minHandle) this.minHandle.setAttribute('tabindex', '-1');
      if (this.maxHandle) this.maxHandle.setAttribute('tabindex', '-1');
      if (this.handle) this.handle.setAttribute('tabindex', '-1');
      if (this.minInput) this.minInput.disabled = true;
      if (this.maxInput) this.maxInput.disabled = true;
      if (this.valueInput) this.valueInput.disabled = true;
    } else {
      this.container.classList.remove('disabled');
      this.wrapper.setAttribute('tabindex', '0');
      if (this.minHandle) this.minHandle.setAttribute('tabindex', '0');
      if (this.maxHandle) this.maxHandle.setAttribute('tabindex', '0');
      if (this.handle) this.handle.setAttribute('tabindex', '0');
      if (this.minInput) this.minInput.disabled = false;
      if (this.maxInput) this.maxInput.disabled = false;
      if (this.valueInput) this.valueInput.disabled = false;
    }
  }

  destroy() {
    // Remove event listeners and clean up
    this.container.innerHTML = '';
    this.container.className = '';
  }
}

// Export for ES6 modules
export default NumericSlider;

// Also make available globally
if (typeof window !== 'undefined') {
  window.NumericSlider = NumericSlider;
}

