/* ═══════════════════════════════════════════════════════════════════════════
   CITYBLOCKS BROWNSTONE PLAYBACK CONTROLS - UPDATED
   Fixed: Sequential advance, Random advance, Visual highlights, Modal connections
   ═══════════════════════════════════════════════════════════════════════════ */

class BrownstoneController {
    constructor() {
        this.windows = [];
        this.videos = [];
        this.currentMode = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.sequentialIndex = 0;
        this.sequentialTimer = null;
        this.dimensionalTimer = null;
        this.customSequence = []; // For custom ordering
        this.escapeKeyHandler = null; // For dimensional overlay
        
        // Wait for DOM and modules to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
        
        // Listen for modules loaded event
        window.addEventListener('modulesLoaded', () => {
            console.log('📡 Modules loaded event received');
            setTimeout(() => this.initialize(), 1000);
        });
    }

    initialize() {
        console.log('🎬 Initializing Brownstone Controller...');
        this.gatherVideoElements();
        this.setupControlListeners();
        this.connectModalHandlers(); // Connect modals
        console.log(`✅ Brownstone Controller initialized with ${this.videos.length} videos`);
    }

    gatherVideoElements() {
        this.windows = [];
        this.videos = [];
        
        // Gather all 12 video windows
        for (let i = 1; i <= 12; i++) {
            const window = document.getElementById(`window-${i}`);
            if (window) {
                const video = window.querySelector('video');
                if (video) {
                    this.windows.push(window);
                    this.videos.push(video);
                    
                    // Ensure videos start paused
                    video.pause();
                    video.currentTime = 0;
                    
                    // Add loaded event listener
                    video.addEventListener('loadeddata', () => {
                        console.log(`📹 Video ${i} loaded`);
                    });
                    
                    // Add error listener
                    video.addEventListener('error', (e) => {
                        console.error(`❌ Video ${i} error:`, e);
                    });
                }
            }
        }
        
        console.log(`Found ${this.windows.length} windows and ${this.videos.length} videos`);
    }

    connectModalHandlers() {
        // Connect special windows to modals
        setTimeout(() => {
            const doorWindow = document.getElementById('window-door');
            const collaborateWindow = document.getElementById('window-collaborate');
            const hireWindow = document.getElementById('window-hire');

            if (doorWindow && typeof window.openModal === 'function') {
                doorWindow.addEventListener('click', () => {
                    console.log('🚪 Door clicked');
                    window.openModal('modal-welcome');
                });
                console.log('✅ Door modal connected');
            }

            if (collaborateWindow && typeof window.openModal === 'function') {
                collaborateWindow.addEventListener('click', () => {
                    console.log('🤝 Collaborate clicked');
                    window.openModal('modal-collaborate');
                });
                console.log('✅ Collaborate modal connected');
            }

            if (hireWindow && typeof window.openModal === 'function') {
                hireWindow.addEventListener('click', () => {
                    console.log('💼 Hire clicked');
                    window.openModal('modal-hire');
                });
                console.log('✅ Hire modal connected');
            }

            // Connect 12 category windows to their modals
            for (let i = 1; i <= 12; i++) {
                const categoryWindow = document.getElementById(`window-${i}`);
                if (categoryWindow && typeof window.openModal === 'function') {
                    categoryWindow.addEventListener('click', (e) => {
                        // Only open modal if not currently playing
                        if (!this.isPlaying) {
                            console.log(`🎨 Window ${i} clicked`);
                            window.openModal(`modal-window-${i}`);
                        }
                    });
                }
            }
            console.log('✅ All window modals connected');
        }, 1000);
    }

