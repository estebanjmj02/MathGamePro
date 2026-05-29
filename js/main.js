/**
 * MathWorld – main.js
 * Controlador principal: inicialización, navegación y lógica global
 */

/* ── Estado global ──────────────────────────────────────── */
let gameState = null;

/* ── Pantalla visible ───────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    if (window.gsap) {
      gsap.from(target, { opacity: 0, duration: 0.35, ease: 'power2.out' });
    }
  }
}

/* ── Toast notification ─────────────────────────────────── */
function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 350);
  }, duration);
}

/* ── Animaciones de pantalla inicial ────────────────────── */
function animateHomeScreen() {
  // Floating math symbols
  const container = document.querySelector('.floating-math');
  if (!container) return;
  const symbols = container.querySelectorAll('span');
  symbols.forEach(span => {
    span.style.left   = `${Math.random() * 95}%`;
    span.style.animationDuration = `${8 + Math.random() * 14}s`;
    span.style.animationDelay   = `${Math.random() * 8}s`;
    span.style.fontSize = `${1.2 + Math.random() * 2.5}rem`;
  });

  // GSAP entrance
  if (window.gsap) {
    const tl = gsap.timeline();
    tl.from('.logo-icon',   { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(2)' })
      .from('.main-logo',   { y: 30, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
      .from('.logo-tagline',{ y: 20, opacity: 0, duration: 0.4 }, '-=0.2')
      .from('.home-form',   { y: 40, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.1');
  }
}

/* ── Three.js: esferas flotantes 3D ─────────────────────── */
function initThreeBackground() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || !window.THREE) return;

  const W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
  camera.position.z = 5;

  // Esferas de colores
  const colors = [0x6EC6F5, 0xC3A9F0, 0xFFD93D, 0x6ECBA5, 0xFFB347, 0xFF8FA3];
  const spheres = [];
  for (let i = 0; i < 12; i++) {
    const geo  = new THREE.SphereGeometry(0.12 + Math.random() * 0.18, 12, 12);
    const mat  = new THREE.MeshPhongMaterial({
      color: colors[i % colors.length],
      shininess: 120,
      transparent: true,
      opacity: 0.75,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 3
    );
    mesh.userData = {
      vx: (Math.random() - 0.5) * 0.005,
      vy: (Math.random() - 0.5) * 0.005,
      rx: Math.random() * 0.01,
      ry: Math.random() * 0.01,
    };
    scene.add(mesh);
    spheres.push(mesh);
  }

  // Luz
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const point   = new THREE.PointLight(0xFFD93D, 1.5, 15);
  point.position.set(3, 3, 3);
  scene.add(ambient, point);

  function animate() {
    requestAnimationFrame(animate);
    spheres.forEach(m => {
      m.position.x += m.userData.vx;
      m.position.y += m.userData.vy;
      m.rotation.x += m.userData.rx;
      m.rotation.y += m.userData.ry;
      // Rebote
      if (Math.abs(m.position.x) > 5) m.userData.vx *= -1;
      if (Math.abs(m.position.y) > 3) m.userData.vy *= -1;
    });
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
}

/* ── Particles.js: partículas matemáticas ───────────────── */
function initParticles() {
  if (!window.particlesJS) return;
  particlesJS('particles-js', {
    particles: {
      number: { value: 55, density: { enable: true, value_area: 800 } },
      color:  { value: ['#FFD93D', '#6EC6F5', '#C3A9F0', '#6ECBA5', '#FFB347'] },
      shape:  { type: 'char', character: { value: ['+','−','×','÷','1','2','3','4','5','★','='] , font:'Baloo 2', weight:'700' } },
      opacity:{ value: 0.5, random: true },
      size:   { value: 14, random: true, anim: { enable: true, speed: 2, size_min: 8 } },
      move:   { enable: true, speed: 1.2, direction: 'none', random: true, out_mode: 'out' },
      line_linked: { enable: false },
    },
    interactivity: {
      detect_on: 'canvas',
      events:    { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
      modes:     { repulse: { distance: 80 }, push: { particles_nb: 2 } },
    },
    retina_detect: true,
  });
}

/* ── Pantalla de carga ──────────────────────────────────── */
function runLoadingScreen() {
  const bar  = document.getElementById('loader-bar');
  const text = document.getElementById('loader-text');
  const messages = [
    'Cargando mundos mágicos...',
    'Preparando aventuras matemáticas...',
    'Despertando a los personajes...',
    '¡Casi listo para explorar!',
  ];
  let progress = 0;
  let msgIdx   = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress > 100) progress = 100;
    if (bar)  bar.style.width = `${progress}%`;
    if (text) text.textContent = messages[Math.min(msgIdx++, messages.length - 1)];

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        showScreen('home-screen');
        initParticles();
        initThreeBackground();
        animateHomeScreen();
        AudioManager.resume();
        AudioManager.startBgMusic();
      }, 500);
    }
  }, 200);
}

/* ── Validación y arranque ──────────────────────────────── */
function setupHomeScreen() {
  let selectedAge = null;

  // Botones de edad
  document.querySelectorAll('.age-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.age-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAge = parseInt(btn.dataset.age);
      AudioManager.playClick();
    });
  });

  // Botón comenzar
  document.getElementById('btn-start').addEventListener('click', () => {
    AudioManager.resume();
    AudioManager.playClick();

    const name     = document.getElementById('player-name').value.trim();
    const lastname = document.getElementById('player-lastname').value.trim();

    if (!name) {
      showToast('✏️ Escribe tu nombre para continuar');
      document.getElementById('player-name').focus();
      return;
    }
    if (!selectedAge) {
      showToast('🎂 Elige tu edad para continuar');
      return;
    }

    // Guarda en estado
    gameState.player.name     = name;
    gameState.player.lastname = lastname;
    gameState.player.age      = selectedAge;
    Storage.save(gameState);

    // Va a selección de personaje
    Characters.renderCharacterGrid('characters-grid', (char) => {
      document.getElementById('btn-confirm-character').disabled = false;
    });
    showScreen('character-screen');
  });

  // Confirmar personaje
  document.getElementById('btn-confirm-character').addEventListener('click', () => {
    AudioManager.playClick();
    const selected = Characters.getSelected();
    if (!selected) {
      showToast('🎭 Elige un personaje primero');
      return;
    }
    gameState.player.character = selected.id;
    Storage.save(gameState);

    // Ir al mapa
    Progress.init(gameState);
    Worlds.init();
    showScreen('map-screen');

    // Saludo del personaje
    setTimeout(() => {
      Characters.speak(selected.id,
        `¡Hola ${gameState.player.name}! Soy ${selected.name}. ¡Vamos a explorar mundos matemáticos juntos! ${selected.emoji}`
      );
    }, 600);
  });

  // Botón salir del juego
  document.getElementById('btn-exit-game').addEventListener('click', () => {
    AudioManager.playClick();
    showScreen('world-screen');
  });

  // Inputs: efecto al escribir
  ['player-name', 'player-lastname'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        if (window.gsap) gsap.from(input, { scaleX: 1.01, duration: 0.15, ease: 'power1.out' });
      });
    }
  });
}

