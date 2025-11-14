// BROWNSTONE MODULE JAVASCRIPT - ALL FUNCTIONS
// Extracted from working Beautiful_site_before_digital_ocean_index.html

// SOUND MANAGEMENT
let soundEnabled = false;

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-toggle-btn');
    const allVideos = document.querySelectorAll('video');
    
    allVideos.forEach(video => {
        video.muted = !soundEnabled;
    });
    
    if (soundEnabled) {
        btn.innerHTML = '<div>🔊 Sound</div><div style="font-size: 0.75em; font-weight: normal; margin-top: 3px; opacity: 0.9;">Sound ON</div>';
        btn.style.background = 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
    } else {
        btn.innerHTML = '<div>🔇 Sound</div><div style="font-size: 0.75em; font-weight: normal; margin-top: 3px; opacity: 0.9;">Click to unmute</div>';
        btn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
    }
}

// Playback system
let playbackQueue = [];
let currentPlaybackIndex = 0;
let isPlaying = false;
let currentVideoElement = null;
let playbackMode = null;

// Busker Mode variables
let buskerModeActive = false;
let buskerWindows = new Set(); // Tracks which windows are in the busker loop

// ACTIVE BUTTON MANAGEMENT - Cassette Player Effect
function setActiveButton(buttonElement) {
    // Remove active class from all playback buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active-playback');
    });
    // Add active class to clicked button
    if (buttonElement) {
        buttonElement.classList.add('active-playback');
    }
}

function clearActiveButtons() {
    document.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('active-playback');
    });
}

const categoryOrder = ['animators', 'composers', 'cosplayers', 'filmmakers', 'gamedev', 'illustrators', 
                       'musicians', 'performers', 'producers', 'agencies', 'voice', 'writers'];

const categoryNames = {
    animators: 'Animators (Aurora)',
    composers: 'Composers (Bill)',
    cosplayers: 'Cosplayers (Cecil)',
    filmmakers: 'Filmmakers (Fergus)',
    gamedev: 'Game Developers (Finley)',
    illustrators: 'Visual Artists (Harriet)',
    musicians: 'Musicians (Lars)',
    performers: 'Performers (Magnuson)',
    producers: 'Producers (Zeno)',
    agencies: 'Talent Agencies (Phoenix)',
    voice: 'Voice Actors (Skeleton)',
    writers: 'Writers (Una)'
};

// BUSKER MODE - Toggle input field on/off
function toggleBuskerMode() {
    buskerModeActive = !buskerModeActive;
    const buskerBtn = document.getElementById('busker-btn');
    const buskerInputArea = document.getElementById('busker-input-area');
    
    if (buskerModeActive) {
        // Stop any other playback first
        if (isPlaying) {
            stopPlayback();
        }
        
        playbackMode = 'busker';
        setActiveButton(buskerBtn); // Activate button with green glow!
        
        // Show input field
        buskerInputArea.style.display = 'block';
        buskerBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
        buskerBtn.innerHTML = '<div>🎸 Busker Mode</div><div style="font-size: 0.75em; font-weight: normal; margin-top: 3px; opacity: 0.9;">Active ✓</div>';
        
        document.getElementById('playback-status').textContent = 
            '🎸 Busker Mode Active! Enter window numbers to layer sounds.';
        
        console.log('✅ Busker Mode ACTIVATED');
    } else {
        // Hide input field and stop all busker windows
        buskerInputArea.style.display = 'none';
        document.getElementById('sequence-history').style.display = 'none'; // Hide history too
        playbackMode = null;
        clearActiveButtons(); // Remove green glow!
        buskerBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        buskerBtn.innerHTML = '<div>🎸 Busker Mode</div><div style="font-size: 0.75em; font-weight: normal; margin-top: 3px; opacity: 1; color: rgba(26, 26, 46, 0.85);">Layer sounds</div>';
        
        // Stop all busker windows
        buskerWindows.forEach(category => {
            const windowElement = document.getElementById(`window-${category}`);
            const videoElement = windowElement.querySelector('video');
            windowElement.classList.remove('busker-playing');
            videoElement.pause();
            videoElement.currentTime = 0;
            videoElement.loop = false;
        });
        buskerWindows.clear();
        
        document.getElementById('playback-status').textContent = '';
        console.log('❌ Busker Mode DEACTIVATED');
    }
}