    setupControlListeners() {
        // Mode buttons
        const sequentialBtn = document.getElementById('btn-sequential');
        const randomBtn = document.getElementById('btn-random');
        const cacophonyBtn = document.getElementById('btn-cacophony');
        const buskerBtn = document.getElementById('btn-busker');
        const dimensionalBtn = document.getElementById('btn-dimensional');
        
        // Control buttons
        const stopBtn = document.getElementById('btn-stop');
        const soundBtn = document.getElementById('btn-sound-toggle');

        if (sequentialBtn) {
            sequentialBtn.addEventListener('click', () => this.playSequential());
            console.log('✅ Sequential button connected');
        }
        if (randomBtn) {
            randomBtn.addEventListener('click', () => this.playRandom());
            console.log('✅ Random button connected');
        }
        if (cacophonyBtn) {
            cacophonyBtn.addEventListener('click', () => this.playCacophony());
            console.log('✅ Cacophony button connected');
        }
        if (buskerBtn) {
            buskerBtn.addEventListener('click', () => this.playBusker());
            console.log('✅ Busker button connected');
        }
        if (dimensionalBtn) {
            dimensionalBtn.addEventListener('click', () => this.playDimensional());
            console.log('✅ Dimensional button connected');
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
            console.log('✅ Stop button connected');
        }
        if (soundBtn) {
            soundBtn.addEventListener('click', () => this.toggleSound());
            console.log('✅ Sound button connected');
        }
    }

