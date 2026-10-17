import { gsap } from 'gsap';

const motionDeck = document.querySelector('[data-motion-deck]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (motionDeck) {
  const slides = [...motionDeck.querySelectorAll('[data-deck-slide]')];
  const stops = [...motionDeck.querySelectorAll('[data-deck-go]')];
  const currentReadout = motionDeck.querySelector('[data-deck-current]');
  const chapterReadout = motionDeck.querySelector('[data-deck-name]');
  const announcement = motionDeck.querySelector('[data-deck-announcement]');
  const progress = motionDeck.querySelector('[data-deck-progress]');
  const progressBar = motionDeck.querySelector('.deck-progress-track');
  const previous = motionDeck.querySelector('[data-deck-prev]');
  const next = motionDeck.querySelector('[data-deck-next]');
  const autoplay = motionDeck.querySelector('[data-deck-autoplay]');
  const autoplayText = motionDeck.querySelector('[data-autoplay-label]');
  const fullscreenButton = document.querySelector('[data-fullscreen]');
  const chapters = ['المقدمة', 'العرض والحدود', 'منظومة الدفع', 'شرط الإقلاع', 'العزم والتحكم', 'الشفط والاحتكاك', 'الخلاصة'];
  let active = 0;
  let timer;
  let playing = false;
  let deckVisible = true;
  let touchX = null;
  let slideTimeline;
  let threeScene = null;
  const roadsterHost = motionDeck.querySelector('[data-roadster-scene]');
  if (roadsterHost && window.WebGLRenderingContext) {
    import('./roadster-scene.js')
      .then(({ initRoadsterScene }) => {
        threeScene = initRoadsterScene(roadsterHost);
        threeScene?.setReducedMotion(reducedMotion.matches);
      })
      .catch((error) => {
        roadsterHost.closest('.scene-roadster')?.classList.remove('has-webgl');
        console.info('3D scene module unavailable; keeping the vector illustration.', error);
      });
  }

  function clearTimer() {
    window.clearTimeout(timer);
    timer = undefined;
  }

  function updateAutoplay() {
    const isReduced = reducedMotion.matches;
    autoplay.disabled = isReduced;
    autoplay.title = isReduced ? 'التشغيل التلقائي متوقف بسبب إعداد تقليل الحركة.' : '';
    autoplay.setAttribute('aria-pressed', String(playing));
    autoplay.setAttribute('aria-label', isReduced
      ? 'التشغيل التلقائي متوقف لأن تقليل الحركة مفعّل'
      : playing ? 'إيقاف التشغيل التلقائي' : 'تشغيل العرض تلقائياً');
    autoplayText.textContent = isReduced ? 'متوقف' : playing ? 'إيقاف' : 'تلقائي';
    autoplay.querySelector('.autoplay-icon').textContent = isReduced ? '—' : playing ? 'Ⅱ' : '▶';
  }

  function schedule() {
    clearTimer();
    if (!playing || document.hidden || !deckVisible || reducedMotion.matches) return;
    if (active === slides.length - 1) {
      playing = false;
      updateAutoplay();
      return;
    }
    timer = window.setTimeout(() => show(active + 1), 7000);
  }

  function animateSlide(slide, direction = 1) {
    const eyebrow = slide.querySelector('.deck-eyebrow');
    const heading = slide.querySelector('h2');
    const canvas = slide.querySelector('.deck-canvas');
    const details = [...slide.querySelectorAll('.deck-description, .deck-equation, .deck-caveat, .deck-conclusion, .deck-sources, .deck-cta')];
    const targets = [eyebrow, heading, ...details].filter(Boolean);
    if (reducedMotion.matches) {
      [...targets, canvas].filter(Boolean).forEach((target) => gsap.set(target, { clearProps: 'all' }));
      return;
    }

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (canvas) {
      timeline.fromTo(canvas,
        { autoAlpha: 0, x: direction * 42, y: 9, scale: 0.95, rotationY: direction * 3 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, rotationY: 0, duration: 1.05, ease: 'expo.out', clearProps: 'transform' },
        0,
      );
    }
    if (eyebrow) {
      timeline.fromTo(eyebrow,
        { autoAlpha: 0, y: 14, x: direction * 8 },
        { autoAlpha: 1, y: 0, x: 0, duration: 0.62, clearProps: 'transform,opacity,visibility' },
        0.1,
      );
    }
    if (heading) {
      timeline.fromTo(heading,
        { autoAlpha: 0, y: 30, rotationX: -5, transformPerspective: 900 },
        { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.86, ease: 'back.out(1.12)', clearProps: 'transform,opacity,visibility' },
        0.17,
      );
    }
    details.forEach((detail, index) => {
      const order = direction < 0 ? details.length - index - 1 : index;
      timeline.fromTo(detail,
        { autoAlpha: 0, y: 17 },
        { autoAlpha: 1, y: 0, duration: 0.65, clearProps: 'transform,opacity,visibility' },
        0.34 + order * 0.065,
      );
    });
    slideTimeline = timeline;
  }

  function show(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    if (target === active) return;
    clearTimer();

    const direction = target > active ? 1 : -1;
    const leaving = slides[active];
    const entering = slides[target];
    if (slideTimeline) slideTimeline.kill();
    leaving.classList.remove('is-active');
    leaving.classList.add('is-exiting');
    leaving.setAttribute('aria-hidden', 'true');
    leaving.inert = true;
    entering.classList.remove('is-exiting');
    entering.classList.add('is-active');
    entering.setAttribute('aria-hidden', 'false');
    entering.inert = false;
    active = target;

    stops.forEach((button, i) => {
      const selected = i === active;
      button.classList.toggle('is-active', selected);
      if (selected) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });

    const number = String(active + 1).padStart(2, '0');
    currentReadout.textContent = number;
    chapterReadout.textContent = chapters[active];
    announcement.textContent = `الشريحة ${active + 1} من ${slides.length}: ${chapters[active]}`;
    progress.style.width = `${((active + 1) / slides.length) * 100}%`;
    progressBar.setAttribute('aria-valuenow', String(active + 1));
    previous.disabled = active === 0;

    const last = active === slides.length - 1;
    next.querySelector('span').textContent = last ? 'إعادة العرض' : 'التالي';
    next.querySelector('b').textContent = last ? '↺' : '←';
    next.setAttribute('aria-label', last ? 'إعادة العرض من البداية' : 'الانتقال إلى الشريحة التالية');
    animateSlide(entering, direction);
    window.setTimeout(() => leaving.classList.remove('is-exiting'), reducedMotion.matches ? 20 : 980);
    schedule();
  }

  previous.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active === slides.length - 1 ? 0 : active + 1));
  stops.forEach((button) => button.addEventListener('click', () => show(Number(button.dataset.deckGo))));
  document.querySelectorAll('[data-deck-jump]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      show(Number(link.dataset.deckJump));
      motionDeck.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    });
  });

  autoplay.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    playing = !playing;
    if (playing && active === slides.length - 1) show(0);
    updateAutoplay();
    schedule();
  });

  motionDeck.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(active === slides.length - 1 ? 0 : active + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(active - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      show(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      show(slides.length - 1);
    }
  });

  const stage = motionDeck.querySelector('[data-deck-stage]');
  stage.addEventListener('pointerdown', (event) => {
    touchX = event.pointerType === 'touch' && !event.target.closest('[data-roadster-scene]') ? event.clientX : null;
  }, { passive: true });
  stage.addEventListener('pointerup', (event) => {
    if (touchX === null) return;
    const delta = event.clientX - touchX;
    touchX = null;
    if (Math.abs(delta) > 55) show(delta < 0 ? active + 1 : active - 1);
  }, { passive: true });
  stage.addEventListener('pointercancel', () => { touchX = null; }, { passive: true });

  const ratioInput = motionDeck.querySelector('[data-thrust-ratio]');
  if (ratioInput) {
    const forceStage = ratioInput.closest('[data-thrust-sim]');
    const ratioOutput = motionDeck.querySelector('[data-thrust-output]');
    const liftStatus = motionDeck.querySelector('[data-lift-status]');
    const updateForce = () => {
      const ratio = Number(ratioInput.value) / 100;
      forceStage.style.setProperty('--thrust-scale', ratio.toFixed(2));
      ratioOutput.textContent = `${ratio.toFixed(2)} × mg`;
      if (ratio > 1.02) {
        forceStage.dataset.liftState = 'rising';
        liftStatus.textContent = 'الدفع يتجاوز الوزن · محصلة إلى الأعلى';
      } else if (ratio >= 0.98) {
        forceStage.dataset.liftState = 'balanced';
        liftStatus.textContent = 'توازن تقريبي · المحصلة الرأسية ≈ صفر';
      } else {
        forceStage.dataset.liftState = 'grounded';
        liftStatus.textContent = 'الدفع أقل من الوزن · لا إقلاع';
      }
    };
    ratioInput.addEventListener('input', updateForce);
    updateForce();
  }

  if (fullscreenButton) {
    const updateFullscreenLabel = () => {
      const inFullscreen = Boolean(document.fullscreenElement);
      fullscreenButton.querySelector('span').textContent = inFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة';
      fullscreenButton.setAttribute('aria-label', inFullscreen ? 'إنهاء ملء الشاشة' : 'عرض ملء الشاشة');
    };
    fullscreenButton.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      } catch (error) {
        fullscreenButton.title = 'استخدم وضع ملء الشاشة من قائمة المتصفح.';
      }
    });
    document.addEventListener('fullscreenchange', updateFullscreenLabel);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimer();
    else schedule();
  });
  const visibility = new IntersectionObserver((entries) => {
    deckVisible = entries[0].intersectionRatio > 0.15;
    if (deckVisible) schedule();
    else clearTimer();
  }, { threshold: [0, 0.15] });
  visibility.observe(motionDeck);

  const onReducedMotionChange = () => {
    if (reducedMotion.matches) {
      playing = false;
      clearTimer();
      if (slideTimeline) slideTimeline.kill();
      animateSlide(slides[active]);
    }
    threeScene?.setReducedMotion(reducedMotion.matches);
    updateAutoplay();
  };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onReducedMotionChange);
  else reducedMotion.addListener(onReducedMotionChange);

  progress.style.width = `${(1 / slides.length) * 100}%`;
  updateAutoplay();
  animateSlide(slides[0]);
}
