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

function connectModeGroup(stageSelector, buttonSelector, dataKey) {
  const stage = document.querySelector(stageSelector);
  const buttons = document.querySelectorAll(buttonSelector);
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset[dataKey];
      stage.dataset[dataKey] = mode;
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    });
  });
}

connectModeGroup('[data-body-stage]', '[data-body-mode]', 'bodyMode');
connectModeGroup('[data-signal-stage]', '[data-signal-mode]', 'signalMode');
connectModeGroup('[data-optics-stage]', '[data-optics-mode]', 'opticsMode');
connectModeGroup('[data-portal-stage]', '[data-portal-mode]', 'portalMode');

const bodyStage = document.querySelector('[data-body-stage]');
bodyStage.addEventListener('pointermove', (event) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bounds = bodyStage.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  bodyStage.style.setProperty('--body-x', `${x * 23}px`);
  bodyStage.style.setProperty('--body-y', `${y * 15}px`);
});
bodyStage.addEventListener('pointerleave', () => {
  bodyStage.style.setProperty('--body-x', '0px');
  bodyStage.style.setProperty('--body-y', '0px');
});

const opticsStage = document.querySelector('[data-optics-stage]');
opticsStage.addEventListener('pointermove', (event) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bounds = opticsStage.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  opticsStage.style.setProperty('--optic-x', `${x * 20}px`);
  opticsStage.style.setProperty('--optic-y', `${y * 16}px`);
});
opticsStage.addEventListener('pointerleave', () => {
  opticsStage.style.setProperty('--optic-x', '0px');
  opticsStage.style.setProperty('--optic-y', '0px');
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

// Five-scene motion presentation: controlled, keyboard-accessible and user-paced.
const motionDeck = document.querySelector('[data-motion-deck]');
if (motionDeck) {
  const deckSlides = Array.from(motionDeck.querySelectorAll('[data-deck-slide]'));
  const deckStops = Array.from(motionDeck.querySelectorAll('[data-deck-go]'));
  const deckCurrent = motionDeck.querySelector('[data-deck-current]');
  const deckName = motionDeck.querySelector('[data-deck-name]');
  const deckAnnouncement = motionDeck.querySelector('[data-deck-announcement]');
  const deckProgress = motionDeck.querySelector('[data-deck-progress]');
  const deckProgressTrack = motionDeck.querySelector('.deck-progress-track');
  const previousSlide = motionDeck.querySelector('[data-deck-prev]');
  const nextSlide = motionDeck.querySelector('[data-deck-next]');
  const autoplayButton = motionDeck.querySelector('[data-deck-autoplay]');
  const autoplayLabel = motionDeck.querySelector('[data-autoplay-label]');
  const chapterNames = ['INTENTION', 'PHYSICALITY', 'PROPAGATION', 'OPTICS', 'NEW WORLDS'];
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeSlide = 0;
  let autoplayTimer;
  let isAutoplaying = false;
  let deckInViewport = true;
  let touchStartX = null;

  function clearAutoplayTimer() {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = undefined;
  }

  function updateAutoplayButton() {
    const motionIsReduced = reducedMotionQuery.matches;
    autoplayButton.disabled = motionIsReduced;
    autoplayButton.title = motionIsReduced ? 'Automatic playback is disabled by your reduced-motion setting.' : '';
    autoplayButton.setAttribute('aria-pressed', String(isAutoplaying));
    autoplayButton.setAttribute('aria-label', motionIsReduced
      ? 'Automatic presentation is disabled because reduced motion is enabled'
      : isAutoplaying ? 'Pause automatic presentation' : 'Start automatic presentation');
    autoplayLabel.textContent = motionIsReduced ? 'Off' : isAutoplaying ? 'Pause' : 'Auto';
    autoplayButton.querySelector('.autoplay-icon').textContent = motionIsReduced ? '—' : isAutoplaying ? 'Ⅱ' : '▶';
  }

  function scheduleAutoplay() {
    clearAutoplayTimer();
    if (!isAutoplaying || document.hidden || !deckInViewport || reducedMotionQuery.matches) return;
    if (activeSlide === deckSlides.length - 1) {
      isAutoplaying = false;
      updateAutoplayButton();
      return;
    }
    autoplayTimer = window.setTimeout(() => showSlide(activeSlide + 1), 6500);
  }

  function showSlide(nextIndex) {
    const target = Math.max(0, Math.min(deckSlides.length - 1, nextIndex));
    if (target === activeSlide) return;
    clearAutoplayTimer();

    const oldSlide = deckSlides[activeSlide];
    const newSlide = deckSlides[target];
    oldSlide.classList.remove('is-active');
    oldSlide.classList.add('is-exiting');
    oldSlide.setAttribute('aria-hidden', 'true');
    oldSlide.inert = true;

    newSlide.classList.remove('is-exiting');
    newSlide.classList.add('is-active');
    newSlide.setAttribute('aria-hidden', 'false');
    newSlide.inert = false;

    activeSlide = target;
    deckStops.forEach((stop, index) => {
      const selected = index === activeSlide;
      stop.classList.toggle('is-active', selected);
      if (selected) stop.setAttribute('aria-current', 'step');
      else stop.removeAttribute('aria-current');
    });

    const number = String(activeSlide + 1).padStart(2, '0');
    deckCurrent.textContent = number;
    deckName.textContent = chapterNames[activeSlide];
    deckAnnouncement.textContent = `Slide ${activeSlide + 1} of ${deckSlides.length}: ${chapterNames[activeSlide].toLowerCase()}`;
    deckProgress.style.width = `${((activeSlide + 1) / deckSlides.length) * 100}%`;
    deckProgressTrack.setAttribute('aria-valuenow', String(activeSlide + 1));
    previousSlide.disabled = activeSlide === 0;

    const isLast = activeSlide === deckSlides.length - 1;
    nextSlide.querySelector('span').textContent = isLast ? 'Replay story' : 'Next scene';
    nextSlide.querySelector('b').textContent = isLast ? '↺' : '→';
    nextSlide.setAttribute('aria-label', isLast ? 'Restart presentation' : 'Go to next slide');

    window.setTimeout(() => oldSlide.classList.remove('is-exiting'), reducedMotionQuery.matches ? 20 : 980);
    scheduleAutoplay();
  }

  previousSlide.addEventListener('click', () => showSlide(activeSlide - 1));
  nextSlide.addEventListener('click', () => {
    showSlide(activeSlide === deckSlides.length - 1 ? 0 : activeSlide + 1);
  });
  deckStops.forEach((stop) => stop.addEventListener('click', () => showSlide(Number(stop.dataset.deckGo))));

  autoplayButton.addEventListener('click', () => {
    if (reducedMotionQuery.matches) return;
    isAutoplaying = !isAutoplaying;
    if (isAutoplaying && activeSlide === deckSlides.length - 1) showSlide(0);
    updateAutoplayButton();
    scheduleAutoplay();
  });

  motionDeck.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(activeSlide === deckSlides.length - 1 ? 0 : activeSlide + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(activeSlide - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      showSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      showSlide(deckSlides.length - 1);
    }
  });

  const deckStage = motionDeck.querySelector('[data-deck-stage]');
  deckStage.addEventListener('pointerdown', (event) => {
    touchStartX = event.pointerType === 'touch' ? event.clientX : null;
  }, { passive: true });
  deckStage.addEventListener('pointerup', (event) => {
    if (touchStartX === null) return;
    const delta = event.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) > 55) showSlide(delta < 0 ? activeSlide + 1 : activeSlide - 1);
  }, { passive: true });
  deckStage.addEventListener('pointercancel', () => { touchStartX = null; }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearAutoplayTimer();
    else scheduleAutoplay();
  });
  const deckVisibilityObserver = new IntersectionObserver((entries) => {
    deckInViewport = entries[0].intersectionRatio > 0.15;
    if (deckInViewport) scheduleAutoplay();
    else clearAutoplayTimer();
  }, { threshold: [0, 0.15] });
  deckVisibilityObserver.observe(motionDeck);
  reducedMotionQuery.addEventListener('change', () => {
    if (reducedMotionQuery.matches) {
      isAutoplaying = false;
      clearAutoplayTimer();
    }
    updateAutoplayButton();
  });

  updateAutoplayButton();
}

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
