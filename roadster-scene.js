import { gsap } from 'gsap';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function makeGlassShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.28, 1.08);
  shape.lineTo(-0.69, 1.56);
  shape.quadraticCurveTo(-0.51, 1.69, -0.25, 1.69);
  shape.lineTo(0.45, 1.62);
  shape.quadraticCurveTo(0.76, 1.58, 1.08, 1.21);
  shape.lineTo(1.25, 1.08);
  shape.closePath();
  return shape;
}

function initRoadsterScene(host) {
  if (!host || !window.WebGLRenderingContext) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    console.info('3D Roadster scene unavailable; keeping the vector illustration.', error);
    return null;
  }

  const parent = host.closest('.scene-roadster');
  const slide = host.closest('[data-deck-slide]');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
  camera.position.set(7.9, 4.5, 8.4);
  camera.lookAt(0, 0.82, 0);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.className = 'roadster-webgl';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  parent.classList.add('has-webgl');

  scene.add(new THREE.HemisphereLight(0xc4d4ef, 0x15131f, 2.1));
  const keyLight = new THREE.DirectionalLight(0xf4f2ed, 3.2);
  keyLight.position.set(4, 8, 5);
  scene.add(keyLight);
  const limeLight = new THREE.PointLight(0xc9aa69, 22, 10, 2);
  limeLight.position.set(-3.2, 1.4, 0.3);
  scene.add(limeLight);
  const violetLight = new THREE.PointLight(0x91adbe, 16, 12, 2);
  violetLight.position.set(1.8, 2.2, -3.5);
  scene.add(violetLight);

  const grid = new THREE.GridHelper(13, 28, 0x9b8152, 0x454154);
  grid.position.y = -0.06;
  grid.material.transparent = true;
  grid.material.opacity = 0.27;
  scene.add(grid);

  const groundGlow = new THREE.Mesh(
    new THREE.CircleGeometry(3.7, 64),
    new THREE.MeshBasicMaterial({ color: 0x08090e, transparent: true, opacity: 0.57, side: THREE.DoubleSide }),
  );
  groundGlow.rotation.x = -Math.PI / 2;
  groundGlow.position.y = -0.045;
  scene.add(groundGlow);

  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x9b8152, transparent: true, opacity: 0.34 });
  const orbitA = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.009, 5, 144), orbitMaterial);
  orbitA.rotation.x = Math.PI / 2.3;
  orbitA.rotation.y = -0.2;
  orbitA.position.y = 0.05;
  scene.add(orbitA);
  const orbitB = new THREE.Mesh(
    new THREE.TorusGeometry(2.95, 0.006, 5, 144),
    new THREE.MeshBasicMaterial({ color: 0x91adbe, transparent: true, opacity: 0.24 }),
  );
  orbitB.rotation.x = Math.PI / 2.6;
  orbitB.rotation.y = 0.38;
  orbitB.position.y = 0.07;
  scene.add(orbitB);

  const car = new THREE.Group();
  car.position.y = 0.12;
  car.rotation.y = -0.05;
  scene.add(car);

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-3.2, 0.37);
  bodyShape.quadraticCurveTo(-3.11, 0.77, -2.38, 0.91);
  bodyShape.lineTo(-1.43, 1.02);
  bodyShape.lineTo(-0.72, 1.47);
  bodyShape.quadraticCurveTo(-0.44, 1.65, -0.08, 1.65);
  bodyShape.lineTo(0.64, 1.56);
  bodyShape.quadraticCurveTo(0.96, 1.52, 1.38, 1.12);
  bodyShape.lineTo(2.43, 0.92);
  bodyShape.quadraticCurveTo(3.11, 0.8, 3.19, 0.52);
  bodyShape.lineTo(3.05, 0.37);
  bodyShape.closePath();

  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 1.34,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.075,
    bevelThickness: 0.075,
    curveSegments: 14,
  });
  bodyGeometry.translate(0, 0, -0.67);
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x969aac,
    metalness: 0.72,
    roughness: 0.25,
    clearcoat: 0.95,
    clearcoatRoughness: 0.18,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  car.add(body);

  const cabinGeometry = new THREE.ExtrudeGeometry(makeGlassShape(), {
    depth: 0.92,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 12,
  });
  cabinGeometry.translate(0, 0, -0.46);
  const cabin = new THREE.Mesh(
    cabinGeometry,
    new THREE.MeshPhysicalMaterial({
      color: 0x41495d,
      metalness: 0.42,
      roughness: 0.2,
      clearcoat: 1,
      transparent: true,
      opacity: 0.88,
    }),
  );
  car.add(cabin);

  const windowShape = new THREE.Shape();
  windowShape.moveTo(-1.11, 1.12);
  windowShape.lineTo(-0.62, 1.52);
  windowShape.quadraticCurveTo(-0.48, 1.61, -0.24, 1.61);
  windowShape.lineTo(-0.12, 1.12);
  windowShape.closePath();
  const rearWindowShape = new THREE.Shape();
  rearWindowShape.moveTo(-0.02, 1.12);
  rearWindowShape.lineTo(0.06, 1.59);
  rearWindowShape.lineTo(0.43, 1.55);
  rearWindowShape.quadraticCurveTo(0.7, 1.52, 1.04, 1.19);
  rearWindowShape.lineTo(1.12, 1.12);
  rearWindowShape.closePath();
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9cb9d1,
    metalness: 0.27,
    roughness: 0.13,
    clearcoat: 1,
    transparent: true,
    opacity: 0.56,
    side: THREE.DoubleSide,
  });
  for (const side of [-1, 1]) {
    for (const shape of [windowShape, rearWindowShape]) {
      const windowMesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), glassMaterial);
      windowMesh.position.z = side * 0.681;
      car.add(windowMesh);
    }
  }

  const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x101117, roughness: 0.72, metalness: 0.12 });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0x9da3b1, roughness: 0.24, metalness: 0.86 });
  const hubMaterial = new THREE.MeshStandardMaterial({ color: 0xc4a96d, roughness: 0.32, metalness: 0.7, emissive: 0x4a3c22, emissiveIntensity: 0.55 });
  for (const x of [-2.12, 2.08]) {
    for (const side of [-1, 1]) {
      const wheel = new THREE.Group();
      wheel.position.set(x, 0.4, side * 0.7);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.405, 0.405, 0.245, 36), tireMaterial);
      tire.rotation.x = Math.PI / 2;
      wheel.add(tire);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.282, 0.033, 8, 32), rimMaterial);
      rim.position.z = side * 0.128;
      wheel.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.27, 20), hubMaterial);
      hub.rotation.x = Math.PI / 2;
      wheel.add(hub);
      for (let spoke = 0; spoke < 6; spoke += 1) {
        const spokeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.27, 0.028), rimMaterial);
        spokeMesh.position.z = side * 0.143;
        spokeMesh.rotation.z = (Math.PI * spoke) / 3;
        wheel.add(spokeMesh);
      }
      car.add(wheel);
    }
  }

  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xc4a96d, metalness: 0.45, roughness: 0.35, emissive: 0x3d311d, emissiveIntensity: 0.25 });
  const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xf4f2ed, emissive: 0xe1c78d, emissiveIntensity: 1.1, roughness: 0.22 });
  for (const side of [-1, 1]) {
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), headlightMaterial);
    light.position.set(3.06, 0.64, side * 0.43);
    car.add(light);
    const accent = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.018, 0.025), trimMaterial);
    accent.position.set(2.88, 0.5, side * 0.644);
    car.add(accent);
  }

  const jetMaterial = new THREE.MeshBasicMaterial({ color: 0xc4a96d, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false });
  const jetHighlight = new THREE.MeshBasicMaterial({ color: 0xffe7b4, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false });
  const jets = [];
  for (const x of [-1.75, 1.55]) {
    for (const side of [-1, 1]) {
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.155, 0.3, 18),
        new THREE.MeshStandardMaterial({ color: 0x303544, metalness: 0.82, roughness: 0.27 }),
      );
      nozzle.position.set(x, 0.24, side * 0.37);
      car.add(nozzle);
      const jet = new THREE.Group();
      jet.position.set(x, 0.025, side * 0.37);
      const plume = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.62, 18, 1), jetMaterial);
      plume.rotation.z = Math.PI;
      plume.position.y = -0.21;
      jet.add(plume);
      const core = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.39, 14, 1), jetHighlight);
      core.rotation.z = Math.PI;
      core.position.y = -0.19;
      jet.add(core);
      car.add(jet);
      jets.push(jet);
    }
  }

  const rearNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.16, 0.32, 18),
    new THREE.MeshStandardMaterial({ color: 0x303544, metalness: 0.8, roughness: 0.25 }),
  );
  rearNozzle.rotation.z = Math.PI / 2;
  rearNozzle.position.set(-3.13, 0.56, 0);
  car.add(rearNozzle);
  const rearJet = new THREE.Group();
  rearJet.position.set(-3.26, 0.56, 0);
  const rearPlume = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.72, 18, 1), jetMaterial);
  rearPlume.rotation.z = Math.PI / 2;
  rearPlume.position.x = -0.24;
  rearJet.add(rearPlume);
  car.add(rearJet);
  jets.push(rearJet);

  const particlePositions = [];
  for (let i = 0; i < 52; i += 1) {
    particlePositions.push(-3.45 - Math.random() * 1.8, 0.42 + (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.68);
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({ color: 0xc4a96d, size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.72, depthWrite: false }),
  );
  car.add(particles);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.83, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.minDistance = 6.2;
  controls.maxDistance = 12;
  controls.minPolarAngle = 0.45;
  controls.maxPolarAngle = 1.48;
  controls.autoRotate = !reducedMotion.matches;
  controls.autoRotateSpeed = 0.34;
  controls.update();

  let frameId = 0;
  let disposed = false;
  const shouldRender = () => !disposed && !document.hidden && slide.classList.contains('is-active');
  const render = () => {
    frameId = 0;
    if (!shouldRender()) return;
    controls.update();
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  };
  const requestRender = () => {
    if (shouldRender() && !frameId) frameId = window.requestAnimationFrame(render);
  };

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    requestRender();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  window.addEventListener('resize', resize, { passive: true });
  const slideObserver = new MutationObserver(requestRender);
  slideObserver.observe(slide, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', requestRender);
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    parent.classList.remove('has-webgl');
  });

  const bob = gsap.to(car.position, { y: 0.24, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: reducedMotion.matches });
  const roll = gsap.to(car.rotation, { z: 0.012, duration: 3.6, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: reducedMotion.matches });
  const jetPulses = jets.map((jet, index) => gsap.to(jet.scale, { x: 1.12, y: 1.09, z: 1.12, duration: 0.82, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: index * 0.13, paused: reducedMotion.matches }));

  resize();
  requestRender();

  return {
    setReducedMotion(isReduced) {
      controls.autoRotate = !isReduced;
      if (isReduced) {
        bob.pause(0);
        roll.pause(0);
        jetPulses.forEach((tween) => tween.pause(0));
        car.position.y = 0.12;
        car.rotation.z = 0;
        jets.forEach((jet) => jet.scale.set(1, 1, 1));
      } else {
        bob.play();
        roll.play();
        jetPulses.forEach((tween) => tween.play());
      }
      requestRender();
    },
    dispose() {
      disposed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      slideObserver.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', requestRender);
      controls.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      parent.classList.remove('has-webgl');
    },
  };
}


export { initRoadsterScene };