/* ── Carga de datos previos ─────────────────────────────── */
function loadSavedGame() {
  gameState = Storage.load();

  // Si hay una partida guardada con personaje, ir al mapa
  if (gameState.player.name && gameState.player.character) {
    const char = Characters.getById(gameState.player.character);
    Characters.setSelected(gameState.player.character);

    // Pre-llena el formulario
    const nameInput = document.getElementById('player-name');
    const lastInput = document.getElementById('player-lastname');
    if (nameInput) nameInput.value = gameState.player.name;
    if (lastInput) lastInput.value = gameState.player.lastname;

    // Selecciona la edad
    document.querySelectorAll('.age-btn').forEach(btn => {
      if (parseInt(btn.dataset.age) === gameState.player.age) btn.classList.add('selected');
    });

    return true; // Hay partida guardada
  }
  return false;
}

/* ── Estilos del game-screen según mundo ────────────────── */
function styleGameScreen(worldId) {
  const worlds = Worlds.getAll();
  const world  = worlds.find(w => w.id === worldId);
  if (world) {
    document.getElementById('game-screen').style.background = world.grad;
  }
}

/* ── Inicialización principal ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Reinicia el progreso cada vez que se abre la página (sin memoria entre sesiones)
  Storage.resetOnStart();

  // Registra plugin GSAP
  if (window.gsap && window.MotionPathPlugin) {
    gsap.registerPlugin(MotionPathPlugin);
  }

  // Setup de pantalla de inicio
  setupHomeScreen();

  // Carga estado guardado
  loadSavedGame();

  // Arranca loading screen
  showScreen('loading-screen');
  runLoadingScreen();

  // ── Atajos de teclado (accesibilidad) ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('reward-modal');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        showScreen('world-screen');
      }
    }
  });

  // ── Accesibilidad: anunciar cambios de pantalla ──
  document.querySelectorAll('.screen').forEach(screen => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          if (screen.classList.contains('active')) {
            screen.setAttribute('aria-hidden', 'false');
          } else {
            screen.setAttribute('aria-hidden', 'true');
          }
        }
      });
    });
    observer.observe(screen, { attributes: true });
  });

  console.log('%c🌍 MathWorld cargado correctamente!', 'color:#FFD93D;font-size:1.2rem;font-weight:bold;');
  console.log('%cVersión 1.0.0 | Desarrollado con ❤️ para niños con discalculia', 'color:#6ECBA5;');
});
