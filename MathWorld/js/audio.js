/**
 * MathWorld – audio.js
 * Gestión de música y efectos de sonido con Howler.js
 * (Genera sonidos sintéticos via Web Audio API como fallback)
 */

const AudioManager = (() => {
  let ctx = null;
  let musicEnabled = true;
  let sfxEnabled   = true;
  let musicVolume  = 0.45;
  let sfxVolume    = 0.75;
  let bgMusic      = null;

  /** Obtiene o crea el contexto de audio */
  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {
        console.warn('[Audio] Web Audio API no disponible');
      }
    }
    return ctx;
  }

  /** Resume el contexto (necesario tras interacción del usuario) */
  function resume() {
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume();
  }

  /**
   * Reproduce un tono sintético simple
   * @param {number} freq - Frecuencia en Hz
   * @param {string} type - Tipo de onda (sine|square|sawtooth|triangle)
   * @param {number} duration - Duración en segundos
   * @param {number} vol - Volumen 0-1
   * @param {number} startDelay - Retardo en segundos
   */
  function playTone(freq, type = 'sine', duration = 0.15, vol = 0.4, startDelay = 0) {
    if (!sfxEnabled) return;
    const c = getCtx();
    if (!c) return;
    try {
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + startDelay);
      gain.gain.setValueAtTime(0, c.currentTime + startDelay);
      gain.gain.linearRampToValueAtTime(vol * sfxVolume, c.currentTime + startDelay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startDelay + duration);
      osc.start(c.currentTime + startDelay);
      osc.stop(c.currentTime + startDelay + duration + 0.01);
    } catch(e) {}
  }

  // ── Efectos de sonido ──────────────────────────────────────

  /** Click / tap genérico */
  function playClick() {
    playTone(880, 'sine', 0.08, 0.3);
  }

  /** Respuesta correcta */
  function playCorrect() {
    playTone(523, 'sine', 0.1, 0.5);
    playTone(659, 'sine', 0.1, 0.5, 0.1);
    playTone(784, 'sine', 0.2, 0.5, 0.2);
  }

  /** Respuesta incorrecta */
  function playWrong() {
    playTone(200, 'sawtooth', 0.08, 0.35);
    playTone(160, 'sawtooth', 0.12, 0.35, 0.1);
  }

  /** Victoria / nivel completado */
  function playVictory() {
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => {
      playTone(freq, 'sine', 0.18, 0.55, i * 0.12);
    });
    // Acorde final
    setTimeout(() => {
      playTone(523, 'sine', 0.4, 0.4);
      playTone(659, 'sine', 0.4, 0.4);
      playTone(784, 'sine', 0.4, 0.4);
    }, 600);
  }

  /** Subir de nivel */
  function playLevelUp() {
    const up = [261, 329, 392, 523, 659, 784, 1047];
    up.forEach((f, i) => playTone(f, 'sine', 0.12, 0.5, i * 0.08));
  }

  /** Recoger estrella */
  function playStar() {
    playTone(1047, 'sine', 0.08, 0.5);
    playTone(1318, 'sine', 0.08, 0.45, 0.08);
    playTone(1568, 'sine', 0.15, 0.4, 0.16);
  }

  /** Aparición de personaje */
  function playCharacterAppear() {
    playTone(440, 'triangle', 0.1, 0.4);
    playTone(554, 'triangle', 0.1, 0.4, 0.1);
    playTone(659, 'triangle', 0.15, 0.45, 0.2);
  }

  /** Botón de mundo */
  function playWorldSelect() {
    playTone(392, 'sine', 0.12, 0.4);
    playTone(523, 'sine', 0.15, 0.45, 0.1);
  }

  /** Tick de temporizador */
  function playTick() {
    playTone(1200, 'square', 0.05, 0.2);
  }

  /** Tiempo agotado */
  function playTimeOut() {
    playTone(330, 'sawtooth', 0.08, 0.4);
    playTone(247, 'sawtooth', 0.12, 0.4, 0.1);
    playTone(196, 'sawtooth', 0.25, 0.4, 0.22);
  }

  /** Globo reventado */
  function playPop() {
    playTone(600, 'square', 0.04, 0.4);
    playTone(300, 'sawtooth', 0.06, 0.3, 0.04);
  }

  /** Música de fondo sintética (loop simple) */
  function startBgMusic() {
    if (!musicEnabled) return;
    stopBgMusic();
    const c = getCtx();
    if (!c) return;

    // Melodía en Do mayor, estilo infantil
    const scale = [261, 294, 330, 349, 392, 440, 494, 523];
    const pattern = [0, 2, 4, 2, 0, 4, 2, 5, 4, 2, 0, 4, 7, 5, 4, 2];
    let step = 0;
    let running = true;

    function nextNote() {
      if (!running || !musicEnabled) return;
      const freq = scale[pattern[step % pattern.length]];
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, c.currentTime);
      gain.gain.linearRampToValueAtTime(musicVolume * 0.25, c.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.36);
      step++;
      bgMusic = setTimeout(nextNote, 300);
    }

    nextNote();
  }

  function stopBgMusic() {
    if (bgMusic) {
      clearTimeout(bgMusic);
      bgMusic = null;
    }
  }

  function setMusicEnabled(v) {
    musicEnabled = v;
    if (!v) stopBgMusic();
    else startBgMusic();
  }

  function setSfxEnabled(v)   { sfxEnabled = v; }
  function isMusicEnabled()   { return musicEnabled; }
  function isSfxEnabled()     { return sfxEnabled; }

  return {
    resume, playClick, playCorrect, playWrong, playVictory, playLevelUp,
    playStar, playCharacterAppear, playWorldSelect, playTick, playTimeOut,
    playPop, startBgMusic, stopBgMusic, setMusicEnabled, setSfxEnabled,
    isMusicEnabled, isSfxEnabled,
  };
})();
