// Mobile menu
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.getElementById('mobileMenu');

mobileToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

function closeMobile() {
  mobileMenu.classList.remove('active');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(9,9,9,0.95)';
  } else {
    navbar.style.background = 'rgba(9,9,9,0.85)';
  }
});

// Three.js Dual Renderer: WebGPU + TSL Nodes + Compute Particles
async function initHeroSphere() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  let THREE, WebGPURenderer, TSL;
  try {
    THREE = await import('three');
    const webgpuModule = await import('three/webgpu');
    WebGPURenderer = webgpuModule.WebGPURenderer;
    TSL = await import('three/tsl');
  } catch (e) {
    console.warn('Modern Three.js / TSL not available.');
    return;
  }

  const parent = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

  let renderer;
  let usingWebGPU = false;

  if (navigator.gpu && WebGPURenderer) {
    try {
      renderer = new WebGPURenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      await renderer.init();
      usingWebGPU = renderer.backend?.isWebGPUBackend ?? false;
      console.log(usingWebGPU ? 'ORVIX Hero: WebGPU activo' : 'ORVIX Hero: WebGPU fallback a WebGL');
    } catch (err) {
      console.warn('WebGPU init failed:', err);
    }
  }

  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    console.log('ORVIX Hero: WebGLRenderer');
  }

  function setSize() {
    const size = Math.min(parent.clientWidth, 520);
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  setSize();

  // Core sphere — TSL Node Material on WebGPU
  const sphereGeo = new THREE.IcosahedronGeometry(1.7, 3);
  let sphereMat;

  if (usingWebGPU && TSL) {
    const { vec3, float, sin, positionLocal, normalLocal } = TSL;
    sphereMat = new THREE.MeshStandardNodeMaterial({
      metalness: 0.92,
      roughness: 0.18
    });
    sphereMat.colorNode = vec3(0.067, 0.067, 0.078);
    const energy = sin(positionLocal.y.mul(3.0).add(normalLocal.x.mul(2.0))).mul(0.15).add(0.85);
    sphereMat.emissiveNode = vec3(0.2, 0.0, 0.0).mul(energy);
    console.log('ORVIX: Esfera con Shader Nodes (TSL) activa');
  } else {
    sphereMat = new THREE.MeshStandardMaterial({
      color: 0x111114,
      metalness: 0.92,
      roughness: 0.18,
      emissive: 0x330000,
      emissiveIntensity: 0.45
    });
  }

  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  const wire = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xE32636, wireframe: true, transparent: true, opacity: 0.28 }));
  scene.add(wire);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), new THREE.MeshBasicMaterial({ color: 0xE32636, transparent: true, opacity: 0.18 }));
  scene.add(core);

  // Particles: TSL Compute on WebGPU, Points fallback on WebGL
  let particles;
  let computeUpdate = null;
  const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);

  if (usingWebGPU && TSL) {
    const particleCount = isMobile ? 240 : 480;
    const { Fn, instancedArray, instanceIndex, vec3, float, sin, cos, hash } = TSL;

    const positions = instancedArray(particleCount, 'vec3');
    const phases = instancedArray(particleCount, 'float');

    const computeInit = Fn(() => {
      const idx = instanceIndex;
      const radius = float(2.2).add(hash(idx).mul(1.3));
      const theta = hash(idx.add(1)).mul(6.28318);
      const phi = hash(idx.add(2)).mul(3.14159);
      const pos = positions.element(idx);
      pos.assign(vec3(
        radius.mul(sin(phi)).mul(cos(theta)),
        radius.mul(sin(phi)).mul(sin(theta)),
        radius.mul(cos(phi))
      ));
      phases.element(idx).assign(hash(idx.add(3)).mul(6.28318));
    })().compute(particleCount);

    await renderer.computeAsync(computeInit);

    computeUpdate = Fn(() => {
      const idx = instanceIndex;
      const pos = positions.element(idx);
      const phase = phases.element(idx);
      const speed = float(0.4).add(hash(idx).mul(0.6));
      const newPhase = phase.add(speed.mul(0.016));
      phases.element(idx).assign(newPhase);
      const radius = pos.length();
      const theta = newPhase;
      const phi = hash(idx.add(4)).mul(3.14159);
      pos.assign(vec3(
        radius.mul(sin(phi)).mul(cos(theta)),
        radius.mul(sin(phi)).mul(sin(theta)),
        radius.mul(cos(phi))
      ));
    })().compute(particleCount);

    const material = new THREE.SpriteNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    material.positionNode = positions.toAttribute();
    material.scaleNode = float(0.028);
    material.colorNode = vec3(0.89, 0.15, 0.21);
    material.opacityNode = float(0.7);

    particles = new THREE.Sprite(material);
    particles.count = particleCount;
    particles.frustumCulled = false;
    scene.add(particles);

    console.log(`ORVIX: Compute GPU particles activas (${particleCount})`);
  } else {
    const particleCount = isMobile ? 60 : 120;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.2 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      color: 0xE32636,
      size: isMobile ? 0.028 : 0.032,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    particles.frustumCulled = false;
    scene.add(particles);
  }

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);
  const redLight1 = new THREE.PointLight(0xE32636, 3.5, 12);
  scene.add(redLight1);
  const redLight2 = new THREE.PointLight(0xff4466, 2, 8);
  scene.add(redLight2);

  camera.position.z = 5.2;

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  let time = 0;
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => { isVisible = entries[0].isIntersecting; }, { threshold: 0.1 });
  observer.observe(canvas);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    time += 0.01;
    sphere.rotation.y += mouseX * 0.008 + 0.0035;
    sphere.rotation.x += mouseY * 0.006 + 0.001;
    wire.rotation.copy(sphere.rotation);
    core.rotation.y = sphere.rotation.y * 1.2;
    core.scale.setScalar(1 + Math.sin(time * 2.5) * 0.06);
    redLight1.position.x = Math.sin(time * 0.8) * 3.2;
    redLight1.position.z = Math.cos(time * 0.8) * 3.2;
    redLight2.position.x = Math.cos(time * 0.6) * 2.5;
    redLight2.position.y = Math.sin(time * 1.1) * 1.8;

    if (computeUpdate && usingWebGPU) {
      renderer.compute(computeUpdate);
    }

    if (particles && particles.isPoints) {
      particles.rotation.y = time * 0.12;
      particles.rotation.x = time * 0.05;
    }

    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', setSize);
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const messageEl = document.getElementById('formMessage');
  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const servicio = form.servicio.value;
  const descripcion = form.descripcion.value.trim();
  if (!nombre || !email || !servicio || !descripcion) {
    messageEl.style.display = 'block';
    messageEl.style.color = '#E32636';
    messageEl.textContent = 'Por favor completa los campos obligatorios.';
    return;
  }
  const empresa = form.empresa.value.trim();
  const whatsapp = form.whatsapp.value.trim();
  const presupuesto = form.presupuesto.value;
  let msg = `Hola ORVIX, soy ${nombre}`;
  if (empresa) msg += ` de ${empresa}`;
  msg += `. Me interesa: ${servicio}. `;
  if (presupuesto) msg += `Presupuesto: ${presupuesto}. `;
  msg += `Descripción: ${descripcion}`;
  if (whatsapp) msg += ` Mi WhatsApp: ${whatsapp}`;
  msg += ` Email: ${email}`;
  const waUrl = `https://wa.me/52?text=${encodeURIComponent(msg)}`;
  messageEl.style.display = 'block';
  messageEl.style.color = '#25D366';
  messageEl.textContent = 'Redirigiendo a WhatsApp...';
  setTimeout(() => {
    window.open(waUrl, '_blank');
    form.reset();
    messageEl.textContent = 'Mensaje preparado. Si no se abrió WhatsApp, contáctanos directamente.';
  }, 600);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSphere();
});