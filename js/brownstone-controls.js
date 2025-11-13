/* ═══════════════════════════════════════════════════════════════════════════
   CITYBLOCKS BROWNSTONE PLAYBACK CONTROLS
   Handles all 5 playback modes + stop + sound toggle
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
        
        // Wait for DOM and modules to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        // Wait for brownstone module to load
        setTimeout(() => {
            this.gatherVideoElements();
            this.setupControlListeners();
            console.log('✅ Brownstone Controller initialized');
            console.log(`Found ${this.videos.length} video windows`);
        }, 500);
    }

    gatherVideoElements() {
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
                }
            }
        }
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

        if (sequentialBtn) sequentialBtn.addEventListener('click', () => this.playSequential());
        if (randomBtn) randomBtn.addEventListener('click', () => this.playRandom());
        if (cacophonyBtn) cacophonyBtn.addEventListener('click', () => this.playCacophony());
        if (buskerBtn) buskerBtn.addEventListener('click', () => this.playBusker());
        if (dimensionalBtn) dimensionalBtn.addEventListener('click', () => this.playDimensional());
        
        if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
        if (soundBtn) soundBtn.addEventListener('click', () => this.toggleSound());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 1: SEQUENTIAL - One video at a time, in order
    // ═══════════════════════════════════════════════════════════════════════════
    playSequential() {
        this.stop();
        this.currentMode = 'sequential';
        this.sequentialIndex = 0;
        
        console.log('▶️ Sequential Mode');
        this.playNextSequential();
    }

    playNextSequential() {
        if (this.sequentialIndex >= this.videos.length) {
            // Loop back to start
            this.sequentialIndex = 0;
        }

        const video = this.videos[this.sequentialIndex];
        video.currentTime = 0;
        video.play();

        // When this video ends, play the next one
        video.onended = () => {
            this.sequentialIndex++;
            if (this.currentMode === 'sequential') {
                this.playNextSequential();
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 2: RANDOM - One video at a time, random order
    // ═══════════════════════════════════════════════════════════════════════════
    playRandom() {
        this.stop();
        this.currentMode = 'random';
        
        console.log('🎲 Random Mode');
        this.playNextRandom();
    }

    playNextRandom() {
        const randomIndex = Math.floor(Math.random() * this.videos.length);
        const video = this.videos[randomIndex];
        
        video.currentTime = 0;
        video.play();

        // When this video ends, play another random one
        video.onended = () => {
            if (this.currentMode === 'random') {
                this.playNextRandom();
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 3: CACOPHONY - All videos at once, synchronized chaos
    // ═══════════════════════════════════════════════════════════════════════════
    playCacophony() {
        this.stop();
        this.currentMode = 'cacophony';
        
        console.log('💥 Cacophony Mode - All windows playing!');
        
        // Play all videos simultaneously
        this.videos.forEach(video => {
            video.currentTime = 0;
            video.play();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MODE 4: BUSKER MODE - Sound layering, videos play in sequence but sounds stack
    // ═══════════════════════════════════════════════════════════════════════════
    playBusker() {
        this.stop();
        this.currentMode = 'busker';
        this.sequentialIndex = 0;
        
        console.log('🎵 Busker Mode - Layering sounds!');
        this.layerNextVideo();
    }

    layerNextVideo() {
        if (this.sequentialIndex >= this.videos.length) {
            console.log('🎵 All sounds layered!');
            return;
        }

        const video = this.videos[this.sequentialIndex];
        video.currentTime = 0;
        video.play();

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
    // MODE 5: SEQUENTIAL DIMENSIONAL™ - Progressive grid formation with delays
    // ═══════════════════════════════════════════════════════════════════════════
    playDimensional() {
        this.stop();
        this.currentMode = 'dimensional';
        this.sequentialIndex = 0;
        
        console.log('📺 Sequential Dimensional™ Mode');
        this.dimensionalNext();
    }

    dimensionalNext() {
        if (this.sequentialIndex >= this.videos.length) {
            console.log('📺 All videos in dimensional grid!');
            return;
        }

        const video = this.videos[this.sequentialIndex];
        video.currentTime = 0;
        video.play();

        // Add visual indicator that this window is "live"
        const window = this.windows[this.sequentialIndex];
        window.style.borderColor = '#d4af37';
        window.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.8)';

        // Progressive delay: 2.5 seconds between each video joining
        this.dimensionalTimer = setTimeout(() => {
            this.sequentialIndex++;
            if (this.currentMode === 'dimensional') {
                this.dimensionalNext();
            }
        }, 2500);
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

        // Stop and reset all videos
        this.videos.forEach((video, index) => {
            video.pause();
            video.currentTime = 0;
            video.onended = null; // Clear event handlers
            
            // Remove dimensional visual indicators
            this.windows[index].style.borderColor = '';
            this.windows[index].style.boxShadow = '';
        });

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