// BUSKER MODE - Play sequence of looping windows
function playBuskerSequence() {
    if (!buskerModeActive) {
        console.log('❌ Busker mode not active');
        return;
    }
    
    const input = document.getElementById('busker-sequence').value;
    
    if (!input || input.trim() === '') {
        return; // Nothing entered, don't do anything
    }
    
    // STOP ALL CURRENT WINDOWS FIRST (so new sequence starts fresh!)
    buskerWindows.forEach(category => {
        const windowElement = document.getElementById(`window-${category}`);
        const videoElement = windowElement.querySelector('video');
        windowElement.classList.remove('busker-playing');
        videoElement.pause();
        videoElement.currentTime = 0;
    });
    buskerWindows.clear();
    
    // Show what was entered in history
    document.getElementById('last-sequence').textContent = input;
    document.getElementById('sequence-history').style.display = 'block';
    
    const rawNumbers = input.split(',').map(n => parseInt(n.trim()));
    
    // DON'T clear input - let user modify and try again!
    // They can clear it themselves when ready for next sequence
    
    // Process sequence with delays
    processSequenceWithDelays(rawNumbers, 0);
}

// NEW: Process sequence step-by-step with delays
function processSequenceWithDelays(sequence, index) {
    if (index >= sequence.length) {
        // Sequence complete
        return;
    }
    
    const num = sequence[index];
    
    // Check if it's a pause/delay
    if (num === 0) {
        console.log('⏸️ Delay before next layer...');
        document.getElementById('playback-status').textContent = 
            `⏸️ Waiting... (next layer coming in 1.5s)`;
        
        // Wait 1.5 seconds, then process next number
        setTimeout(() => {
            processSequenceWithDelays(sequence, index + 1);
        }, 1500);
        return;
    }
    
    // Check if it's a valid window number
    if (num >= 1 && num <= 12) {
        const category = categoryOrder[num - 1];
        
        // Add window if not already playing
        if (!buskerWindows.has(category)) {
            buskerWindows.add(category);
            const windowElement = document.getElementById(`window-${category}`);
            const videoElement = windowElement.querySelector('video');
            
            windowElement.classList.add('busker-playing');
            videoElement.loop = true;
            videoElement.currentTime = 0;
            videoElement.muted = !soundEnabled;
            videoElement.play().catch(err => console.log('Playback prevented:', err));
            
            console.log(`🔊 Added to layer: ${category} (window ${num})`);
        }
        
        // Update status
        const windowNames = Array.from(buskerWindows).map(cat => categoryNames[cat].split(' (')[0]).join(', ');
        document.getElementById('playback-status').textContent = 
            `🎸 Layering ${buskerWindows.size} window${buskerWindows.size !== 1 ? 's' : ''}: ${windowNames}`;
    }
    
    // Process next number immediately (unless it was a 0)
    setTimeout(() => {
        processSequenceWithDelays(sequence, index + 1);
    }, 100); // Small delay to prevent UI freezing
}

// REMOVED OLD createBuskerPause function - no longer needed!

function playSequential() {
    if (buskerModeActive) {
        toggleBuskerMode(); // Exit busker mode first
    }
    stopPlayback(); // Clean slate
    playbackQueue = [...categoryOrder];
    currentPlaybackIndex = 0;
    setActiveButton(event.target.closest('button')); // Activate button with green glow!
    startPlayback();
}

function playRandom() {
    if (buskerModeActive) {
        toggleBuskerMode(); // Exit busker mode first
    }
    stopPlayback(); // Clean slate
    playbackQueue = [...categoryOrder];
    for (let i = playbackQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playbackQueue[i], playbackQueue[j]] = [playbackQueue[j], playbackQueue[i]];
    }
    currentPlaybackIndex = 0;
    setActiveButton(event.target.closest('button')); // Activate button with green glow!
    startPlayback();
}

function playCustomSequence() {
    if (buskerModeActive) {
        toggleBuskerMode(); // Exit busker mode first
    }
    stopPlayback(); // Clean slate
    
    const input = document.getElementById('custom-sequence').value;
    const numbers = input.split(',').map(n => parseInt(n.trim())).filter(n => n >= 1 && n <= 12);
    
    if (numbers.length === 0) {
        document.getElementById('playback-status').textContent = '❌ Please enter valid numbers (1-12)';
        setTimeout(() => {
            document.getElementById('playback-status').textContent = '';
        }, 3000);
        return;
    }
    
    // Convert numbers to category names (1=animators, 2=composers, etc.)
    playbackQueue = numbers.map(num => categoryOrder[num - 1]);
    currentPlaybackIndex = 0;
    startPlayback();
    
    document.getElementById('playback-status').textContent = `🎯 Playing custom sequence: ${input}`;
}

