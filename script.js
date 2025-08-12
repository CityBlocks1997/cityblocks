// After the final word finishes, reveal grid and remove intro
(function () {
  const INTRO_COUNT = 7; // Build, Your, Next, World, At, [Logo], CityBlocks.com
  const lastWord = document.querySelector('.w' + INTRO_COUNT);
  const intro = document.getElementById('intro');
  const grid = document.getElementById('grid');

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('ready');
    intro?.remove();
    grid?.classList.remove('hidden');
    return;
  }

  lastWord?.addEventListener('animationend', () => {
    document.body.classList.add('ready');
    grid?.classList.remove('hidden');
    // fully remove intro after fade
    setTimeout(() => intro?.remove(), 700);
  });

  // Hover video play/pause (muted autoplay is allowed by browsers)
  document.querySelectorAll('.tile').forEach(tile => {
    const vid = tile.querySelector('video.hover-vid');
    if (!vid) return;

    tile.addEventListener('mouseenter', () => {
      // ensure can play when hovered
      vid.currentTime = 0;
      vid.play().catch(() => {/* ignore */});
    });
    tile.addEventListener('mouseleave', () => {
      vid.pause();
    });
  });

  // Inquire flow: open PDF (if it exists), then email
  document.getElementById('inquire')?.addEventListener('click', () => {
    // Put your PDF at repo root named EXACTLY this, or change the name here.
    const pdf = 'Investor-One-Sheet.pdf';
    // Try opening in a new tab
    window.open(pdf, '_blank');
    // Then open email after a short beat
    setTimeout(() => {
      window.location.href =
        'mailto:cityblocks@icloud.com?subject=CityBlocks.com%20Inquiry&body=Hi%20—%20I%27d%20like%20to%20discuss%20CityBlocks.com.';
    }, 700);
  });
})();
