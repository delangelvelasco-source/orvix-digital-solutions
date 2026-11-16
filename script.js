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
  if (!canvas || typeof THREE === 'undefined') return;

  const isMobile = window.innerWidth < 768;
  const size = isMobile ? 300 : 380;

  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.z = 4.2;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  // Better sphere
  const geo = new THREE.IcosahedronGeometry(1.35, 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x2a2a30,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0x550000,
    emissiveIntensity: 0.35
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Visible wireframe
  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.38, 1),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    })
  );
  scene.add(wire);

  // Inner core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      transparent: true,
      opacity: 0.25
    })
  );
  scene.add(core);

  // Stronger lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);

  const redLight = new THREE.PointLight(0xE32636, 4, 15);
  redLight.position.set(2.5, 1.5, 3);
  scene.add(redLight);

  const redLight2 = new THREE.PointLight(0xff3355, 2, 8);
  redLight2.position.set(-2, -1, 2);
  scene.add(redLight2);

  // Particles
  const count = isMobile ? 50 : 80;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1.9 + Math.random() * 0.7;
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
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  scene.add(particles);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    sphere.rotation.y += 0.005;
    sphere.rotation.x = Math.sin(t * 0.4) * 0.12;
    wire.rotation.copy(sphere.rotation);
    core.rotation.y = sphere.rotation.y * 1.3;
    core.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06);
    redLight.position.x = Math.sin(t * 0.6) * 2.8;
    redLight.position.z = Math.cos(t * 0.6) * 2.8;
    redLight2.position.x = Math.cos(t * 0.4) * 2;
    particles.rotation.y = t * 0.07;
    renderer.render(scene, camera);
  }
  animate();
  console.log('ORVIX: Esfera mejorada');
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSphere);
} else {
  initHeroSphere();
}