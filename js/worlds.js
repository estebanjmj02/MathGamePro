/**
 * MathWorld – worlds.js
 * Definición de los 5 mundos y sus niveles.
 * Renderizado del mapa de mundos y pantalla de mundo.
 */

const Worlds = (() => {

  /** Definición completa de los 5 mundos */
  const WORLDS = [
    {
      id:       'world1',
      name:     'Bosque de los Números',
      subtitle: 'Reconocimiento numérico',
      icon:     '🌲',
      color:    '#6ECBA5',
      grad:     'linear-gradient(135deg,#1a472a,#2d6a4f,#40916c)',
      nebulaA:  '#40916c',
      nebulaB:  '#1b4332',
      levels: [
        { id:'level1_1', name:'Atrapa el Número',     icon:'🎯', gameIdx:0 },
        { id:'level1_2', name:'Globos Numéricos',      icon:'🎈', gameIdx:1 },
        { id:'level1_3', name:'Cajas Numeradas',       icon:'📦', gameIdx:2 },
        { id:'level1_4', name:'Números Escondidos',    icon:'🔍', gameIdx:3 },
        { id:'level1_5', name:'Escucha y Elige',       icon:'👂', gameIdx:4 },
      ],
    },
    {
      id:       'world2',
      name:     'Montaña de las Secuencias',
      subtitle: 'Conteo secuencial',
      icon:     '🏔️',
      color:    '#6EC6F5',
      grad:     'linear-gradient(135deg,#1e3a5f,#2d6a9f,#4a9ede)',
      nebulaA:  '#2d6a9f',
      nebulaB:  '#0d2137',
      levels: [
        { id:'level2_1', name:'Secuencia Mágica',  icon:'🔢', gameIdx:0 },
        { id:'level2_2', name:'Cadena de Conteo',  icon:'🔗', gameIdx:1 },
        { id:'level2_3', name:'Organiza Números',  icon:'📊', gameIdx:2 },
        { id:'level2_4', name:'Camino Numérico',   icon:'🛤️', gameIdx:3 },
        { id:'level2_5', name:'Carrera Veloz',     icon:'⏱️', gameIdx:4 },
      ],
    },
    {
      id:       'world3',
      name:     'Isla de las Cantidades',
      subtitle: 'Número y cantidad',
      icon:     '🏝️',
      color:    '#FFD93D',
      grad:     'linear-gradient(135deg,#7b4f00,#c47d00,#e8a200)',
      nebulaA:  '#c47d00',
      nebulaB:  '#4a3000',
      levels: [
        { id:'level3_1', name:'¿Cuántos Hay?',    icon:'👀', gameIdx:0 },
        { id:'level3_2', name:'Alimenta Animales', icon:'🐾', gameIdx:1 },
        { id:'level3_3', name:'Cuenta Elementos',  icon:'🧮', gameIdx:2 },
        { id:'level3_4', name:'Empareja Tarjetas', icon:'🃏', gameIdx:3 },
        { id:'level3_5', name:'Rompecabezas',      icon:'🧩', gameIdx:4 },
      ],
    },
    {
      id:       'world4',
      name:     'Laboratorio de Operaciones',
      subtitle: 'Sumas y restas',
      icon:     '🔬',
      color:    '#C3A9F0',
      grad:     'linear-gradient(135deg,#2d0057,#5a0090,#8b00cc)',
      nebulaA:  '#6a0dad',
      nebulaB:  '#1a003d',
      levels: [
        { id:'level4_1', name:'Abre la Puerta',    icon:'🚪', gameIdx:0 },
        { id:'level4_2', name:'Máquina Mágica',    icon:'⚙️', gameIdx:1 },
        { id:'level4_3', name:'Suma Arrastrando',  icon:'➕', gameIdx:2 },
        { id:'level4_4', name:'Resta Visual',      icon:'➖', gameIdx:3 },
        { id:'level4_5', name:'Batalla Amigable',  icon:'⚔️', gameIdx:4 },
      ],
    },
    {
      id:       'world5',
      name:     'Ciudad de los Retos',
      subtitle: 'Problemas cotidianos',
      icon:     '🏙️',
      color:    '#FFB347',
      grad:     'linear-gradient(135deg,#4a1c00,#8b3a00,#c45200)',
      nebulaA:  '#8b3a00',
      nebulaB:  '#2a0f00',
      levels: [
        { id:'level5_1', name:'La Tiendita',     icon:'🛒', gameIdx:0 },
        { id:'level5_2', name:'Problema del Día', icon:'💡', gameIdx:1 },
        { id:'level5_3', name:'Ayuda al Amigo',  icon:'🤝', gameIdx:2 },
        { id:'level5_4', name:'Elige la Respuesta',icon:'🎯', gameIdx:3 },
        { id:'level5_5', name:'Gran Reto Final', icon:'🏆', gameIdx:4 },
      ],
    },
  ];

  // ── Renderizado del Mapa de Mundos ─────────────────────────

  function renderWorldMap() {
    const container = document.getElementById('worlds-map');
    if (!container) return;
    container.innerHTML = '';

    WORLDS.forEach(world => {
      // Todos los mundos están siempre desbloqueados
      const state  = Progress.getState();
      const wData  = state.worlds[world.id];
      const stars  = wData ? wData.stars : 0;
      const starsDisplay = stars > 0 ? '⭐'.repeat(Math.min(stars, 5)) : '';

      const card = document.createElement('div');
      card.className = 'world-card';
      card.style.background = world.grad;
      card.innerHTML = `
        <div class="world-icon">${world.icon}</div>
        <div class="world-name">${world.name}</div>
        <div class="world-subtitle">${world.subtitle}</div>
        <div class="world-stars-row">${starsDisplay}</div>
      `;

      card.addEventListener('click', () => {
        AudioManager.playWorldSelect();
        openWorld(world.id);
      });

      container.appendChild(card);
    });

    // Fondo animado nebulas
    addNebulas('map-screen', '#2d1b69', '#1a1a3e');
  }

  // ── Abrir un mundo ─────────────────────────────────────────

  function openWorld(worldId) {
    const world = WORLDS.find(w => w.id === worldId);
    if (!world) return;

    document.getElementById('world-title').textContent = `${world.icon} ${world.name}`;

    const content = document.getElementById('world-content');
    content.innerHTML = '';
    content.style.background = world.grad;

    const state = Progress.getState();
    const wData = state.worlds[worldId];

    world.levels.forEach((level) => {
      // Todos los niveles están siempre desbloqueados
      const completed = wData && wData.levelsCompleted.includes(level.id);

      const card = document.createElement('div');
      card.className = `level-card ${completed ? 'completed' : ''}`;
      card.innerHTML = `
        <div class="level-icon">${level.icon}</div>
        <div class="level-name">${level.name}</div>
        ${completed ? '<div style="color:var(--mint);font-size:1.2rem;">✓</div>' : ''}
      `;

      card.addEventListener('click', () => {
        AudioManager.playClick();
        // Guarda el worldId activo para poder re-renderizar al volver
        Worlds._activeWorldId = worldId;
        launchLevel(worldId, level.id, level.gameIdx);
      });

      content.appendChild(card);
    });

    // Progress text
    const prog = wData ? wData.levelsCompleted.length : 0;
    document.getElementById('world-progress-text').textContent = `${prog}/${world.levels.length} niveles`;

    // Background del world-screen
    document.getElementById('world-screen').style.background = world.grad;

    addNebulas('world-screen', world.nebulaA, world.nebulaB);

    showScreen('world-screen');
  }

  // ── Iniciar un nivel ───────────────────────────────────────

  function launchLevel(worldId, levelId, gameIdx) {
    Levels.launch(worldId, levelId, gameIdx);
  }

  // ── Nebulas decorativas ────────────────────────────────────

  function addNebulas(screenId, colorA, colorB) {
    const screen = document.getElementById(screenId);
    if (!screen) return;
    // Elimina nebulas previas
    screen.querySelectorAll('.nebula-orb').forEach(el => el.remove());

    const orbs = [
      { color: colorA, size: 300, top: '10%',  left: '5%',   delay: '0s' },
      { color: colorB, size: 250, top: '60%',  right: '5%',  delay: '4s' },
      { color: colorA, size: 200, bottom:'10%',left: '40%',  delay: '8s' },
    ];

    orbs.forEach(o => {
      const orb = document.createElement('div');
      orb.className = 'nebula-orb';
      orb.style.cssText = `
        width:${o.size}px;height:${o.size}px;
        background:${o.color};
        top:${o.top||'auto'};left:${o.left||'auto'};
        right:${o.right||'auto'};bottom:${o.bottom||'auto'};
        animation-delay:${o.delay};
      `;
      screen.appendChild(orb);
    });
  }

  // ── Inicialización ─────────────────────────────────────────

  function init() {
    renderWorldMap();
  }

  /**
   * Re-renderiza el mundo activo (se llama tras completar un nivel
   * para que el tick ✓ aparezca sin tener que salir y volver a entrar).
   */
  function refreshActiveWorld() {
    if (Worlds._activeWorldId) {
      openWorld(Worlds._activeWorldId);
    }
  }

  function getAll() { return WORLDS; }

  return { init, renderWorldMap, openWorld, launchLevel, refreshActiveWorld, getAll };
})();
