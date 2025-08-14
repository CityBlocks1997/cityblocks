const words = ['BUILD','YOUR','NEXT','WORLD','at','CITYBLOCKS.COM'];

function showNext(){
  const w = words[i];
  introWord.classList.remove('show');

  setTimeout(()=> {
    if (w === 'CITYBLOCKS.COM') {
      introWord.textContent = '';            // hide text
      introLogo.classList.add('show');       // show logo as final beat
    } else {
      introWord.textContent = w.toUpperCase();
      introLogo.classList.remove('show');
      introWord.classList.add('show');
    }
  }, 60);

  const beat = (w.toLowerCase() === 'at') ? 220 : 420;
  i++;
  if (i < words.length) setTimeout(showNext, beat);
  else setTimeout(() => {
    intro.classList.add('intro-fade-out');
    intro.setAttribute('aria-hidden','true');
    app.style.opacity = 1;
    app.setAttribute('aria-hidden','false');
    inquire.style.opacity = 1;
  }, 800);
}
