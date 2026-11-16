// Mobile menu
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });
}

function closeMobile() {
  if (mobileMenu) mobileMenu.classList.remove('active');
}

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.style.background = window.scrollY > 50 ? 'rgba(9,9,9,0.95)' : 'rgba(9,9,9,0.85)';
  }
});

function initHeroSphere() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    console.error('Canvas or THREE not available');
    return;
  }

  const isMobile = window.innerWidth < 768;
  const size = isMobile ? 280 : 360;

  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.z = 4.5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: !isMobile
  });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
  renderer.setClearColor(0x000000, 0);

  // Sphere
  const geo = new THREE.IcosahedronGeometry(1.4, isMobile ? 1 : 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1e,
    metalness: 0.75,
    roughness: 0.35,
    emissive: 0x330000,
    emissiveIntensity: 0.4
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xE32636, transparent: true, opacity: 0.2 })
  );
  scene.add(core);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const redLight = new THREE.PointLight(0xE32636, 2, 10);
  redLight.position.set(2, 1, 3);
  scene.add(redLight);

  // Particles
  const count = isMobile ? 30 : 60;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1.8 + Math.random() * 0.6;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
    positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    positions[i * 3 + 2] = r * Math.cos(ph);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0xE32636,
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5
    })
  );
  scene.add(particles);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    sphere.rotation.y += 0.004;
    sphere.rotation.x = Math.sin(t * 0.3) * 0.1;
    core.rotation.y = sphere.rotation.y * 1.2;
    core.scale.setScalar(1 + Math.sin(t) * 0.05);
    redLight.position.x = Math.sin(t * 0.5) * 2;
    redLight.position.z = Math.cos(t * 0.5) * 2;
    particles.rotation.y = t * 0.05;
    renderer.render(scene, camera);
  }
  animate();
  console.log('ORVIX: Esfera Safari-compatible lista');
}

function handleSubmit(e) {
  e.preventDefault();
  const f = e.target;
  const msg = document.getElementById('formMessage');
  if (!f.nombre.value || !f.email.value || !f.servicio.value || !f.descripcion.value) {
    msg.style.display = 'block';
    msg.style.color = '#E32636';
    msg.textContent = 'Completa los campos.';
    return;
  }
  const text = `Hola ORVIX, soy ${f.nombre.value}. Me interesa: ${f.servicio.value}. ${f.descripcion.value}`;
  window.open(`https://wa.me/52?text=${encodeURIComponent(text)}`, '_blank');
  f.reset();
  msg.style.display = 'block';
  msg.style.color = '#25D366';
  msg.textContent = 'Abriendo WhatsApp...';
}

// Wait for Three.js to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSphere);
} else {
  initHeroSphere();
}