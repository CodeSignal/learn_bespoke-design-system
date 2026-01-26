/**
 * Typography Design System Helpers
 * Utility functions for typography-related functionality
 */

/**
 * Auto-detects blockquotes that start with quote characters and adds styling classes
 * This function scans all blockquote elements and adds the 'quote' class and 
 * 'data-starts-with-quote' attribute to blockquotes that begin with quote characters.
 * 
 * @param {HTMLElement|Document} rootElement - Optional root element to search within. Defaults to document.
 * @returns {void}
 */
function detectQuoteBlockquotes(rootElement = document) {
    const blockquotes = rootElement.querySelectorAll('blockquote');
    // Common quote characters: straight quotes, curly quotes, guillemets, etc.
    const quoteChars = ['"', '\'', '\u201C', '\u201D', '\u2018', '\u2019', '\u00AB', '\u00BB', '\u201E', '\u201A'];
    
    blockquotes.forEach(blockquote => {
        // Skip if already processed
        if (blockquote.classList.contains('quote')) {
            return;
        }
        
        // Get the first text node or first paragraph's text
        const firstElement = blockquote.querySelector('p:first-child') || blockquote;
        const text = firstElement.textContent.trim();
        
        if (text && quoteChars.some(char => text.startsWith(char))) {
            blockquote.classList.add('quote');
            blockquote.setAttribute('data-starts-with-quote', 'true');
        }
    });
}

/**
 * Initialize typography helpers
 * Auto-runs quote detection when DOM is ready
 * 
 * @param {boolean} autoDetect - Whether to automatically detect quotes on load. Defaults to true.
 * @returns {void}
 */
function initTypography(autoDetect = true) {
    if (!autoDetect) {
        return;
    }
    
    // Run detection when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            detectQuoteBlockquotes();
        });
    } else {
        detectQuoteBlockquotes();
    }
}

// Export for use as ES module
export { detectQuoteBlockquotes, initTypography };

// Also support CommonJS for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        detectQuoteBlockquotes,
        initTypography
    };
}

// Auto-initialize when loaded as a script tag
if (typeof window !== 'undefined') {
    // Make functions available globally
    window.detectQuoteBlockquotes = detectQuoteBlockquotes;
    window.initTypography = initTypography;
    
    // Auto-initialize on load
    initTypography(true);
}