function playLoopLayer() {
    if (buskerModeActive) {
        toggleBuskerMode(); // Exit busker mode first
    }
    stopPlayback(); // Clean slate
    playbackMode = 'loop-layer';
    isPlaying = true;
    setActiveButton(event.target.closest('button')); // Activate button with green glow!
    
    // Pick one random window to be the "voice above the crowd" (louder)
    const spotlightIndex = Math.floor(Math.random() * categoryOrder.length);
    const spotlightCategory = categoryOrder[spotlightIndex];
    
    document.getElementById('playback-status').textContent = 
        `🎚️ Cacophony: All 12 playing! "${categoryNames[spotlightCategory].split(' (')[0]}" above the crowd!`;
    
    categoryOrder.forEach((category, index) => {
        const windowElement = document.getElementById(`window-${category}`);
        const videoElement = windowElement.querySelector('video');
        
        windowElement.classList.add('playing');
        videoElement.loop = true;
        videoElement.currentTime = 0;
        videoElement.muted = !soundEnabled;
        
        // Set volume levels - spotlight gets 100%, others get 30-60% randomly
        if (index === spotlightIndex) {
            videoElement.volume = 1.0; // Full volume for spotlight
            console.log(`🔊 SPOTLIGHT: ${category} at 100%`);
        } else {
            videoElement.volume = 0.3 + (Math.random() * 0.3); // Random 30-60%
            console.log(`🔉 ${category} at ${Math.round(videoElement.volume * 100)}%`);
        }
        
        videoElement.play().catch(err => console.log('Playback prevented:', err));
    });
}

function startPlayback() {
    isPlaying = true;
    playNextVideo();
}

function playNextVideo() {
    if (!isPlaying || currentPlaybackIndex >= playbackQueue.length) {
        if (currentPlaybackIndex >= playbackQueue.length) {
            document.getElementById('playback-status').textContent = '✅ Complete!';
            setTimeout(() => {
                document.getElementById('playback-status').textContent = '';
            }, 2000);
        }
        isPlaying = false;
        return;
    }

    const category = playbackQueue[currentPlaybackIndex];
    const windowElement = document.getElementById(`window-${category}`);
    const videoElement = windowElement.querySelector('video');

    document.getElementById('playback-status').textContent = 
        `Now Playing: ${categoryNames[category]} (${currentPlaybackIndex + 1}/12)`;

    windowElement.classList.add('playing');
    
    videoElement.loop = false;
    videoElement.currentTime = 0;
    videoElement.muted = !soundEnabled;
    videoElement.play();
    currentVideoElement = videoElement;

    videoElement.onended = function() {
        windowElement.classList.remove('playing');
        currentPlaybackIndex++;
        setTimeout(() => {
            playNextVideo();
        }, 300);
    };
}

function stopPlayback() {
    // Exit busker mode if active
    if (buskerModeActive) {
        const buskerStep = document.querySelector('.busker-step');
        buskerStep.classList.remove('active');
        buskerModeActive = false;
        buskerWindows.clear();
    }
    
    isPlaying = false;
    currentPlaybackIndex = 0;
    playbackQueue = [];
    playbackMode = null;
    clearActiveButtons(); // Remove green glow from all buttons!

    const allWindows = document.querySelectorAll('.category-window');
    allWindows.forEach(window => {
        window.classList.remove('playing', 'busker-playing', 'busker-active');
        window.style.cursor = 'default';
        const video = window.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
            video.loop = false;
            video.onended = null;
        }
    });

    document.getElementById('playback-status').textContent = 'Playback stopped';
    setTimeout(() => {
        document.getElementById('playback-status').textContent = '';
    }, 2000);
}

// INITIALIZE EVENT LISTENERS - Wait for DOM to be ready
function initializeEventListeners() {
    // Add Enter key support for input fields
    const buskerInput = document.getElementById('busker-sequence');
    if (buskerInput) {
        buskerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                playBuskerSequence();
            }
        });
    }

    const customInput = document.getElementById('custom-sequence');
    if (customInput) {
        customInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                playCustomSequence();
            }
        });
    }

    // Add click handlers to category windows (when NOT in busker mode)
    document.querySelectorAll('.category-window').forEach(window => {
        window.addEventListener('click', function(e) {
            if (!buskerModeActive) {
                const category = this.dataset.category;
                if (categoryInfo[category]) {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal(category);
                }
            }
        });
    });

    // Add click handlers to community list items
    const categoryMap = ['animators', 'composers', 'cosplayers', 'filmmakers', 'gamedev', 'illustrators', 'musicians', 'performers', 'producers', 'agencies', 'voice', 'writers'];
    document.querySelectorAll('.community-list li').forEach((item, index) => {
        item.addEventListener('click', function() {
            openModal(categoryMap[index]);
        });
    });

    // Add click handlers for sidebar items
    document.querySelectorAll('.sidebar-list li').forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('How it Works')) {
                openInfoModal('how-it-works');
            } else if (text.includes('About')) {
                openInfoModal('about');
            }
        });
    });

    // Add click handler for Customize button
    const customizeBtn = document.querySelector('.sidebar-btn');
    if (customizeBtn) {
        customizeBtn.addEventListener('click', function() {
            openInfoModal('customize');
        });
    }

    // Add click handlers for Featured Creators
    document.querySelectorAll('.featured-creators li').forEach((item, index) => {
        item.addEventListener('click', function() {
            openInfoModal('featured-creator', index + 1);
        });
    });

    console.log('✅ Event listeners initialized!');
}

