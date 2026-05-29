/**
 * MathWorld – storage.js
 * Gestión de guardado automático en localStorage
 */

const Storage = (() => {
  const KEY = 'mathworld_save';

  /** Estado por defecto de un jugador nuevo */
  const DEFAULT_STATE = {
    player: {
      name: '',
      lastname: '',
      age: 8,
      character: null,
    },
    progress: {
      level: 1,
      xp: 0,
      xpNext: 100,
      stars: 0,
      medals: 0,
      points: 0,
    },
    worlds: {
      world1: { unlocked: true, completed: false, stars: 0, levelsCompleted: [] },
      world2: { unlocked: true, completed: false, stars: 0, levelsCompleted: [] },
      world3: { unlocked: true, completed: false, stars: 0, levelsCompleted: [] },
      world4: { unlocked: true, completed: false, stars: 0, levelsCompleted: [] },
      world5: { unlocked: true, completed: false, stars: 0, levelsCompleted: [] },
    },
    settings: {
      sound: true,
      music: true,
    },
    meta: {
      created: Date.now(),
      lastPlayed: Date.now(),
      version: '1.0.0',
    },
  };

  /** Carga el estado guardado o retorna el estado por defecto */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const saved = JSON.parse(raw);
      // Merge para garantizar nuevas propiedades si la versión es anterior
      return deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), saved);
    } catch (e) {
      console.warn('[Storage] Error al cargar:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  /**
   * Borra el progreso al iniciar la sesión.
   * Se llama una vez al cargar la página para que cada visita empiece de cero.
   */
  function resetOnStart() {
    localStorage.removeItem(KEY);
  }

  /** Guarda el estado completo */
  function save(state) {
    try {
      state.meta.lastPlayed = Date.now();
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[Storage] Error al guardar:', e);
    }
  }

  /** Borra todos los datos (reinicio) */
  function reset() {
    localStorage.removeItem(KEY);
  }

  /** Merge profundo de objetos */
  function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  return { load, save, reset, resetOnStart, DEFAULT_STATE };
})();
