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

  const size = 300;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = 4.0;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  // Clean metallic sphere
  const geo = new THREE.SphereGeometry(1.2, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3a3a42,
    metalness: 0.95,
    roughness: 0.12,
    emissive: 0x220000,
    emissiveIntensity: 0.2
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Thin wireframe
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    })
  );
  scene.add(wire);

  // Bright core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff2244,
      transparent: true,
      opacity: 0.6
    })
  );
  scene.add(core);

  // Soft outer glow
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    })
  );
  scene.add(glow);

  // Strong lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(-4, 5, 6);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x8888aa, 0.4);
  fillLight.position.set(3, -2, 2);
  scene.add(fillLight);

  const redLight = new THREE.PointLight(0xE32636, 6, 12);
  redLight.position.set(2, 1, 3);
  scene.add(redLight);

  // Subtle particles
  const count = 35;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1.7 + Math.random() * 0.4;
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
      color: 0xff4466,
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  scene.add(particles);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.006;
    sphere.rotation.y += 0.003;
    sphere.rotation.x = Math.sin(t * 0.2) * 0.05;
    wire.rotation.copy(sphere.rotation);
    core.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
    glow.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);
    redLight.position.x = Math.sin(t * 0.4) * 2;
    redLight.position.z = Math.cos(t * 0.4) * 2;
    particles.rotation.y = t * 0.04;
    renderer.render(scene, camera);
  }
  animate();
  console.log('ORVIX: Esfera premium');
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