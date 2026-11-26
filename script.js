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

/* ORVIX IA — conexión real al Worker */
(() => {
  "use strict";

  const API = "https://orvix-ai-dev.delangel-velasco.workers.dev/api/chat";
  const SESSION_KEY = "orvix_ai_conversation_id";
  let busy = false;

  const $ = (selector) => document.querySelector(selector);

  function message(text, type) {
    const area = $("#aiMessages");
    if (!area) return null;

    const el = document.createElement("div");
    el.className = `orvix-chat-message orvix-chat-${type}`;
    el.textContent = text;
    area.appendChild(el);
    area.scrollTop = area.scrollHeight;
    return el;
  }

  window.openAIChat = function () {
    const panel = $("#aiChat");
    if (!panel) {
      console.error("ORVIX IA: falta el elemento #aiChat");
      return;
    }

    panel.style.setProperty("display", "flex", "important");
    panel.classList.add("orvix-ai-open");
    panel.setAttribute("aria-hidden", "false");

    setTimeout(() => $("#aiInput")?.focus(), 100);
  };

  window.closeAIChat = function () {
    const panel = $("#aiChat");
    if (!panel) return;

    panel.classList.remove("orvix-ai-open");
    panel.style.setProperty("display", "none", "important");
    panel.setAttribute("aria-hidden", "true");
  };

  window.sendAIMessage = async function () {
    const input = $("#aiInput");
    if (!input || busy) return;

    const text = input.value.trim();
    if (!text) return;

    if (text.length > 4000) {
      message("El mensaje supera el límite de 4,000 caracteres.", "error");
      return;
    }

    busy = true;
    input.value = "";
    input.disabled = true;

    message(text, "user");
    const typing = message("ORVIX IA está escribiendo…", "typing");

    try {
      let conversationId = "";
      try {
        conversationId = sessionStorage.getItem(SESSION_KEY) || "";
      } catch {}

      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          ...(conversationId ? { conversationId } : {})
        })
      });

      const data = await response.json();

      if (!response.ok || data.success !== true ||
          typeof data.reply !== "string") {
        throw new Error(data.error || data.code || `HTTP ${response.status}`);
      }

      if (data.conversationId) {
        try {
          sessionStorage.setItem(SESSION_KEY, data.conversationId);
        } catch {}
      }

      typing?.remove();
      message(data.reply, "assistant");

    } catch (error) {
      typing?.remove();
      console.error("ORVIX IA:", error);
      message(
        "No pude conectar con ORVIX IA. Intenta nuevamente.",
        "error"
      );
    } finally {
      busy = false;
      input.disabled = false;
      input.focus();
    }
  };

  function initialize() {
    if (!$("#aiChat") || !$("#aiMessages") || !$("#aiInput")) {
      console.error("ORVIX IA: faltan elementos del chat en index.html");
      return;
    }

    if (!$("#orvixAIButton")) {
      const launcher = document.createElement("button");
      launcher.id = "orvixAIButton";
      launcher.type = "button";
      launcher.textContent = "✦ Hablar con ORVIX IA";
      launcher.addEventListener("click", window.openAIChat);
      document.body.appendChild(launcher);
    }

    const input = $("#aiInput");
    if (!input.dataset.orvixBound) {
      input.dataset.orvixBound = "true";
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" &&
            !(event.shiftKey && input.tagName === "TEXTAREA")) {
          event.preventDefault();
          window.sendAIMessage();
        }
      });
    }

    const close = document.querySelector(
      "#aiChat [onclick*='closeAIChat']"
    );
    close?.addEventListener("click", window.closeAIChat);

    window.closeAIChat();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
