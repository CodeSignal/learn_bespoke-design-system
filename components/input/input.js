/**
 * Input Component Helpers
 * Matches CodeSignal Design System
 *
 * Fixes the default browser behavior where scrolling the mouse wheel over a
 * focused `<input type="number">` increments/decrements its value. We blur the
 * input on wheel so the value stays put and the page keeps scrolling normally.
 *
 * The handler is attached once via event delegation, so it covers both existing
 * and dynamically added number inputs without re-initialization.
 */

const NUMBER_INPUT_SELECTOR = '.input[type="number"]';

function handleWheel(event) {
  const el = event.target;
  if (
    el instanceof HTMLInputElement &&
    el.matches(NUMBER_INPUT_SELECTOR) &&
    document.activeElement === el
  ) {
    // Blurring during the wheel event (before the default action runs) cancels
    // the value change because the input is no longer focused.
    el.blur();
  }
}

let documentDelegationActive = false;

/**
 * Prevent mouse-wheel scrolling from changing `.input[type="number"]` values.
 *
 * @param {Document|HTMLElement} [root=document] Scope for the listener. When
 *   `document` (the default), a single delegated listener covers every current
 *   and future number input. Pass a specific element to scope it instead.
 * @returns {() => void} A cleanup function that removes the listener.
 */
export function preventNumberInputScroll(root = document) {
  if (root === document) {
    if (!documentDelegationActive) {
      document.addEventListener('wheel', handleWheel, { passive: true });
      documentDelegationActive = true;
    }
    return () => {
      document.removeEventListener('wheel', handleWheel, { passive: true });
      documentDelegationActive = false;
    };
  }

  root.addEventListener('wheel', handleWheel, { passive: true });
  return () => root.removeEventListener('wheel', handleWheel, { passive: true });
}

function autoInit() {
  preventNumberInputScroll(document);
}

// Auto-initialize as soon as the module loads.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

export default preventNumberInputScroll;

// Also make available globally for non-module usage.
if (typeof window !== 'undefined') {
  window.preventNumberInputScroll = preventNumberInputScroll;
}
