// CityBlocks.com — script.js — v2025-08-24
(function(){
  const tiles = Array.from(document.querySelectorAll('.tile'));
  const isTouch = matchMedia('(hover: none)').matches || 'ontouchstart' in window;

  // Year in footer
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  tiles.forEach(tile => {
    const video = tile.querySelector('video');
    const img = tile.querySelector('img');

    if (!video || !img) return;

    video.muted = true;
    video.setAttribute('playsinline', '');
    video.preload = 'none';

    const showVideo = () => {
      img.style.display = 'none';
      video.style.display = 'block';
    };
    const hideVideo = () => {
      video.pause();
      video.currentTime = 0;
      video.style.display = 'none';
      img.style.display = 'block';
    };

    const play = () => {
      showVideo();
      if (video.readyState === 0) {
        try { video.load(); } catch(e){}
      }
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(()=>{});
    };

    const pause = () => {
      hideVideo();
    };

    if (!isTouch){
      tile.addEventListener('mouseenter', play);
      tile.addEventListener('mouseleave', pause);
      tile.addEventListener('focus', play, true);
      tile.addEventListener('blur', pause, true);
    } else {
      // Touch devices: tap to toggle
      let playing = false;
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        playing ? pause() : play();
        playing = !playing;
      });
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) pause();
      });
    }, { threshold: 0.1 });
    io.observe(tile);
  });
})();
