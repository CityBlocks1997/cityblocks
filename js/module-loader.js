/* ═══════════════════════════════════════════════════════════════════════════
   CITYBLOCKS MODULE LOADER
   Loads all modules into their designated containers
   ═══════════════════════════════════════════════════════════════════════════ */

// Module configuration - defines which modules to load and where
const moduleConfig = {
    'header-module-container': 'modules/header.html',
    'left-sidebar-module-container': 'modules/sidebar-left.html',
    'brownstone-module-container': 'modules/brownstone-player.html',
    'right-sidebar-module-container': 'modules/sidebar-right.html',
    'video-controls-module-container': 'modules/video-controls.html',
    'footer-module-container': 'modules/footer.html',
    'modals-container': 'modules/modals.html'
};

// Load a single module
async function loadModule(containerId, modulePath) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    // Show loading state
    container.classList.add('module-loading');
    
    try {
        const response = await fetch(modulePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load ${modulePath}: ${response.status}`);
        }
        
        const html = await response.text();
        container.innerHTML = html;
        container.classList.remove('module-loading');
        
        console.log(`✅ Module loaded: ${modulePath}`);
        
        // Execute any scripts in the loaded module
        executeModuleScripts(container);
        
    } catch (error) {
        console.error(`❌ Error loading module ${modulePath}:`, error);
        container.classList.remove('module-loading');
        container.classList.add('module-error');
        container.innerHTML = `<div style="text-align: center;">
            <p><strong>Module Load Error</strong></p>
            <p style="font-size: 0.9em;">${modulePath}</p>
            <p style="font-size: 0.8em; margin-top: 10px;">${error.message}</p>
        </div>`;
    }
}

// Execute scripts within a loaded module
function executeModuleScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

// Load all modules
async function loadAllModules() {
    console.log('🚀 Loading CityBlocks modules...');
    
    const loadPromises = Object.entries(moduleConfig).map(([containerId, modulePath]) => {
        return loadModule(containerId, modulePath);
    });
    
    await Promise.all(loadPromises);
    
    console.log('✅ All modules loaded successfully!');
    
    // Dispatch custom event when all modules are loaded
    window.dispatchEvent(new Event('modulesLoaded'));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllModules);
} else {
    loadAllModules();
}

// Export for debugging
window.CityBlocksModules = {
    reload: loadAllModules,
    loadModule: loadModule,
    config: moduleConfig
};
