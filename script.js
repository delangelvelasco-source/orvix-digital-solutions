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

  const size = 300;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.z = 3.6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  // Solid metallic sphere
  const geo = new THREE.SphereGeometry(1.05, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2c2c32,
    metalness: 0.92,
    roughness: 0.18,
    emissive: 0x1a0505,
    emissiveIntensity: 0.1
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Subtle wireframe overlay
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    })
  );
  scene.add(wire);

  // Inner energy core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xff1a3a,
      transparent: true,
      opacity: 0.7
    })
  );
  scene.add(core);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const red = new THREE.PointLight(0xE32636, 5, 10);
  red.position.set(1.8, 0.8, 2.5);
  scene.add(red);
  const fill = new THREE.PointLight(0x4466ff, 1.5, 8);
  fill.position.set(-1.5, -0.5, 2);
  scene.add(fill);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.004;
    sphere.rotation.y += 0.003;
    sphere.rotation.x = Math.sin(t * 0.15) * 0.04;
    wire.rotation.copy(sphere.rotation);
    core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.12);
    red.position.x = Math.sin(t * 0.4) * 1.8;
    red.position.z = Math.cos(t * 0.4) * 1.8;
    renderer.render(scene, camera);
  }
  animate();
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