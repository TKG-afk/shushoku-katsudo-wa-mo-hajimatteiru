const stage = document.getElementById('stage');
const slides = [...document.querySelectorAll('.slide')];
const counter = document.getElementById('counter');
const chapter = document.getElementById('chapter');
const progress = document.getElementById('progress');
let current = 0;

function fitStage() {
  const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function goTo(index) {
  const next = Math.max(0, Math.min(slides.length - 1, index));
  if (next === current) return;
  slides[current].classList.remove('active');
  slides[current].setAttribute('aria-hidden', 'true');
  current = next;
  slides[current].classList.add('active');
  slides[current].removeAttribute('aria-hidden');
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  chapter.textContent = slides[current].dataset.chapter;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  history.replaceState(null, '', `#${current + 1}`);
}

document.getElementById('prev').addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
document.getElementById('next').addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
document.getElementById('fullscreen').addEventListener('click', async e => {
  e.stopPropagation();
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
});

document.addEventListener('keydown', e => {
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End') goTo(slides.length - 1);
});

stage.addEventListener('click', e => {
  if (e.target.closest('button, a, input, label')) return;
  goTo(current + 1);
});

let touchX = null;
stage.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
stage.addEventListener('touchend', e => {
  if (touchX === null) return;
  const distance = e.changedTouches[0].screenX - touchX;
  if (Math.abs(distance) > 50) goTo(current + (distance < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });

window.addEventListener('resize', fitStage);
fitStage();
slides.forEach((slide, index) => { if (index) slide.setAttribute('aria-hidden', 'true'); });
progress.style.width = `${100 / slides.length}%`;
const requested = Number(location.hash.slice(1));
if (Number.isInteger(requested) && requested >= 1 && requested <= slides.length) goTo(requested - 1);