// Call initialization after a short delay to ensure DOM is ready
setTimeout(initializeEventListeners, 100);

// MODAL FUNCTIONALITY
const categoryInfo = {
    animators: {
        title: "Animators",
        description: "Bring stories to life through motion and visual storytelling. From 2D traditional animation to 3D CGI, motion graphics, and stop motion.",
        icon: "🎞️"
    },
    composers: {
        title: "Composers",
        description: "Create original musical scores and soundtracks. Craft melodies, harmonies, and arrangements that enhance visual media and standalone works.",
        icon: "🎼"
    },
    cosplayers: {
        title: "Cosplayers",
        description: "Embody characters through costume design, makeup, and performance. Showcase craftsmanship and character interpretation.",
        icon: "🦸‍♂️"
    },
    filmmakers: {
        title: "Filmmakers",
        description: "Create cinematic experiences through directing, cinematography, and post-production. Tell stories through the lens.",
        icon: "🎥"
    },
    gamedev: {
        title: "Game Developers",
        description: "Design and develop interactive experiences. From indie games to AAA titles, create worlds that players can explore and enjoy.",
        icon: "🎮"
    },
    illustrators: {
        title: "Visual Artists",
        description: "Create visual artwork including illustrations, graphics, digital art, and traditional media. Express ideas through visual language.",
        icon: "🖼️"
    },
    musicians: {
        title: "Musicians",
        description: "Perform and create music across all genres. From instrumentalists to vocalists, bring rhythm and melody to life.",
        icon: "🥁"
    },
    performers: {
        title: "Performers",
        description: "Bring energy through dance, theater, and live performance. Captivate audiences with movement and expression.",
        icon: "💃"
    },
    producers: {
        title: "Producers",
        description: "Oversee creative projects from concept to completion. Manage resources, timelines, and bring visions to reality.",
        icon: "💰"
    },
    agencies: {
        title: "Talent Agencies",
        description: "Connect creators with opportunities. Represent and promote talented individuals across all creative disciplines.",
        icon: "💼"
    },
    voice: {
        title: "Voice Actors",
        description: "Bring characters to life through voice. From animation to audiobooks, podcasts to video games.",
        icon: "🎙️"
    },
    writers: {
        title: "Writers",
        description: "Craft stories, scripts, lyrics, and content. From screenwriting to novels, poetry to journalism.",
        icon: "✍️"
    },
    collaborate: {
        title: "Let's Collaborate",
        description: "Interested in creating something together? Collaboration is at the heart of CityBlocks! Whether you want to contribute to our Community Library, join forces on a creative project, or simply connect with other artists, this is your starting point. Send us a message with your ideas, and let's make something amazing together!",
        icon: "🤝"
    },
    hire: {
        title: "For Hire",
        description: "Looking to hire talented creators? Browse our community of voice actors, animators, musicians, writers, and more! Each creator on CityBlocks showcases their unique skills and style. Click on any category to explore available talent, view their work, and connect directly. Professional creativity is just a click away!",
        icon: "💼"
    }
};

function openModal(category) {
    const modal = document.getElementById('category-modal');
    const info = categoryInfo[category];
    
    if (!info) return;
    
    document.getElementById('modal-title').innerHTML = `${info.icon} ${info.title}`;
    document.getElementById('modal-description').textContent = info.description;
    
    // Show creator list placeholder
    document.getElementById('creator-list').innerHTML = '<p style="color: #d4af37; font-style: italic;">Featured creators coming soon...</p>';
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('category-modal').style.display = 'none';
    // Reset creator section visibility
    document.getElementById('modal-creators').style.display = 'block';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('category-modal');
    if (event.target == modal) {
        closeModal();
    }
}


