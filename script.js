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
  if (!canvas || typeof THREE === 'undefined') {
    console.error('THREE or canvas missing');
    return;
  }

  const size = 320;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.z = 3.8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  // Much brighter sphere
  const geo = new THREE.SphereGeometry(1.15, 64, 64);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x555560,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0x331111,
    emissiveIntensity: 0.15
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Visible wireframe
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(1.17, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff3355, wireframe: true, transparent: true, opacity: 0.35 })
  );
  scene.add(wire);

  // Bright core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff1133, transparent: true, opacity: 0.8 })
  );
  scene.add(core);

  // Strong lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-5, 6, 8);
  scene.add(key);
  const red = new THREE.PointLight(0xff2244, 8, 15);
  red.position.set(2, 1, 4);
  scene.add(red);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;
    sphere.rotation.y += 0.004;
    wire.rotation.copy(sphere.rotation);
    core.scale.setScalar(1 + Math.sin(t * 2.5) * 0.1);
    red.position.x = Math.sin(t * 0.5) * 2.5;
    red.position.z = Math.cos(t * 0.5) * 2.5;
    renderer.render(scene, camera);
  }
  animate();
  console.log('ORVIX: Esfera brillante activa');
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
  window.open(`https://wa.me/52?text=${encodeURIComponent('Hola ORVIX, soy ' + f.nombre.value + '. Me interesa: ' + f.servicio.value)}`, '_blank');
  f.reset();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSphere);
} else {
  setTimeout(initHeroSphere, 100);
}