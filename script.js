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

  const parent = canvas.parentElement;
  const size = Math.min(parent.clientWidth || 320, 320);
  canvas.width = size * 2;
  canvas.height = size * 2;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  let THREE;
  try {
    THREE = await import('three');
  } catch (e) {
    console.error('Three.js load failed', e);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 4.8;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'default'
  });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Cleaner sphere
  const geo = new THREE.IcosahedronGeometry(1.5, 3);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1e,
    metalness: 0.85,
    roughness: 0.25,
    emissive: 0x3a0000,
    emissiveIntensity: 0.4
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Subtle wireframe
  const wireGeo = new THREE.IcosahedronGeometry(1.52, 2);
  const wire = new THREE.Mesh(
    wireGeo,
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    })
  );
  scene.add(wire);

  // Inner glow
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      transparent: true,
      opacity: 0.15
    })
  );
  scene.add(core);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(-2, 3, 4);
  scene.add(key);
  const red = new THREE.PointLight(0xE32636, 2.5, 12);
  red.position.set(2.5, 1, 2);
  scene.add(red);

  // Soft particles
  const count = 80;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.0 + Math.random() * 0.8;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i*3] = r * Math.sin(ph) * Math.cos(th);
    pos[i*3+1] = r * Math.sin(ph) * Math.sin(th);
    pos[i*3+2] = r * Math.cos(ph);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0xE32636,
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  scene.add(particles);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    sphere.rotation.y += 0.004;
    sphere.rotation.x = Math.sin(t * 0.3) * 0.15;
    wire.rotation.copy(sphere.rotation);
    core.rotation.y = sphere.rotation.y * 1.2;
    core.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
    red.position.x = Math.sin(t * 0.6) * 2.5;
    red.position.z = Math.cos(t * 0.6) * 2.5;
    particles.rotation.y = t * 0.08;
    renderer.render(scene, camera);
  }
  animate();
  console.log('ORVIX: Esfera lista');
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