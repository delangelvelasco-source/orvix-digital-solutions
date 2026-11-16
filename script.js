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
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.z = 3.8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  // Core sphere
  const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1e,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0x330000,
    emissiveIntensity: 0.3
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // Inner energy
  const energy = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xff2244, transparent: true, opacity: 0.8 })
  );
  scene.add(energy);

  // Tech rings
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xE32636,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.008, 8, 64), ringMat);
  ring1.rotation.x = Math.PI / 2.2;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.006, 8, 64), ringMat.clone());
  ring2.material.opacity = 0.25;
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.y = 0.5;
  scene.add(ring2);

  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.004, 8, 48), ringMat.clone());
  ring3.material.opacity = 0.15;
  ring3.rotation.x = Math.PI / 4;
  ring3.rotation.z = 0.3;
  scene.add(ring3);

  // Grid sphere
  const grid = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    })
  );
  scene.add(grid);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const red = new THREE.PointLight(0xE32636, 4, 8);
  red.position.set(1.5, 0.5, 2);
  scene.add(red);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    core.rotation.y += 0.004;
    grid.rotation.y -= 0.002;
    grid.rotation.x += 0.001;

    ring1.rotation.z = t * 0.3;
    ring2.rotation.z = -t * 0.2;
    ring3.rotation.y = t * 0.15;

    energy.scale.setScalar(1 + Math.sin(t * 2.5) * 0.15);
    red.position.x = Math.sin(t * 0.5) * 1.5;
    red.position.z = Math.cos(t * 0.5) * 1.5;

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