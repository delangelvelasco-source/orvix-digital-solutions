// Mobile menu
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.getElementById('mobileMenu');

mobileToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

function closeMobile() {
  mobileMenu.classList.remove('active');
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(9,9,9,0.95)';
  } else {
    navbar.style.background = 'rgba(9,9,9,0.85)';
  }
});

// Robust Three.js Hero
async function initHeroSphere() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }

  // Force canvas to be visible
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.minHeight = '280px';

  let THREE;
  try {
    THREE = await import('three');
  } catch (e) {
    console.error('Three.js failed to load:', e);
    return;
  }

  const parent = canvas.parentElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

  // Always use WebGLRenderer for reliability
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  console.log('ORVIX Hero: WebGLRenderer activo');

  function setSize() {
    const size = Math.min(parent.clientWidth || 340, window.innerWidth < 768 ? 340 : 520);
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  setSize();

  // Simple reliable sphere
  const sphereGeo = new THREE.IcosahedronGeometry(1.7, 2);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x111114,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x550000,
    emissiveIntensity: 0.6
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  // Wireframe
  const wire = new THREE.Mesh(
    sphereGeo,
    new THREE.MeshBasicMaterial({ color: 0xE32636, wireframe: true, transparent: true, opacity: 0.3 })
  );
  scene.add(wire);

  // Core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xE32636, transparent: true, opacity: 0.25 })
  );
  scene.add(core);

  // Simple particles
  const particleCount = window.innerWidth < 768 ? 60 : 120;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const radius = 2.2 + Math.random() * 1.0;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: 0xE32636,
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  particles.frustumCulled = false;
  scene.add(particles);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);
  const redLight = new THREE.PointLight(0xE32636, 4, 15);
  scene.add(redLight);

  camera.position.z = 5.2;

  // Pointer
  let pointerX = 0, pointerY = 0;
  let targetX = 0, targetY = 0;

  function onPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    targetX = ((cx - rect.left) / rect.width) * 2 - 1;
    targetY = -((cy - rect.top) / rect.height) * 2 + 1;
  }
  window.addEventListener('mousemove', onPointer);
  window.addEventListener('touchmove', onPointer, { passive: true });

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    pointerX += (targetX - pointerX) * 0.08;
    pointerY += (targetY - pointerY) * 0.08;

    sphere.rotation.y += pointerX * 0.01 + 0.004;
    sphere.rotation.x += pointerY * 0.008 + 0.001;
    wire.rotation.copy(sphere.rotation);
    core.rotation.y = sphere.rotation.y * 1.3;
    core.scale.setScalar(1 + Math.sin(time * 2) * 0.08);

    redLight.position.x = Math.sin(time * 0.7) * 3;
    redLight.position.z = Math.cos(time * 0.7) * 3;

    particles.rotation.y = time * 0.1 + pointerX * 0.2;
    particles.rotation.x = time * 0.05 + pointerY * 0.15;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', setSize);
  console.log('ORVIX: Esfera inicializada correctamente');
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const messageEl = document.getElementById('formMessage');
  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const servicio = form.servicio.value;
  const descripcion = form.descripcion.value.trim();
  if (!nombre || !email || !servicio || !descripcion) {
    messageEl.style.display = 'block';
    messageEl.style.color = '#E32636';
    messageEl.textContent = 'Por favor completa los campos obligatorios.';
    return;
  }
  const empresa = form.empresa.value.trim();
  const whatsapp = form.whatsapp.value.trim();
  const presupuesto = form.presupuesto.value;
  let msg = `Hola ORVIX, soy ${nombre}`;
  if (empresa) msg += ` de ${empresa}`;
  msg += `. Me interesa: ${servicio}. `;
  if (presupuesto) msg += `Presupuesto: ${presupuesto}. `;
  msg += `Descripción: ${descripcion}`;
  if (whatsapp) msg += ` Mi WhatsApp: ${whatsapp}`;
  msg += ` Email: ${email}`;
  const waUrl = `https://wa.me/52?text=${encodeURIComponent(msg)}`;
  messageEl.style.display = 'block';
  messageEl.style.color = '#25D366';
  messageEl.textContent = 'Redirigiendo a WhatsApp...';
  setTimeout(() => {
    window.open(waUrl, '_blank');
    form.reset();
    messageEl.textContent = 'Mensaje preparado. Si no se abrió WhatsApp, contáctanos directamente.';
  }, 600);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSphere();
});