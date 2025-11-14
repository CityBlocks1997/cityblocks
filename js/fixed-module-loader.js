// ═══════════════════════════════════════════════════════════════════════════
// FIXED MODULE LOADER - Properly handles <style> tags in HTML modules
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Load HTML module and properly inject styles
 * @param {string} selector - CSS selector for target element
 * @param {string} url - URL of module to load
 */
async function loadModule(selector, url) {
    try {
        console.log(`📦 Loading module: ${url}`);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // Extract ALL <style> tags from the HTML
        const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
        
        if (styleMatches && styleMatches.length > 0) {
            // Process each style tag found
            styleMatches.forEach((styleTag, index) => {
                // Extract the CSS content (remove the <style> tags)
                const cssContent = styleTag.replace(/<\/?style[^>]*>/g, '');
                
                // Create a new style element
                const styleElement = document.createElement('style');
                styleElement.setAttribute('data-module', url);
                styleElement.textContent = cssContent;
                
                // Append to document head
                document.head.appendChild(styleElement);
                
                console.log(`✅ Injected style #${index + 1} from ${url}`);
            });
            
            // Remove ALL style tags from HTML before inserting
            const cleanHTML = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
            
            // Insert cleaned HTML into target element
            const targetElement = document.querySelector(selector);
            if (targetElement) {
                targetElement.innerHTML = cleanHTML;
                console.log(`✅ Module loaded: ${url}`);
            } else {
                console.error(`❌ Target element not found: ${selector}`);
            }
        } else {
            // No styles found, just insert HTML normally
            const targetElement = document.querySelector(selector);
            if (targetElement) {
                targetElement.innerHTML = html;
                console.log(`✅ Module loaded: ${url} (no styles)`);
            } else {
                console.error(`❌ Target element not found: ${selector}`);
            }
        }
        
    } catch (error) {
        console.error(`❌ Error loading module ${url}:`, error);
    }
}

/**
 * Load multiple modules in sequence
 * @param {Array} modules - Array of {selector, url} objects
 */
async function loadModules(modules) {
    console.log('🏙️ Loading CityBlocks modules...');
    
    for (const module of modules) {
        await loadModule(module.selector, module.url);
    }
    
    console.log('✅ All modules loaded successfully!');
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE - Load all modules when DOM is ready
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing CityBlocks module system...');
    
    // Load all HTML modules first
    await loadModules([
        { selector: '#header-module-container', url: 'modules/header.html' },
        { selector: '#left-sidebar-module-container', url: 'modules/sidebar-left.html' },
        { selector: '#brownstone-module-container', url: 'modules/brownstone-player.html' },
        { selector: '#right-sidebar-module-container', url: 'modules/sidebar-right.html' },
        { selector: '#video-controls-module-container', url: 'modules/video-controls.html' },
        { selector: '#footer-module-container', url: 'modules/footer.html' },
        { selector: '#modals-container', url: 'modules/modals.html' }
    ]);
    
    console.log('✅ All HTML modules loaded!');
    
    // Load JavaScript module AFTER all HTML modules are loaded
    console.log('📜 Loading brownstone-controls.js...');
    const script = document.createElement('script');
    script.src = 'js/brownstone-controls.js';
    script.onload = () => {
        console.log('✅ brownstone-controls.js loaded!');
        // Dispatch modulesLoaded event for any listeners
        window.dispatchEvent(new Event('modulesLoaded'));
        console.log('🎉 CityBlocks fully initialized!');
    };
    script.onerror = () => {
        console.error('❌ Failed to load brownstone-controls.js');
    };
    document.body.appendChild(script);
});