    // Add visual highlight to playing video
    highlightWindow(index, active = true) {
        const window = this.windows[index];
        if (window) {
            if (active) {
                window.style.borderColor = '#d4af37';
                window.style.borderWidth = '3px';
                window.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.8)';
            } else {
                window.style.borderColor = '';
                window.style.borderWidth = '';
                window.style.boxShadow = '';
            }
        }
    }

    // Clear all highlights
    clearAllHighlights() {
        this.windows.forEach((window, index) => {
            this.highlightWindow(index, false);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 1: SEQUENTIAL - One video at a time, in order
    // ═══════════════════════════════════════════════════════════════════════════
    playSequential() {
        this.stop();
        this.currentMode = 'sequential';
        this.isPlaying = true;
        this.sequentialIndex = 0;
        
        console.log('▶️ Sequential Mode Started');
        this.playNextSequential();
    }

    playNextSequential() {
        if (!this.isPlaying || this.currentMode !== 'sequential') return;
        
        if (this.sequentialIndex >= this.videos.length) {
            // Loop back to start
            this.sequentialIndex = 0;
        }

        // Clear previous highlights
        this.clearAllHighlights();
        
        const video = this.videos[this.sequentialIndex];
        const currentIndex = this.sequentialIndex;
        
        // Highlight current window
        this.highlightWindow(currentIndex, true);
        
        console.log(`▶️ Playing video ${currentIndex + 1}`);
        video.currentTime = 0;
        
        // Play and handle end
        video.play().then(() => {
            video.onended = () => {
                console.log(`✓ Video ${currentIndex + 1} ended`);
                this.highlightWindow(currentIndex, false);
                this.sequentialIndex++;
                if (this.currentMode === 'sequential') {
                    setTimeout(() => this.playNextSequential(), 500);
                }
            };
        }).catch(e => console.error('Play error:', e));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 2: RANDOM - One video at a time, random order
    // ═══════════════════════════════════════════════════════════════════════════
    playRandom() {
        this.stop();
        this.currentMode = 'random';
        this.isPlaying = true;
        
        console.log('🎲 Random Mode Started');
        this.playNextRandom();
    }

    playNextRandom() {
        if (!this.isPlaying || this.currentMode !== 'random') return;
        
        // Clear previous highlights
        this.clearAllHighlights();
        
        const randomIndex = Math.floor(Math.random() * this.videos.length);
        const video = this.videos[randomIndex];
        
        // Highlight current window
        this.highlightWindow(randomIndex, true);
        
        console.log(`🎲 Playing random video ${randomIndex + 1}`);
        video.currentTime = 0;
        
        video.play().then(() => {
            video.onended = () => {
                console.log(`✓ Video ${randomIndex + 1} ended`);
                this.highlightWindow(randomIndex, false);
                if (this.currentMode === 'random') {
                    setTimeout(() => this.playNextRandom(), 500);
                }
            };
        }).catch(e => console.error('Play error:', e));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 3: CACOPHONY - All videos at once, synchronized chaos
    // ═══════════════════════════════════════════════════════════════════════════
    playCacophony() {
        this.stop();
        this.currentMode = 'cacophony';
        this.isPlaying = true;
        
        console.log('💥 Cacophony Mode - All windows playing!');
        
        // Highlight all windows
        this.windows.forEach((window, index) => {
            this.highlightWindow(index, true);
        });
        
        // Play all videos simultaneously
        this.videos.forEach((video, index) => {
            video.currentTime = 0;
            video.play().catch(e => console.error(`Video ${index + 1} play error:`, e));
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 4: BUSKER MODE - Sound layering, videos play in sequence but sounds stack
    // ═══════════════════════════════════════════════════════════════════════════
    playBusker() {
        this.stop();
        this.currentMode = 'busker';
        this.isPlaying = true;
        this.sequentialIndex = 0;
        
        console.log('🎵 Busker Mode - Layering sounds!');
        this.layerNextVideo();
    }

    layerNextVideo() {
        if (!this.isPlaying || this.currentMode !== 'busker') return;
        
        if (this.sequentialIndex >= this.videos.length) {
            console.log('🎵 All sounds layered!');
            return;
        }

        const video = this.videos[this.sequentialIndex];
        const currentIndex = this.sequentialIndex;
        
        // Highlight window
        this.highlightWindow(currentIndex, true);
        
        console.log(`🎵 Layering video ${currentIndex + 1}`);
        video.currentTime = 0;
        video.play().catch(e => console.error(`Video ${currentIndex + 1} play error:`, e));

        // Don't stop previous videos - let them continue!
        // Wait 2 seconds before starting the next layer
        this.sequentialTimer = setTimeout(() => {
            this.sequentialIndex++;
            if (this.currentMode === 'busker') {
                this.layerNextVideo();
            }
        }, 2000);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 5: SEQUENTIAL DIMENSIONAL™ - TV Production Mode with Dynamic Grids
    // Full screen overlay with 1 → 2x2 → 3x3 → 4x4 grid formations
    // ═══════════════════════════════════════════════════════════════════════════
    playDimensional() {
        this.stop();
        this.currentMode = 'dimensional';
        this.isPlaying = true;
        this.sequentialIndex = 0;
        
        console.log('📺 Sequential Dimensional™ Mode - TV Production Grids');
        
        // Create full-screen overlay
        this.createDimensionalOverlay();
        
        // Start adding videos to grid
        this.dimensionalNext();
    }

    createDimensionalOverlay() {
        // Remove existing overlay if present
        const existing = document.getElementById('dimensional-overlay');
        if (existing) existing.remove();
        
        // Create full-screen overlay
        const overlay = document.createElement('div');
        overlay.id = 'dimensional-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Close on overlay click (but not grid click)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.stop();
                this.removeDimensionalOverlay();
            }
        });
        
        // Create grid container
        const gridContainer = document.createElement('div');
        gridContainer.id = 'dimensional-grid';
        gridContainer.style.cssText = `
            display: grid;
            gap: 10px;
            width: 90vw;
            height: 90vh;
            padding: 20px;
            transition: all 0.5s ease;
        `;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Exit Full Screen';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(212, 175, 55, 0.9);
            border: 2px solid #d4af37;
            color: #000;
            padding: 10px 20px;
            font-size: 1rem;
            font-weight: bold;
            border-radius: 5px;
            cursor: pointer;
            z-index: 10001;
            transition: all 0.3s;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = '#d4af37';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(212, 175, 55, 0.9)';
        });
        closeBtn.addEventListener('click', () => {
            this.stop();
            this.removeDimensionalOverlay();
        });
        
        overlay.appendChild(gridContainer);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
        
        // Add escape key listener
        this.escapeKeyHandler = (e) => {
            if (e.key === 'Escape' && this.currentMode === 'dimensional') {
                this.stop();
                this.removeDimensionalOverlay();
            }
        };
        document.addEventListener('keydown', this.escapeKeyHandler);
        
        console.log('📺 Created dimensional overlay');
    }

    removeDimensionalOverlay() {
        const overlay = document.getElementById('dimensional-overlay');
        if (overlay) {
            // Stop all cloned videos
            const videos = overlay.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
                video.src = '';
            });
            overlay.remove();
            console.log('📺 Removed dimensional overlay');
        }
        
        // Remove escape key listener
        if (this.escapeKeyHandler) {
            document.removeEventListener('keydown', this.escapeKeyHandler);
            this.escapeKeyHandler = null;
        }
    }

    dimensionalNext() {
        if (!this.isPlaying || this.currentMode !== 'dimensional') return;
        
        if (this.sequentialIndex >= this.videos.length) {
            console.log('📺 All 12 videos in dimensional grid!');
            return;
        }

        const gridContainer = document.getElementById('dimensional-grid');
        if (!gridContainer) return;
        
        const videoIndex = this.sequentialIndex;
        const originalVideo = this.videos[videoIndex];
        
        // Clone the video element
        const videoClone = document.createElement('video');
        videoClone.src = originalVideo.querySelector('source').src;
        videoClone.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border: 2px solid #d4af37;
            border-radius: 5px;
        `;
        videoClone.muted = this.isMuted;
        videoClone.play();
        
        gridContainer.appendChild(videoClone);
        
        // Update grid layout based on number of videos
        const videoCount = this.sequentialIndex + 1;
        this.updateGridLayout(gridContainer, videoCount);
        
        console.log(`📺 Added video ${videoIndex + 1} to dimensional grid (${videoCount} total)`);
        
        // Increment and continue
        this.sequentialIndex++;
        
        // Delay before next video (2.5 seconds)
        this.dimensionalTimer = setTimeout(() => {
            if (this.currentMode === 'dimensional') {
                this.dimensionalNext();
            }
        }, 2500);
    }

    updateGridLayout(container, videoCount) {
        // Determine grid configuration
        let gridTemplate = '';
        
        if (videoCount === 1) {
            // 1 video - full screen
            gridTemplate = 'grid-template-columns: 1fr; grid-template-rows: 1fr;';
        } else if (videoCount <= 4) {
            // 2-4 videos - 2x2 grid
            gridTemplate = 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;';
        } else if (videoCount <= 9) {
            // 5-9 videos - 3x3 grid
            gridTemplate = 'grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr;';
        } else {
            // 10-12 videos - 4x4 grid (with some empty cells)
            gridTemplate = 'grid-template-columns: 1fr 1fr 1fr 1fr; grid-template-rows: 1fr 1fr 1fr;';
        }
        
        container.style.cssText = container.style.cssText.replace(/grid-template.*?;/g, '') + gridTemplate;
        
        console.log(`📺 Grid updated for ${videoCount} videos`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STOP - Stop all playback, reset all videos
    // ═══════════════════════════════════════════════════════════════════════════
    stop() {
        console.log('⏹️ Stop - Resetting all videos');
        
        // Clear any timers
        if (this.sequentialTimer) {
            clearTimeout(this.sequentialTimer);
            this.sequentialTimer = null;
        }
        if (this.dimensionalTimer) {
            clearTimeout(this.dimensionalTimer);
            this.dimensionalTimer = null;
        }

        // Remove dimensional overlay if active
        this.removeDimensionalOverlay();

        // Stop and reset all videos
        this.videos.forEach((video) => {
            video.pause();
            video.currentTime = 0;
            video.onended = null; // Clear event handlers
        });

        // Clear all highlights
        this.clearAllHighlights();

        this.currentMode = null;
        this.sequentialIndex = 0;
        this.isPlaying = false;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SOUND TOGGLE - Mute/Unmute all videos
    // ═══════════════════════════════════════════════════════════════════════════
    toggleSound() {
        this.isMuted = !this.isMuted;
        
        this.videos.forEach(video => {
            video.muted = this.isMuted;
        });

        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.textContent = this.isMuted ? '🔇 Unmute' : '🔊 Mute';
        }

        console.log(this.isMuted ? '🔇 All videos muted' : '🔊 All videos unmuted');
    }
}

// Initialize the controller
const brownstoneController = new BrownstoneController();

// Make it globally accessible for debugging
window.BrownstoneController = brownstoneController;

console.log('✅ Brownstone Controls loaded');
