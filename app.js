const replayButtons = document.querySelectorAll('.replay-button');
const gestureButtons = document.querySelectorAll('.gesture-button');
const playgroundStage = document.querySelector('[data-playground-stage]');
const curveReadout = document.querySelector('[data-curve]');

replayButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.principle-card');
    card.classList.remove('is-replaying');
    // A forced layout gives the animation a clean anticipation point on every replay.
    void card.offsetWidth;
    card.classList.add('is-replaying');
    window.setTimeout(() => card.classList.remove('is-replaying'), 40);
  });
});

const gestureData = {
  pulse: { curve: 'soft / out' },
  dolly: { curve: 'slow / in out' },
  assemble: { curve: 'elastic / out' },
  whip: { curve: 'sharp / out' },
};

gestureButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const gesture = button.dataset.gesture;
    gestureButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    playgroundStage.dataset.active = gesture;
    curveReadout.textContent = gestureData[gesture].curve;
  });
  button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
});

const fieldStage = document.querySelector('[data-field-stage]');
const fieldModes = document.querySelectorAll('[data-field-mode]');
fieldModes.forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.fieldMode;
    fieldStage.dataset.field = mode;
    fieldModes.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});

const materialStage = document.querySelector('[data-material-stage]');
const materialModes = document.querySelectorAll('[data-material-mode]');
materialModes.forEach((button) => {
  button.addEventListener('click', () => {
    const mode = button.dataset.materialMode;
    materialStage.dataset.material = mode;
    materialModes.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});

const sequenceStage = document.querySelector('[data-sequence-stage]');
const sequenceActions = document.querySelectorAll('[data-sequence-action]');
sequenceActions.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.sequenceAction;
    if (action === 'play') {
      sequenceStage.dataset.sequenceState = 'paused';
      void sequenceStage.offsetWidth;
      sequenceStage.dataset.sequenceState = 'playing';
    } else {
      sequenceStage.dataset.sequenceState = sequenceStage.dataset.sequenceState === 'paused' ? 'playing' : 'paused';
    }
    sequenceActions.forEach((item) => {
      const isPlay = sequenceStage.dataset.sequenceState !== 'paused';
      item.classList.toggle('is-active', item.dataset.sequenceAction === (isPlay ? 'play' : 'freeze'));
    });
  });
});

// The stage follows a cursor just enough to feel spatial, never enough to distract.
let pointerFrame;
playgroundStage.addEventListener('pointermove', (event) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bounds = playgroundStage.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => {
    playgroundStage.style.setProperty('--pointer-x', `${x * 8}px`);
    playgroundStage.style.setProperty('--pointer-y', `${y * 8}px`);
    playgroundStage.querySelector('.playground-cursor').style.transform = `translate(${x * 26}px, ${y * 22}px)`;
  });
});

playgroundStage.addEventListener('pointerleave', () => {
  playgroundStage.style.setProperty('--pointer-x', '0px');
  playgroundStage.style.setProperty('--pointer-y', '0px');
  playgroundStage.querySelector('.playground-cursor').style.transform = '';
});

const cameraStage = document.querySelector('[data-camera-stage]');
let cameraFrame;
cameraStage.addEventListener('pointermove', (event) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bounds = cameraStage.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  cancelAnimationFrame(cameraFrame);
  cameraFrame = requestAnimationFrame(() => {
    cameraStage.style.setProperty('--camera-x', `${x * 20}px`);
    cameraStage.style.setProperty('--camera-y', `${y * 14}px`);
  });
});
cameraStage.addEventListener('pointerleave', () => {
  cameraStage.style.setProperty('--camera-x', '0px');
  cameraStage.style.setProperty('--camera-y', '0px');
});

// Bring section choreography in as the reader reaches it.
const sections = document.querySelectorAll('main > section');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
sections.forEach((section) => revealObserver.observe(section));

window.addEventListener('scroll', () => {
  document.querySelector('.topbar').classList.toggle('is-scrolled', window.scrollY > 20);
}, { passive: true });
