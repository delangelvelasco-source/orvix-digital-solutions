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

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.style.background = window.scrollY > 50 ? 'rgba(9,9,9,0.95)' : 'rgba(9,9,9,0.85)';
  }
});

async function initHeroSphere() {
  console.log('ORVIX: Iniciando hero...');
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) {
    console.error('ORVIX: Canvas no encontrado');
    return;
  }
  console.log('ORVIX: Canvas encontrado');

  // Force dimensions
  const parent = canvas.parentElement;
  const size = Math.min(parent.clientWidth || 340, 340);
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';

  let THREE;
  try {
    THREE = await import('three');
    console.log('ORVIX: Three.js cargado');
  } catch (e) {
    console.error('ORVIX: Error cargando Three.js', e);
    // Fallback visual
    canvas.style.background = 'radial-gradient(circle, #E32636 0%, #090909 70%)';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  console.log('ORVIX: Renderer creado');

  // Sphere
  const geo = new THREE.IcosahedronGeometry(1.6, 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.8,
    roughness: 0.3,
    emissive: 0x660000,
    emissiveIntensity: 0.7
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Wire
  const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xE32636, wireframe: true, transparent: true, opacity: 0.4 }));
  scene.add(wire);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const light = new THREE.PointLight(0xE32636, 5, 20);
  light.position.set(3, 2, 4);
  scene.add(light);

  let t = 0;
  function loop() {
    requestAnimationFrame(loop);
    t += 0.01;
    sphere.rotation.y += 0.008;
    sphere.rotation.x += 0.003;
    wire.rotation.copy(sphere.rotation);
    light.position.x = Math.sin(t) * 3;
    light.position.z = Math.cos(t) * 3;
    renderer.render(scene, camera);
  }
  loop();
  console.log('ORVIX: Loop iniciado - esfera debería ser visible');
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const msgEl = document.getElementById('formMessage');
  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const servicio = form.servicio.value;
  const desc = form.descripcion.value.trim();
  if (!nombre || !email || !servicio || !desc) {
    msgEl.style.display = 'block';
    msgEl.style.color = '#E32636';
    msgEl.textContent = 'Completa los campos obligatorios.';
    return;
  }
  let msg = `Hola ORVIX, soy ${nombre}. Me interesa: ${servicio}. ${desc}`;
  window.open(`https://wa.me/52?text=${encodeURIComponent(msg)}`, '_blank');
  form.reset();
  msgEl.style.display = 'block';
  msgEl.style.color = '#25D366';
  msgEl.textContent = 'Redirigiendo a WhatsApp...';
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('ORVIX: DOM listo');
  initHeroSphere();
});