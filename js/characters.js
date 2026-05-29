/**
 * MathWorld – characters.js
 * Definición de los 6 personajes del juego y su renderizado
 */

const Characters = (() => {

  /** Datos de todos los personajes */
  const CHARACTERS = [
    {
      id: 'numi',
      name: 'Numi',
      emoji: '🤖',
      color: '#6EC6F5',
      colorGrad: 'linear-gradient(135deg,#6EC6F5,#4A9EE0)',
      desc: 'Robot inteligente experto en números',
      personality: 'Analítico y preciso. Transforma los números en aventuras lógicas.',
      phrases: [
        '¡Procesando respuesta correcta! 🤖',
        '¡Los números son mi superpoder!',
        '¡Cálculo exitoso! ¡Eres brillante!',
        '¡Mi sistema indica que vas muy bien!',
        '¡Error detectado! ¡Inténtalo de nuevo!',
        '¡Datos actualizados! ¡Subiste de nivel!',
      ],
    },
    {
      id: 'luna',
      name: 'Luna',
      emoji: '✨',
      color: '#C3A9F0',
      colorGrad: 'linear-gradient(135deg,#C3A9F0,#9B7FD4)',
      desc: 'Exploradora espacial matemática',
      personality: 'Soñadora y curiosa. Encuentra matemáticas en las estrellas.',
      phrases: [
        '¡Las matemáticas son mágicas como el cosmos! ✨',
        '¡Estás viajando hacia el éxito!',
        '¡En el espacio no hay límites para ti!',
        '¡Cada estrella es un número que aprender!',
        '¡No te rindas, el universo te apoya!',
        '¡Tu mente brilla más que mil estrellas!',
      ],
    },
    {
      id: 'max',
      name: 'Max',
      emoji: '🦁',
      color: '#FFB347',
      colorGrad: 'linear-gradient(135deg,#FFB347,#FF8C00)',
      desc: 'León valiente y motivador',
      personality: 'Audaz y energético. Siempre motiva a dar el 100%.',
      phrases: [
        '¡ROOAAR! ¡Eso estuvo increíble! 🦁',
        '¡Los leones matemáticos nunca se rinden!',
        '¡Eres tan valiente como yo!',
        '¡Vamos campeón, tú puedes!',
        '¡Sacude la melena y vuelve a intentarlo!',
        '¡Rugido de victoria! ¡Lo lograste!',
      ],
    },
    {
      id: 'pixel',
      name: 'Pixel',
      emoji: '👾',
      color: '#6ECBA5',
      colorGrad: 'linear-gradient(135deg,#6ECBA5,#3D9970)',
      desc: 'Experto en patrones y secuencias',
      personality: 'Curioso y creativo. Ve patrones en todo lo que lo rodea.',
      phrases: [
        '¡Patrón detectado! ¡Respuesta correcta! 👾',
        '¡Los patrones son la música de las matemáticas!',
        '¡Tu cerebro procesa increíble rápido!',
        '¡Analiza el patrón y lo entenderás!',
        '¡Cada error es un nivel que superar!',
        '¡Game Over para los errores, Game On para ti!',
      ],
    },
    {
      id: 'tina',
      name: 'Tina',
      emoji: '🐢',
      color: '#FFD93D',
      colorGrad: 'linear-gradient(135deg,#FFD93D,#FFC107)',
      desc: 'Tortuga que enseña paso a paso',
      personality: 'Paciente y tranquila. "Despacio y con cuidado, siempre se llega lejos."',
      phrases: [
        '¡Paso a pasito, lo estás logrando! 🐢',
        '¡La constancia es tu mayor superpoder!',
        '¡No hay prisa, lo importante es aprender!',
        '¡Respira, piensa y responde con calma!',
        '¡Cada intento te hace más sabio!',
        '¡La tortuga siempre llega a la meta!',
      ],
    },
    {
      id: 'rayo',
      name: 'Rayo',
      emoji: '⚡',
      color: '#FF8FA3',
      colorGrad: 'linear-gradient(135deg,#FF8FA3,#FF5675)',
      desc: 'Personaje energético para retos rápidos',
      personality: 'Veloz y emocionante. Convierte cada problema en una carrera.',
      phrases: [
        '¡ZAP! ¡Respuesta relámpago perfecta! ⚡',
        '¡Eres más rápido que la luz!',
        '¡La velocidad y la precisión te definen!',
        '¡Carga energía y vuelve más fuerte!',
        '¡Tu cerebro va a mil por hora!',
        '¡Superpoder activado! ¡Imparable!',
      ],
    },
  ];

  let selectedCharacter = null;

  /** Renderiza las tarjetas de personaje en el contenedor */
  function renderCharacterGrid(containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    CHARACTERS.forEach(char => {
      const card = document.createElement('div');
      card.className = 'character-card';
      card.dataset.id = char.id;
      card.innerHTML = `
        <div class="char-emoji">${char.emoji}</div>
        <div class="char-name">${char.name}</div>
        <div class="char-desc">${char.desc}</div>
      `;
      card.style.setProperty('--char-color', char.color);

      card.addEventListener('click', () => {
        AudioManager.playClick();
        // Deselecciona todos
        container.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedCharacter = char;
        if (onSelect) onSelect(char);
        // Anima con GSAP
        if (window.gsap) {
          gsap.from(card, { scale: 0.9, duration: 0.3, ease: 'back.out(2)' });
        }
      });

      container.appendChild(card);
    });
  }

  /** Devuelve los datos de un personaje por ID */
  function getById(id) {
    return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
  }

  /** Frase motivacional aleatoria de un personaje */
  function getRandomPhrase(characterId) {
    const char = getById(characterId);
    return char.phrases[Math.floor(Math.random() * char.phrases.length)];
  }

  /** Muestra la burbuja de habla del personaje */
  function speak(characterId, text) {
    const char = getById(characterId);
    const msg  = text || getRandomPhrase(characterId);

    const bubble = document.getElementById('character-speech');
    const avatar = document.getElementById('bubble-avatar');
    const txt    = document.getElementById('bubble-text');

    if (!bubble) return;

    avatar.textContent = char.emoji;
    txt.textContent    = msg;
    bubble.classList.remove('hidden');
    AudioManager.playCharacterAppear();

    if (window.gsap) {
      gsap.from(bubble, {
        y: 30, opacity: 0, duration: 0.4,
        ease: 'back.out(2)',
      });
    }

    // Auto cierra tras 4 segundos
    clearTimeout(speak._timer);
    speak._timer = setTimeout(hideSpeech, 4000);
  }

  function getAll()     { return CHARACTERS; }
  function getSelected(){ return selectedCharacter; }
  function setSelected(id) { selectedCharacter = getById(id); }

  return {
    renderCharacterGrid,
    getById,
    getRandomPhrase,
    speak,
    getAll,
    getSelected,
    setSelected,
  };
})();

/** Cierra la burbuja de habla (global para onclick inline) */
function hideSpeech() {
  const bubble = document.getElementById('character-speech');
  if (!bubble) return;
  if (window.gsap) {
    gsap.to(bubble, {
      y: 20, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => bubble.classList.add('hidden'),
    });
  } else {
    bubble.classList.add('hidden');
  }
}