// New function to handle info modals
function openInfoModal(type, number) {
    const modal = document.getElementById('category-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalCreators = document.getElementById('modal-creators');
    
    // Hide creator section for info pages
    modalCreators.style.display = 'none';
    
    if (type === 'how-it-works') {
        modalTitle.innerHTML = '📺 How It Works';
        modalDescription.innerHTML = `
            <p><strong>CityBlocks is your creative playground!</strong></p>
            <br>
            <p><strong>🎵 Play Modes:</strong></p>
            <ul style="margin-left: 20px; line-height: 2;">
                <li><strong>Sequential:</strong> Play all 12 windows in order</li>
                <li><strong>Random:</strong> Shuffle and surprise yourself</li>
                <li><strong>Cacophony:</strong> All windows at once - pure creative chaos!</li>
                <li><strong>Custom:</strong> Choose your own sequence (e.g., 1,5,9)</li>
                <li><strong>Busker Mode:</strong> Layer sounds with delayed entrances - type numbers like 11,0,2 (solo, wait, harmony joins!)</li>
            </ul>
            <br>
            <p><strong>🎸 Tips:</strong></p>
            <ul style="margin-left: 20px; line-height: 2;">
                <li>Click windows to learn about each creator category</li>
                <li>Hover over windows to preview videos</li>
                <li>In Busker Mode, use "0" for a 1.5-second delay before the next layer</li>
                <li>Experiment! There are no rules - just have fun!</li>
            </ul>
        `;
    } else if (type === 'about') {
        modalTitle.innerHTML = 'ℹ️ About CityBlocks';
        modalDescription.innerHTML = `
            <p><strong>Where Pure Creativity Resides</strong></p>
            <br>
            <p>CityBlocks is the Hollywood Squares of Creativity - where EVERYONE becomes a composer by simply choosing which windows play.</p>
            <br>
            <p>It's Facebook meets YouTube meets Ad-Libs, but instead of passively watching, you're actively creating.</p>
            <br>
            <p><strong>Our Mission:</strong> Bring families and friends together through creative play. No news, no politics, no pharmaceutical ads - just good old-fashioned fun!</p>
            <br>
            <p><strong>For Everyone:</strong> From kids mixing silly sounds to professionals discovering hidden talent - creativity for all, discoveries happen naturally.</p>
            <br>
            <p><em>"Even if we're just a passing novelty, they'll remember it with joy. Mission accomplished."</em></p>
        `;
    } else if (type === 'customize') {
        modalTitle.innerHTML = '🏠 Customize Your Own Brownstone';
        modalDescription.innerHTML = `
            <p><strong>Coming Soon!</strong></p>
            <br>
            <p>Soon you'll be able to create your own personalized brownstone with:</p>
            <ul style="margin-left: 20px; line-height: 2;">
                <li><strong>Custom Brick Colors:</strong> Choose your brownstone's look</li>
                <li><strong>Upload Your Videos:</strong> Fill windows with your own content</li>
                <li><strong>Select from Library:</strong> Browse community samples</li>
                <li><strong>Feature Other Creators:</strong> Collaborate and cross-promote</li>
                <li><strong>Share Your Brownstone:</strong> Get your own cityblocks.com/yourname URL</li>
            </ul>
            <br>
            <p style="color: #d4af37;"><strong>Join the waiting list to be an early customizer!</strong></p>
            <br>
            <p><em>For now, enjoy experimenting with our demo brownstone and all its playback modes!</em></p>
        `;
    } else if (type === 'featured-creator') {
        modalTitle.innerHTML = `⭐ Featured Creator #${number}`;
        modalDescription.innerHTML = `
            <p><strong>Coming Soon!</strong></p>
            <br>
            <p>This talented creator will soon be showcased here with:</p>
            <ul style="margin-left: 20px; line-height: 2;">
                <li>Their unique brownstone</li>
                <li>Featured performances</li>
                <li>Collaboration opportunities</li>
                <li>Bio and creative journey</li>
            </ul>
            <br>
            <p style="color: #d4af37; font-style: italic;">Be an early adopter and claim your Featured Creator spot!</p>
        `;
    }
    
    modal.style.display = 'block';
}

console.log('🏙️ CityBlocks - Streamlined Controls v2.0');
console.log('✅ 6 control buttons (including Sound toggle)');
console.log('✅ Busker Mode with input field layering');
console.log('✅ Cacophony mode with "Voice Above the Crowd"');
console.log('✅ Sequential, Random, and Custom Sequence modes');
console.log('🎸 Enter window numbers to layer sounds like building a song!');
