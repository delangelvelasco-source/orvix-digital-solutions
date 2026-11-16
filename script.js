// Mobile menu
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileToggle) mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('active'));
function closeMobile() { if (mobileMenu) mobileMenu.classList.remove('active'); }

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.style.background = window.scrollY > 50 ? 'rgba(9,9,9,0.95)' : 'rgba(9,9,9,0.85)';
});

function initHeroSphere() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const isMobile = window.innerWidth < 768;
  const size = isMobile ? 280 : 360;

  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.z = 3.9;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'low-power'
  });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5));
  renderer.setClearColor(0x000000, 0);

  // Adaptive sphere
  const segments = isMobile ? 32 : 48;
  const geo = new THREE.SphereGeometry(1.1, segments, segments);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x4a4a55,
    metalness: 0.8,
    roughness: 0.25,
    emissive: 0x2a1010,
    emissiveIntensity: 0.12
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Light wireframe on desktop only
  let wire = null;
  if (!isMobile) {
    wire = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xE32636, wireframe: true, transparent: true, opacity: 0.25 })
    );
    scene.add(wire);
  }

  // Core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, isMobile ? 16 : 24, isMobile ? 16 : 24),
    new THREE.MeshBasicMaterial({ color: 0xff2244, transparent: true, opacity: 0.65 })
  );
  scene.add(core);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, isMobile ? 0.55 : 0.65));
  const key = new THREE.DirectionalLight(0xffffff, isMobile ? 1.0 : 1.3);
  key.position.set(-4, 5, 6);
  scene.add(key);
  const red = new THREE.PointLight(0xE32636, isMobile ? 5 : 7, 12);
  red.position.set(2, 1, 3);
  scene.add(red);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;
    sphere.rotation.y += 0.0035;
    if (wire) wire.rotation.copy(sphere.rotation);
    core.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
    red.position.x = Math.sin(t * 0.45) * 2.2;
    red.position.z = Math.cos(t * 0.45) * 2.2;
    renderer.render(scene, camera);
  }
  animate();
  console.log('ORVIX: 3D móvil optimizado');
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
  window.open(`https://wa.me/52?text=${encodeURIComponent('Hola ORVIX, soy ' + f.nombre.value)}`, '_blank');
  f.reset();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSphere);
} else {
  initHeroSphere();
}