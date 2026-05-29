/**
 * MathWorld – progress.js
 * Sistema de puntos, experiencia, niveles, estrellas y medallas
 */

const Progress = (() => {
  let state = null;

  /** XP requerida para cada nivel */
  const XP_TABLE = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];

  function init(savedState) {
    state = savedState;
    updateHUD();
  }

  function getState() { return state; }

  // ── Puntos ─────────────────────────────────────────────────
  function addPoints(pts) {
    state.progress.points += pts;
    addXP(Math.floor(pts * 0.6));
    updateHUD();
    showFloatingPoints(pts);
  }

  // ── XP & Niveles ───────────────────────────────────────────
  function addXP(amount) {
    state.progress.xp += amount;
    // Chequea si sube de nivel
    const maxLevel = XP_TABLE.length - 1;
    while (
      state.progress.level < maxLevel &&
      state.progress.xp >= XP_TABLE[state.progress.level]
    ) {
      state.progress.level++;
      onLevelUp(state.progress.level);
    }
    updateXPBar();
  }

  function onLevelUp(newLevel) {
    AudioManager.playLevelUp();
    showToast(`🎉 ¡Subiste al Nivel ${newLevel}!`, 3000);
    Characters.speak(
      state.player.character || 'numi',
      `¡Increíble! ¡Llegaste al Nivel ${newLevel}! ¡Eres una estrella! ⭐`
    );
    // Bonus de estrellas al subir de nivel
    addStars(1);
  }

  // ── Estrellas ──────────────────────────────────────────────
  function addStars(count) {
    state.progress.stars += count;
    updateHUD();
    // Efecto visual de estrella
    for (let i = 0; i < count; i++) {
      setTimeout(() => AudioManager.playStar(), i * 120);
    }
  }

  // ── Medallas ───────────────────────────────────────────────
  function addMedal() {
    state.progress.medals++;
    updateHUD();
    showToast('🏅 ¡Nueva medalla!', 2500);
  }

  // ── Mundos & Niveles ───────────────────────────────────────
  /**
   * Registra el nivel completado en un mundo
   * @param {string} worldId  - e.g. 'world1'
   * @param {string} levelId  - e.g. 'level1_1'
   * @param {number} starsEarned - 1-3
   */
  function completeLevel(worldId, levelId, starsEarned, pointsEarned) {
    const w = state.worlds[worldId];
    if (!w) return;

    if (!w.levelsCompleted.includes(levelId)) {
      w.levelsCompleted.push(levelId);
    }
    w.stars = Math.max(w.stars, (w.stars || 0) + starsEarned);

    addPoints(pointsEarned);
    addStars(starsEarned);

    // Desbloquea siguiente mundo si se completaron 3 niveles
    unlockNextWorldIfNeeded(worldId);

    Storage.save(state);
  }

  function unlockNextWorldIfNeeded(worldId) {
    const worldNum = parseInt(worldId.replace('world', ''));
    const w = state.worlds[worldId];
    if (!w) return;

    // Desbloquear el siguiente mundo con 3+ niveles completados
    if (w.levelsCompleted.length >= 3) {
      const nextId = `world${worldNum + 1}`;
      if (state.worlds[nextId] && !state.worlds[nextId].unlocked) {
        state.worlds[nextId].unlocked = true;
        setTimeout(() => {
          showToast(`🌍 ¡Nuevo mundo desbloqueado!`, 3000);
        }, 1500);
      }
    }
  }

  function isLevelCompleted(worldId, levelId) {
    const w = state.worlds[worldId];
    return w ? w.levelsCompleted.includes(levelId) : false;
  }

  function isWorldUnlocked(worldId) {
    const w = state.worlds[worldId];
    return w ? w.unlocked : false;
  }

  // ── HUD ────────────────────────────────────────────────────
  function updateHUD() {
    if (!state) return;
    const p = state.progress;

    setText('hud-name',   `${state.player.name || 'Explorador'}`);
    setText('hud-level',  `Nivel ${p.level}`);
    setText('hud-stars',  p.stars);
    setText('hud-medals', p.medals);
    setText('hud-points', p.points.toLocaleString());

    const charId = state.player.character;
    if (charId) {
      const char = Characters.getById(charId);
      setText('hud-avatar', char ? char.emoji : '🌟');
    }

    updateXPBar();
  }

  function updateXPBar() {
    if (!state) return;
    const p      = state.progress;
    const maxLv  = XP_TABLE.length - 1;
    const curr   = p.xp - (XP_TABLE[p.level - 1] || 0);
    const needed = (XP_TABLE[p.level] || XP_TABLE[maxLv]) - (XP_TABLE[p.level - 1] || 0);
    const pct    = Math.min(100, Math.round((curr / needed) * 100));

    const bar = document.getElementById('xp-bar');
    if (bar) bar.style.width = `${pct}%`;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // ── Floating points animation ──────────────────────────────
  function showFloatingPoints(pts) {
    const el = document.createElement('div');
    el.textContent = `+${pts}`;
    el.style.cssText = `
      position:fixed;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      font-family:var(--font-display);
      font-size:2rem;
      font-weight:800;
      color:var(--yellow);
      text-shadow:0 0 20px rgba(255,217,61,0.8);
      pointer-events:none;
      z-index:9999;
    `;
    document.body.appendChild(el);
    if (window.gsap) {
      gsap.to(el, {
        y: -80, opacity: 0, duration: 1.2,
        ease: 'power2.out',
        onComplete: () => el.remove(),
      });
    } else {
      setTimeout(() => el.remove(), 1200);
    }
  }

  // ── Confetti ───────────────────────────────────────────────
  function launchConfetti(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const colors = ['#FFD93D', '#6EC6F5', '#C3A9F0', '#6ECBA5', '#FFB347', '#FF8FA3'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left     = `${Math.random() * 100}%`;
      piece.style.top      = '-10px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width    = `${6 + Math.random() * 8}px`;
      piece.style.height   = `${6 + Math.random() * 8}px`;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = `${0.8 + Math.random() * 1.2}s`;
      piece.style.animationDelay    = `${Math.random() * 0.5}s`;
      container.appendChild(piece);
    }
  }

  // ── Reward Modal ───────────────────────────────────────────
  function showRewardModal(starsEarned, points, message, onNext) {
    const modal = document.getElementById('reward-modal');
    if (!modal) return;

    // Estrellas
    const starsEl = document.getElementById('reward-stars');
    starsEl.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const star = document.createElement('span');
      star.textContent = i <= starsEarned ? '⭐' : '☆';
      star.style.animationDelay = `${(i - 1) * 0.15}s`;
      star.classList.add('anim-star-spin');
      starsEl.appendChild(star);
    }

    document.getElementById('reward-title').textContent =
      starsEarned === 3 ? '¡Perfecto! 🎉' :
      starsEarned === 2 ? '¡Excelente! ✨' : '¡Buen trabajo! 👍';

    document.getElementById('reward-message').textContent = message || '¡Completaste el nivel!';
    document.getElementById('reward-points-val').textContent = points;

    modal.classList.remove('hidden');
    AudioManager.playVictory();
    launchConfetti('confetti-container');

    // Botón siguiente
    const btnNext = document.getElementById('btn-next-level');
    if (btnNext) {
      btnNext.onclick = () => {
        modal.classList.add('hidden');
        if (onNext) onNext();
      };
    }

    if (window.gsap) {
      gsap.from(modal.querySelector('.modal-content'), {
        scale: 0.7, opacity: 0, duration: 0.5,
        ease: 'back.out(2)',
      });
    }
  }

  return {
    init, getState, addPoints, addXP, addStars, addMedal,
    completeLevel, isLevelCompleted, isWorldUnlocked,
    updateHUD, showRewardModal, launchConfetti,
  };
})();
