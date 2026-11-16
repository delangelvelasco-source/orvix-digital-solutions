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
  scene.fog = new THREE.FogExp2(0x150408, 0.06);

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

  // Sphere
  const geo = new THREE.IcosahedronGeometry(1.28, 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x222228,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0x3a0000,
    emissiveIntensity: 0.3
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Wireframe
  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.32, 1),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    })
  );
  scene.add(wire);

  // Core
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      transparent: true,
      opacity: 0.35
    })
  );
  scene.add(core);

  // Mie scattering approximation: multiple glow layers
  // Forward scatter (stronger in light direction)
  const mieGeo = new THREE.SphereGeometry(1.6, 32, 32);
  const mieMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xE32636) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        // Mie-like forward scattering approximation
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.5);
        float pulse = 0.6 + 0.4 * sin(uTime * 1.2);
        float alpha = fresnel * 0.35 * pulse;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  });
  const mieGlow = new THREE.Mesh(mieGeo, mieMat);
  scene.add(mieGlow);

  // Outer soft glow
  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xE32636,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide
    })
  );
  scene.add(outerGlow);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.65);
  keyLight.position.set(-2.5, 3.5, 4);
  scene.add(keyLight);

  const redLight = new THREE.PointLight(0xE32636, 4.5, 16);
  redLight.position.set(2.2, 1.2, 2.8);
  scene.add(redLight);

  // Particles
  const count = isMobile ? 40 : 65;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1.8 + Math.random() * 0.5;
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
      size: 0.038,
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
    t += 0.008;
    sphere.rotation.y += 0.0045;
    sphere.rotation.x = Math.sin(t * 0.3) * 0.08;
    wire.rotation.copy(sphere.rotation);
    core.rotation.y = sphere.rotation.y * 1.25;
    core.scale.setScalar(1 + Math.sin(t * 1.6) * 0.05);
    mieGlow.material.uniforms.uTime.value = t;
    mieGlow.scale.setScalar(1 + Math.sin(t * 0.7) * 0.03);
    outerGlow.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
    redLight.position.x = Math.sin(t * 0.5) * 2.4;
    redLight.position.z = Math.cos(t * 0.5) * 2.4;
    particles.rotation.y = t * 0.055;
    renderer.render(scene, camera);
  }
  animate();
  console.log('ORVIX: Mie scattering approximation activa');
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