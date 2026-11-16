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

async function initHeroSphere() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
  const parent = canvas.parentElement;
  const size = Math.min(parent.clientWidth || 300, isMobile ? 300 : 420);

  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  let THREE;
  try {
    THREE = await import('three');
  } catch (e) {
    console.error('Three.js failed', e);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.z = 4.6;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'low-power'
  });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
  renderer.setClearColor(0x000000, 0);

  // Adaptive geometry
  const detail = isMobile ? 1 : 2;
  const geo = new THREE.IcosahedronGeometry(1.45, detail);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x18181c,
    metalness: 0.8,
    roughness: 0.3,
    emissive: 0x2a0000,
    emissiveIntensity: isMobile ? 0.3 : 0.45
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Wireframe only on desktop or very light on mobile
  if (!isMobile) {
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.48, 1),
      new THREE.MeshBasicMaterial({ color: 0xE32636, wireframe: true, transparent: true, opacity: 0.2 })
    );
    scene.add(wire);
    wire.rotation.copy = () => {};
  }

  // Core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, isMobile ? 16 : 24, isMobile ? 16 : 24),
    new THREE.MeshBasicMaterial({ color: 0xE32636, transparent: true, opacity: 0.12 })
  );
  scene.add(core);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const red = new THREE.PointLight(0xE32636, isMobile ? 1.8 : 2.2, 10);
  red.position.set(2, 1, 2);
  scene.add(red);

  // Fewer particles on mobile
  const count = isMobile ? 40 : 90;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1.9 + Math.random() * 0.7;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    positions[i*3] = r * Math.sin(ph) * Math.cos(th);
    positions[i*3+1] = r * Math.sin(ph) * Math.sin(th);
    positions[i*3+2] = r * Math.cos(ph);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0xE32636,
      size: isMobile ? 0.03 : 0.022,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  scene.add(particles);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.007;
    sphere.rotation.y += 0.0035;
    sphere.rotation.x = Math.sin(t * 0.25) * 0.1;
    core.rotation.y = sphere.rotation.y * 1.1;
    core.scale.setScalar(1 + Math.sin(t * 1.2) * 0.04);
    red.position.x = Math.sin(t * 0.5) * 2;
    red.position.z = Math.cos(t * 0.5) * 2;
    particles.rotation.y = t * 0.06;
    renderer.render(scene, camera);
  }
  animate();

  console.log(`ORVIX: Esfera móvil optimizada (${isMobile ? 'mobile' : 'desktop'})`);
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

document.addEventListener('DOMContentLoaded', initHeroSphere);