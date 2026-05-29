/**
 * MathWorld – levels.js
 * Motor de los minijuegos para los 5 mundos.
 * Cada juego se inyecta en #game-ui sobre el #game-canvas.
 */

const Levels = (() => {

  let currentGame   = null;
  let currentWorldId = null;
  let currentLevelId = null;
  let score = 0;
  let lives = 3;
  let timeLeft = 0;
  let timerInterval = null;
  let age = 8;

  // ── Helpers ────────────────────────────────────────────────

  function getAge() {
    const s = Progress.getState();
    return s ? (s.player.age || 8) : 8;
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getMaxNum() {
    const a = getAge();
    if (a <= 7) return 5;
    if (a <= 8) return 10;
    if (a <= 9) return 15;
    return 20;
  }

  function getGameContainer() {
    return document.getElementById('game-ui');
  }

  function setGameTitle(t) {
    const el = document.getElementById('game-title-mini');
    if (el) el.textContent = t;
  }

  function updateScoreDisplay() {
    const el = document.getElementById('game-score');
    if (el) el.textContent = score;
  }

  function updateLives() {
    const el = document.getElementById('game-lives');
    if (el) el.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
  }

  function loseLife() {
    lives = Math.max(0, lives - 1);
    updateLives();
    AudioManager.playWrong();
    if (lives <= 0) {
      setTimeout(() => endGame(false), 600);
    }
  }

  function addScore(pts) {
    score += pts;
    updateScoreDisplay();
    AudioManager.playCorrect();
  }

  function startTimer(seconds, onTick, onEnd) {
    clearInterval(timerInterval);
    timeLeft = seconds;
    if (onTick) onTick(timeLeft);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (onTick) onTick(timeLeft);
      if (timeLeft <= 5) AudioManager.playTick();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (onEnd) onEnd();
      }
    }, 1000);
  }

  function stopTimer() { clearInterval(timerInterval); }

  function calcStars() {
    if (score >= 80) return 3;
    if (score >= 50) return 2;
    if (score >= 20) return 1;
    return 1;
  }

  function endGame(success) {
    stopTimer();
    const stars = success ? calcStars() : 1;
    const state = Progress.getState();

    if (currentWorldId && currentLevelId) {
      Progress.completeLevel(currentWorldId, currentLevelId, stars, score);
    }

    Storage.save(state);

    setTimeout(() => {
      const charId = state.player.character || 'numi';
      Progress.showRewardModal(
        stars,
        score,
        success ? '¡Completaste el nivel!' : '¡Lo intentaste con todo!',
        () => {
          // Re-renderiza el mundo para reflejar el nivel completado sin tener que salir
          Worlds.refreshActiveWorld();
        }
      );
      Characters.speak(charId, Characters.getRandomPhrase(charId));
    }, 500);
  }

  // ── Launcher principal ────────────────────────────────────

  /**
   * Inicia un minijuego
   * @param {string} worldId  - 'world1' .. 'world5'
   * @param {string} levelId  - e.g. 'level1_1'
   * @param {number} gameIndex - 0..4 (índice del minijuego dentro del mundo)
   */
  function launch(worldId, levelId, gameIndex) {
    currentWorldId = worldId;
    currentLevelId = levelId;
    score = 0;
    lives = 3;
    age   = getAge();

    updateScoreDisplay();
    updateLives();

    showScreen('game-screen');

    const gameMap = {
      world1: [catchNumber, burstBalloon, dragNumbers, findHidden, listenSelect],
      world2: [completeSequence, countingChain, organizeNumbers, mathPath,    raceAgainstClock],
      world3: [matchQuantity,    feedAnimals,   countElements,   flipCards,   quantityPuzzle],
      world4: [doorOperation,    mathMachine,   dragToAdd,       visualSubtract, opBattle],
      world5: [shoppingGame,     dailyProblem,  helpCharacter,   multiChoice, interactiveRiddle],
    };

    const games = gameMap[worldId] || gameMap.world1;
    const fn    = games[gameIndex % games.length] || games[0];

    const container = getGameContainer();
    container.innerHTML = '';
    container.style.pointerEvents = 'all';

    fn();
  }

  // ══════════════════════════════════════════════════════════
  // MUNDO 1 – BOSQUE DE LOS NÚMEROS
  // ══════════════════════════════════════════════════════════

  /** M1-G1: Atrapar el número correcto */
  function catchNumber() {
    setGameTitle('🌲 Atrapa el Número');
    const max    = getMaxNum();
    const target = rand(1, max);
    let  caught  = 0;
    const total  = 8;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="question-box">
          <div class="instruction-text">Toca el número</div>
          <div class="question-text" style="font-size:4rem;color:var(--yellow);">${target}</div>
        </div>
        <div id="numbers-field" style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;max-width:400px;"></div>
        <div class="progress-row">
          <div class="progress-bar-outer"><div class="progress-bar-inner" id="catch-progress" style="background:var(--grad-mint);width:0%"></div></div>
          <span style="color:#fff;font-weight:700;">${caught}/${total}</span>
        </div>
      </div>
    `;

    function spawn() {
      const field   = document.getElementById('numbers-field');
      if (!field) return;
      field.innerHTML = '';
      const options = shuffle([target, ...Array.from({length: 5}, () => rand(1, max)).filter(n => n !== target).slice(0,5)].slice(0,6));
      options.forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = num;
        btn.style.width = '72px';
        btn.style.height = '72px';
        btn.style.borderRadius = '50%';
        btn.style.fontSize = '1.8rem';
        btn.addEventListener('click', () => {
          if (num === target) {
            btn.classList.add('correct');
            caught++;
            addScore(10);
            const prog = document.getElementById('catch-progress');
            if (prog) prog.style.width = `${(caught / total) * 100}%`;
            setTimeout(() => { if (caught >= total) endGame(true); else spawn(); }, 400);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        field.appendChild(btn);
      });
    }
    spawn();
  }

  /** M1-G2: Reventar globos numerados */
  function burstBalloon() {
    setGameTitle('🎈 Revienta el Globo');
    const max    = getMaxNum();
    const target = rand(1, max);
    let  popped  = 0;
    const total  = 6;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="question-box">
          <div class="instruction-text">Revienta el globo con el número</div>
          <div class="question-text" style="font-size:4rem;color:var(--yellow);">${target}</div>
        </div>
        <div id="balloons-area" style="display:flex;flex-wrap:wrap;justify-content:center;gap:16px;max-width:420px;"></div>
        <div style="color:rgba(255,255,255,0.6);font-size:0.9rem;">Reventados: ${popped}/${total}</div>
      </div>
    `;

    function spawnBalloons() {
      const area = document.getElementById('balloons-area');
      if (!area) return;
      area.innerHTML = '';
      const nums = shuffle([target, ...Array.from({length: 5}, () => rand(1, max)).filter(n=>n!==target).slice(0,5)]);
      const colors = ['#FF8FA3','#6EC6F5','#C3A9F0','#6ECBA5','#FFD93D','#FFB347'];
      nums.slice(0, 6).forEach((num, i) => {
        const balloon = document.createElement('div');
        balloon.style.cssText = `
          width:70px;height:80px;background:${colors[i % colors.length]};
          border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;
          display:flex;align-items:center;justify-content:center;
          font-family:var(--font-display);font-size:1.6rem;font-weight:800;
          color:#fff;cursor:pointer;transition:transform 0.15s;
          text-shadow:0 2px 4px rgba(0,0,0,0.3);
          animation: float ${2 + i * 0.3}s ease-in-out infinite;
        `;
        balloon.textContent = num;
        balloon.addEventListener('click', () => {
          if (num === target) {
            balloon.style.animation = 'balloonPop 0.3s ease forwards';
            popped++;
            addScore(10);
            AudioManager.playPop();
            setTimeout(() => {
              if (popped >= total) endGame(true);
              else spawnBalloons();
            }, 350);
          } else {
            balloon.style.border = '3px solid red';
            loseLife();
            setTimeout(() => { if (balloon) balloon.style.border = ''; }, 600);
          }
        });
        area.appendChild(balloon);
      });
    }
    spawnBalloons();
  }

  /** M1-G3: Arrastrar números a cajas */
  function dragNumbers() {
    setGameTitle('📦 Llena las Cajas');
    const max = getMaxNum();
    const nums = Array.from({length: 4}, () => rand(1, max));

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="instruction-text">Arrastra cada número a su caja</div>
        <div id="drag-source" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:20px;"></div>
        <div id="drag-targets" style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;"></div>
        <div id="drag-feedback" style="min-height:28px;text-align:center;"></div>
      </div>
    `;

    const source  = document.getElementById('drag-source');
    const targets = document.getElementById('drag-targets');

    // Fuente: números arrastrables
    shuffle(nums).forEach(n => {
      const el = document.createElement('div');
      el.className = 'draggable-num';
      el.textContent = n;
      el.draggable = true;
      el.dataset.value = n;
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', n);
        el.style.opacity = '0.5';
      });
      el.addEventListener('dragend', () => { el.style.opacity = '1'; });
      source.appendChild(el);
    });

    // Destinos: cajas con número oculto
    let correct = 0;
    nums.forEach(n => {
      const box = document.createElement('div');
      box.className = 'drop-zone';
      box.textContent = '?';
      box.dataset.expects = n;

      box.addEventListener('dragover', e => {
        e.preventDefault();
        box.classList.add('hover-active');
      });
      box.addEventListener('dragleave', () => box.classList.remove('hover-active'));
      box.addEventListener('drop', e => {
        e.preventDefault();
        box.classList.remove('hover-active');
        const val = parseInt(e.dataTransfer.getData('text/plain'));
        if (val === parseInt(box.dataset.expects)) {
          box.textContent = val;
          box.style.background = 'rgba(110,203,165,0.3)';
          box.style.borderColor = 'var(--mint)';
          box.style.color = 'var(--mint)';
          box.style.fontWeight = '800';
          // Elimina de source
          const src = source.querySelector(`[data-value="${val}"]`);
          if (src) src.remove();
          correct++;
          addScore(15);
          if (correct === nums.length) setTimeout(() => endGame(true), 600);
        } else {
          loseLife();
          box.style.borderColor = '#FF6363';
          setTimeout(() => { box.style.borderColor = ''; }, 600);
        }
      });

      // Label del número esperado debajo
      const label = document.createElement('div');
      label.style.cssText = 'font-size:0.75rem;color:rgba(255,255,255,0.5);margin-top:4px;font-family:var(--font-display);';
      label.textContent = `Caja ${n}`;

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;';
      wrapper.appendChild(box);
      wrapper.appendChild(label);
      targets.appendChild(wrapper);
    });
  }

  /** M1-G4: Buscar números escondidos */
  function findHidden() {
    setGameTitle('🔍 Encuentra el Número');
    const max    = getMaxNum();
    const target = rand(1, max);
    const grid   = 16;
    let found    = 0;
    const needed = 3;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="question-box">
          <div class="instruction-text">Encuentra y toca el número</div>
          <div class="question-text" style="font-size:4rem;color:var(--yellow);">${target}</div>
        </div>
        <div id="hidden-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:340px;width:100%;"></div>
        <div style="color:var(--mint);font-weight:700;">Encontrados: ${found}/${needed}</div>
      </div>
    `;

    function buildGrid() {
      const g = document.getElementById('hidden-grid');
      if (!g) return;
      g.innerHTML = '';

      // Garantiza al menos 1 ocurrencia del target
      const items = Array.from({length: grid}, (_, i) => i < needed ? target : rand(1, max)).map(n => n === target ? target : rand(1, max));
      // Asegura exactamente `needed` targets
      let tc = 0;
      const arr = items.map(n => {
        if (n === target && tc < needed) { tc++; return target; }
        if (n === target && tc >= needed) return rand(1, max) === target ? max : rand(1, max - 1);
        return n;
      });

      shuffle(arr).forEach(num => {
        const cell = document.createElement('button');
        cell.className = 'answer-btn';
        cell.textContent = num;
        cell.style.padding = '10px';
        cell.style.fontSize = '1.3rem';
        cell.style.borderRadius = '14px';
        cell.addEventListener('click', () => {
          if (num === target && !cell.dataset.found) {
            cell.dataset.found = '1';
            cell.classList.add('correct');
            cell.textContent = '✓';
            found++;
            addScore(15);
            const info = g.parentElement.querySelector('[style*="Encontrados"]');
            if (info) info.textContent = `Encontrados: ${found}/${needed}`;
            if (found >= needed) setTimeout(() => endGame(true), 500);
          } else if (num !== target) {
            cell.classList.add('wrong');
            loseLife();
            setTimeout(() => cell.classList.remove('wrong'), 600);
          }
        });
        g.appendChild(cell);
      });
    }
    buildGrid();
  }

  /** M1-G5: Escuchar y seleccionar número */
  function listenSelect() {
    setGameTitle('👂 Escucha el Número');
    const max    = getMaxNum();
    const target = rand(1, max);
    let rounds   = 0;
    const total  = 6;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="question-box">
          <div class="instruction-text">¿Cuál número se muestra?</div>
          <div id="listen-visual" style="font-size:5rem;margin:8px 0;">👂</div>
          <button id="btn-play-sound" class="btn-primary" style="margin-top:8px;">🔊 Escuchar número</button>
        </div>
        <div class="answers-grid" id="listen-answers"></div>
        <div class="progress-row" style="margin-top:4px;">
          <div class="progress-bar-outer"><div class="progress-bar-inner" id="listen-prog" style="background:var(--grad-sky);width:0%"></div></div>
          <span style="color:#fff;">${rounds}/${total}</span>
        </div>
      </div>
    `;

    let curTarget = rand(1, max);

    function renderRound() {
      curTarget = rand(1, max);
      const vis = document.getElementById('listen-visual');
      if (vis) vis.textContent = curTarget;

      const answers = document.getElementById('listen-answers');
      if (!answers) return;
      answers.innerHTML = '';

      const opts = shuffle([curTarget, ...new Set(Array.from({length:10},()=>rand(1,max)).filter(n=>n!==curTarget))].slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === curTarget) {
            btn.classList.add('correct');
            rounds++;
            addScore(10);
            const prog = document.getElementById('listen-prog');
            if (prog) prog.style.width = `${(rounds/total)*100}%`;
            setTimeout(() => { if (rounds >= total) endGame(true); else renderRound(); }, 500);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        answers.appendChild(btn);
      });
    }

    document.getElementById('btn-play-sound').addEventListener('click', () => {
      // Usa síntesis de voz si está disponible
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(String(curTarget));
        utt.lang = 'es-ES';
        utt.rate = 0.8;
        speechSynthesis.speak(utt);
      }
    });

    renderRound();
  }

  // ══════════════════════════════════════════════════════════
  // MUNDO 2 – MONTAÑA DE LAS SECUENCIAS
  // ══════════════════════════════════════════════════════════

  /** M2-G1: Completar secuencias */
  function completeSequence() {
    setGameTitle('🏔️ Completa la Secuencia');
    const max    = getMaxNum();
    let rounds   = 0;
    const total  = 6;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="instruction-text">¿Qué número falta? 🔢</div>
        <div class="question-box">
          <div id="seq-display" class="question-text" style="letter-spacing:8px;"></div>
        </div>
        <div class="answers-grid" id="seq-answers"></div>
        <div style="color:rgba(255,255,255,0.6);font-size:0.9rem;">${rounds}/${total} secuencias</div>
      </div>
    `;

    function buildRound() {
      const start = rand(1, Math.max(1, max - 5));
      const step  = rand(1, 3);
      const seq   = Array.from({length: 5}, (_, i) => start + i * step);
      const blankIdx = rand(1, 3); // nunca el primero
      const answer   = seq[blankIdx];
      const display  = seq.map((n, i) => i === blankIdx ? '_' : n).join('  ');

      document.getElementById('seq-display').textContent = display;

      const answers = document.getElementById('seq-answers');
      answers.innerHTML = '';

      const opts = shuffle([answer, ...new Set(Array.from({length:10}, ()=>rand(1,max+step)).filter(n=>n!==answer))].slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === answer) {
            btn.classList.add('correct');
            rounds++;
            addScore(15);
            setTimeout(() => { if (rounds >= total) endGame(true); else buildRound(); }, 500);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        answers.appendChild(btn);
      });
    }
    buildRound();
  }

  /** M2-G2: Conteo en cadena */
  function countingChain() {
    setGameTitle('🔗 Cadena de Conteo');
    const max  = getMaxNum();
    const seq  = Array.from({length: 10}, (_, i) => i + 1);
    let idx    = 0;
    const ui   = getGameContainer();

    ui.innerHTML = `
      <div class="minigame-container">
        <div class="instruction-text">Toca los números en orden</div>
        <div id="chain-display" style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:var(--yellow);"></div>
        <div id="chain-buttons" style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:380px;"></div>
      </div>
    `;

    function update() {
      const disp = document.getElementById('chain-display');
      if (disp) disp.textContent = seq.slice(0, idx).join(' → ') + (idx > 0 ? ' → ?' : '?');
    }

    const btns = document.getElementById('chain-buttons');
    const nums  = shuffle([...seq]);
    nums.forEach(n => {
      const b = document.createElement('button');
      b.className = 'answer-btn';
      b.textContent = n;
      b.style.width = '56px';
      b.style.height = '56px';
      b.style.borderRadius = '50%';
      b.style.fontSize = '1.3rem';
      b.style.padding = '0';
      b.addEventListener('click', () => {
        if (n === seq[idx]) {
          b.classList.add('correct');
          b.disabled = true;
          idx++;
          addScore(8);
          update();
          if (idx === seq.length) setTimeout(() => endGame(true), 500);
        } else {
          b.classList.add('wrong');
          loseLife();
          setTimeout(() => b.classList.remove('wrong'), 500);
        }
      });
      btns.appendChild(b);
    });

    update();
  }

  /** M2-G3: Organizar números */
  function organizeNumbers() {
    setGameTitle('📊 Organiza los Números');
    const max  = getMaxNum();
    const nums = shuffle(Array.from({length: 6}, () => rand(1, max)));
    const sorted = [...nums].sort((a, b) => a - b);
    const placed = [];

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="instruction-text">Pon los números de menor a mayor</div>
        <div id="org-target" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;min-height:60px;"></div>
        <div style="color:rgba(255,255,255,0.5);font-size:0.85rem;margin:4px 0;">Respuesta esperada: ?  ?  ?  ?  ?  ?</div>
        <div id="org-source" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;"></div>
      </div>
    `;

    const target = document.getElementById('org-target');
    const source = document.getElementById('org-source');

    nums.forEach(n => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = n;
      btn.style.width = '56px';
      btn.style.height = '56px';
      btn.style.borderRadius = '50%';
      btn.style.padding = '0';
      btn.style.fontSize = '1.3rem';
      btn.addEventListener('click', () => {
        const expected = sorted[placed.length];
        if (n === expected) {
          placed.push(n);
          const tile = document.createElement('div');
          tile.className = 'draggable-num';
          tile.textContent = n;
          tile.style.background = 'var(--grad-mint)';
          target.appendChild(tile);
          btn.remove();
          addScore(10);
          if (placed.length === sorted.length) setTimeout(() => endGame(true), 500);
        } else {
          loseLife();
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 500);
        }
      });
      source.appendChild(btn);
    });
  }

  /** M2-G4: Caminos matemáticos */
  function mathPath() {
    setGameTitle('🛤️ Camino Matemático');
    completeSequence(); // Reutiliza lógica de secuencias con variante
  }

  /** M2-G5: Carrera contra reloj */
  function raceAgainstClock() {
    setGameTitle('⏱️ Carrera Matemática');
    const max   = getMaxNum();
    let   round = 0;
    const total = 8;
    let   secs  = 30;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="timer-display" id="race-timer">30</div>
        <div class="instruction-text">¿Cuánto sigue?</div>
        <div class="question-box">
          <div id="race-seq" class="question-text" style="font-size:2rem;letter-spacing:6px;"></div>
        </div>
        <div class="answers-grid" id="race-answers"></div>
        <div style="color:rgba(255,255,255,0.6);">✓ ${round}/${total}</div>
      </div>
    `;

    startTimer(secs,
      t => {
        const el = document.getElementById('race-timer');
        if (el) { el.textContent = t; if (t <= 5) el.classList.add('urgent'); }
      },
      () => endGame(round >= 4)
    );

    function buildQ() {
      const start = rand(1, max);
      const step  = 1;
      const seq   = [start, start+step, start+2*step];
      const next  = start + 3*step;

      const seqEl = document.getElementById('race-seq');
      if (seqEl) seqEl.textContent = seq.join('  →  ') + '  →  ?';

      const ans = document.getElementById('race-answers');
      if (!ans) return;
      ans.innerHTML = '';
      const opts = shuffle([next, next+1, next-1, next+2].filter((v,i,a)=>a.indexOf(v)===i)).slice(0,4);
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === next) {
            btn.classList.add('correct');
            round++;
            addScore(12);
            setTimeout(buildQ, 400);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        ans.appendChild(btn);
      });
    }
    buildQ();
  }

  // ══════════════════════════════════════════════════════════
  // MUNDO 3 – ISLA DE LAS CANTIDADES
  // ══════════════════════════════════════════════════════════

  /** M3-G1: Relacionar números con objetos */
  function matchQuantity() {
    setGameTitle('🏝️ Cuántos hay?');
    const max    = getMaxNum();
    const emojis = ['🍎','🌟','🐟','🌸','🦋','🍬','⚽','🎵'];
    let   rounds = 0;
    const total  = 6;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="instruction-text">Cuenta los objetos y elige el número</div>
        <div class="question-box">
          <div id="qty-visual" class="count-objects"></div>
        </div>
        <div class="answers-grid" id="qty-answers"></div>
        <div style="color:rgba(255,255,255,0.6);">${rounds}/${total}</div>
      </div>
    `;

    function buildRound() {
      const count  = rand(1, max);
      const emoji  = emojis[rand(0, emojis.length - 1)];
      const visual = document.getElementById('qty-visual');
      if (visual) visual.textContent = emoji.repeat(count);

      const ans = document.getElementById('qty-answers');
      if (!ans) return;
      ans.innerHTML = '';
      const opts = shuffle([count, ...new Set(Array.from({length:10},()=>rand(1,max)).filter(n=>n!==count))].slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === count) {
            btn.classList.add('correct');
            rounds++;
            addScore(12);
            setTimeout(() => { if (rounds >= total) endGame(true); else buildRound(); }, 500);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        ans.appendChild(btn);
      });
    }
    buildRound();
  }

  /** M3-G2: Alimentar animales */
  function feedAnimals() {
    setGameTitle('🐾 Alimenta al Animal');
    const max     = getMaxNum();
    const animals = ['🐘','🦊','🐼','🐸','🐧'];
    let   rounds  = 0;
    const total   = 6;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div id="animal-display" style="font-size:4rem;margin-bottom:4px;"></div>
        <div class="question-box">
          <div id="feed-question" class="question-text"></div>
        </div>
        <div class="answers-grid" id="feed-answers"></div>
      </div>
    `;

    function buildRound() {
      const animal = animals[rand(0, animals.length-1)];
      const need   = rand(1, max);
      document.getElementById('animal-display').textContent = animal;
      document.getElementById('feed-question').textContent = `Dale ${need} frutas 🍎`;

      const ans = document.getElementById('feed-answers');
      if (!ans) return;
      ans.innerHTML = '';
      const opts = shuffle([need, ...new Set(Array.from({length:10},()=>rand(1,max)).filter(n=>n!==need))].slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        // Solo se muestran los emojis, sin el número — el niño debe contarlos
        btn.innerHTML = '🍎'.repeat(n);
        btn.style.height = 'auto';
        btn.style.padding = '14px 8px';
        btn.style.lineHeight = '1.8';
        btn.style.fontSize = '1.3rem';
        btn.style.letterSpacing = '2px';
        btn.addEventListener('click', () => {
          if (n === need) {
            btn.classList.add('correct');
            rounds++;
            addScore(12);
            setTimeout(() => { if (rounds >= total) endGame(true); else buildRound(); }, 500);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        ans.appendChild(btn);
      });
    }
    buildRound();
  }

  /** M3-G3: Contar elementos animados */
  function countElements() { matchQuantity(); }

  /** M3-G4: Emparejar tarjetas */
  function flipCards() {
    setGameTitle('🃏 Empareja las Tarjetas');
    const max = Math.min(getMaxNum(), 8); // máximo 8 para que los puntos no sean excesivos

    // Genera exactamente 4 números ÚNICOS para los pares
    const usedNums = new Set();
    while (usedNums.size < 4) {
      usedNums.add(rand(1, max));
    }
    const pairs = [...usedNums];

    // Crea los 8 items: 4 tarjetas con número + 4 tarjetas con puntos
    const items = shuffle([
      ...pairs.map(n => ({ type: 'num', val: n })),
      ...pairs.map(n => ({ type: 'dot', val: n })),
    ]);

    let flipped = [];
    let matched  = 0;
    let canClick = true; // bloquea clicks durante la animación de volteo

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="instruction-text">Empareja cada número con su cantidad ✨</div>
        <div id="cards-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:380px;width:100%;"></div>
        <div style="color:rgba(255,255,255,0.6);font-size:0.9rem;">Parejas: ${matched}/${pairs.length}</div>
      </div>
    `;

    const grid = document.getElementById('cards-grid');

    items.forEach((item) => {
      // Contenedor cuadrado
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        aspect-ratio:1/1;cursor:pointer;border-radius:14px;
        transition:transform 0.2s;
      `;
      wrapper.dataset.val     = item.val;
      wrapper.dataset.type    = item.type;
      wrapper.dataset.shown   = '0';
      wrapper.dataset.matched = '0';

      // Cara oculta
      const face = document.createElement('div');
      face.style.cssText = `
        width:100%;height:100%;border-radius:14px;
        background:rgba(255,255,255,0.12);
        border:2px solid rgba(255,255,255,0.25);
        display:flex;align-items:center;justify-content:center;
        font-family:var(--font-display);font-weight:800;color:#fff;
        flex-direction:column;gap:2px;padding:4px;
      `;

      function showFace() {
        if (item.type === 'num') {
          // Tarjeta de número: muestra el dígito grande
          face.innerHTML = `<span style="font-size:clamp(1.4rem,5vw,2rem);">${item.val}</span>`;
        } else {
          // Tarjeta de puntos: muestra círculos de colores en grid pequeño
          const dotSize  = item.val <= 4 ? '18px' : item.val <= 6 ? '14px' : '11px';
          const dotColor = '#FFD93D';
          const dots = Array.from({ length: item.val }, () =>
            `<span style="width:${dotSize};height:${dotSize};background:${dotColor};border-radius:50%;display:inline-block;margin:1px;"></span>`
          ).join('');
          face.innerHTML = `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:1px;">${dots}</div>`;
        }
        face.style.background = 'rgba(255,255,255,0.2)';
        wrapper.dataset.shown = '1';
      }

      function hideFace() {
        face.innerHTML = '<span style="font-size:1.4rem;">?</span>';
        face.style.background = 'rgba(255,255,255,0.12)';
        wrapper.dataset.shown = '0';
      }

      // Inicializa la cara
      hideFace();
      wrapper.appendChild(face);

      wrapper.addEventListener('click', () => {
        if (!canClick) return;
        if (wrapper.dataset.shown === '1') return;
        if (wrapper.dataset.matched === '1') return;

        showFace();
        flipped.push(wrapper);

        if (flipped.length === 2) {
          canClick = false;
          const [a, b] = flipped;
          flipped = [];

          const valMatch  = a.dataset.val  === b.dataset.val;
          const typeMatch = a.dataset.type !== b.dataset.type; // uno num y uno dot

          if (valMatch && typeMatch) {
            // ¡Par correcto!
            a.dataset.matched = b.dataset.matched = '1';
            a.querySelector('div').style.background = 'rgba(110,203,165,0.45)';
            b.querySelector('div').style.background = 'rgba(110,203,165,0.45)';
            a.style.border = '2px solid var(--mint)';
            b.style.border = '2px solid var(--mint)';
            matched++;
            addScore(20);
            // Actualiza contador
            const counter = grid.parentElement.querySelector('[style*="Parejas"]');
            if (counter) counter.textContent = `Parejas: ${matched}/${pairs.length}`;
            canClick = true;
            if (matched === pairs.length) setTimeout(() => endGame(true), 600);
          } else {
            // Par incorrecto: voltea de vuelta tras 900ms
            setTimeout(() => {
              hideFace.call({ face: a.querySelector('div'), wrapper: a });
              a.querySelector('div').innerHTML = '<span style="font-size:1.4rem;">?</span>';
              a.querySelector('div').style.background = 'rgba(255,255,255,0.12)';
              a.dataset.shown = '0';

              b.querySelector('div').innerHTML = '<span style="font-size:1.4rem;">?</span>';
              b.querySelector('div').style.background = 'rgba(255,255,255,0.12)';
              b.dataset.shown = '0';
              canClick = true;
            }, 900);
            loseLife();
          }
        }
      });

      grid.appendChild(wrapper);
    });
  }

  /** M3-G5: Rompecabezas interactivo */
  function quantityPuzzle() { feedAnimals(); }

  // ══════════════════════════════════════════════════════════
  // MUNDO 4 – LABORATORIO DE OPERACIONES
  // ══════════════════════════════════════════════════════════

  /** M4-G1: Resolver operaciones para abrir puertas */
  function doorOperation() {
    setGameTitle('🚪 Abre la Puerta');
    const max    = Math.min(getMaxNum(), 10);
    let   doors  = 0;
    const total  = 5;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div style="font-size:4rem;" id="door-icon">🚪</div>
        <div class="question-box">
          <div id="door-op" class="question-text" style="font-size:2.5rem;"></div>
        </div>
        <div class="answers-grid" id="door-answers"></div>
        <div style="color:rgba(255,255,255,0.6);">Puertas abiertas: ${doors}/${total}</div>
      </div>
    `;

    function buildOp() {
      const a   = rand(1, max);
      const b   = rand(1, Math.min(a, max));
      const isAdd = Math.random() > 0.4;
      const result = isAdd ? a + b : a - b;
      const op   = isAdd ? '+' : '−';

      document.getElementById('door-op').textContent = `${a} ${op} ${b} = ?`;

      const ans = document.getElementById('door-answers');
      if (!ans) return;
      ans.innerHTML = '';
      const opts = shuffle([result, result+1, result-1, result+2].filter(n=>n>=0).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === result) {
            btn.classList.add('correct');
            doors++;
            addScore(15);
            const icon = document.getElementById('door-icon');
            if (icon) { icon.textContent = '🔓'; setTimeout(() => { icon.textContent = '🚪'; }, 400); }
            setTimeout(() => { if (doors >= total) endGame(true); else buildOp(); }, 500);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        ans.appendChild(btn);
      });
    }
    buildOp();
  }

  /** M4-G2: Máquina matemática */
  function mathMachine() {
    setGameTitle('⚙️ Máquina Matemática');
    const max   = Math.min(getMaxNum(), 10);
    let   round = 0;
    const total = 6;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div style="font-size:3rem;">⚙️🔢⚙️</div>
        <div class="question-box">
          <div class="instruction-text">La máquina transforma números</div>
          <div id="machine-q" class="question-text" style="font-size:2.2rem;"></div>
        </div>
        <div class="answers-grid" id="machine-ans"></div>
        <div style="color:rgba(255,255,255,0.6);">${round}/${total}</div>
      </div>
    `;

    function buildRound() {
      const a = rand(1, max), b = rand(1, Math.min(a, max));
      const ops = [
        { text: `${a} + ${b}`, result: a + b },
        { text: `${a} − ${b}`, result: a - b },
      ];
      const op = ops[rand(0, ops.length-1)];
      document.getElementById('machine-q').textContent = `${op.text} = ?`;

      const ans = document.getElementById('machine-ans');
      if (!ans) return;
      ans.innerHTML = '';
      const opts = shuffle([op.result, op.result+1, op.result-1, op.result+2].filter(n=>n>=0).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === op.result) {
            btn.classList.add('correct');
            round++;
            addScore(15);
            setTimeout(() => { if (round >= total) endGame(true); else buildRound(); }, 500);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        ans.appendChild(btn);
      });
    }
    buildRound();
  }

  /** M4-G3: Arrastrar objetos para sumar */
  function dragToAdd() { doorOperation(); }

  /** M4-G4: Restar elementos visualmente */
  function visualSubtract() {
    setGameTitle('➖ Resta Visual');
    const max    = Math.min(getMaxNum(), 10);
    const emojis = ['🍎','🌟','🍬','🎈','🐟'];
    let   rounds = 0;
    const total  = 5;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="instruction-text">Quita los objetos y cuenta cuántos quedan</div>
        <div class="question-box">
          <div id="sub-visual" class="count-objects" style="gap:10px;"></div>
          <div id="sub-question" class="question-text" style="margin-top:8px;font-size:1.5rem;"></div>
        </div>
        <div class="answers-grid" id="sub-answers"></div>
      </div>
    `;

    function buildRound() {
      const total_items = rand(3, max);
      const remove      = rand(1, total_items - 1);
      const result      = total_items - remove;
      const emoji       = emojis[rand(0, emojis.length-1)];

      const visual = document.getElementById('sub-visual');
      if (visual) {
        visual.innerHTML = '';
        for (let i = 0; i < total_items; i++) {
          const span = document.createElement('span');
          span.textContent = emoji;
          if (i >= result) span.style.opacity = '0.25';
          visual.appendChild(span);
        }
      }

      document.getElementById('sub-question').textContent = `${total_items} − ${remove} = ?`;

      const ans = document.getElementById('sub-answers');
      if (!ans) return;
      ans.innerHTML = '';
      const opts = shuffle([result, result+1, result-1, result+2].filter(n=>n>=0).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === result) {
            btn.classList.add('correct');
            rounds++;
            addScore(15);
            setTimeout(() => { if (rounds >= total) endGame(true); else buildRound(); }, 500);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        ans.appendChild(btn);
      });
    }
    buildRound();
  }

  /** M4-G5: Batalla matemática amigable */
  function opBattle() { mathMachine(); }

  // ══════════════════════════════════════════════════════════
  // MUNDO 5 – CIUDAD DE LOS RETOS
  // ══════════════════════════════════════════════════════════

  /** M5-G1: Comprar objetos */
  function shoppingGame() {
    setGameTitle('🛒 La Tiendita');
    const max    = Math.min(getMaxNum(), 10);
    // article: artículo gramatical correcto para cada objeto
    const items  = [
      {name:'manzana', article:'La', emoji:'🍎', price:rand(1,max)},
      {name:'pelota',  article:'La', emoji:'⚽', price:rand(1,max)},
      {name:'lápiz',   article:'El', emoji:'✏️', price:rand(1,max)},
      {name:'libro',   article:'El', emoji:'📚', price:rand(1,max)},
      {name:'globo',   article:'El', emoji:'🎈', price:rand(1,max)},
      {name:'muñeca',  article:'La', emoji:'🪆', price:rand(1,max)},
    ];
    let   rounds = 0;
    const total  = 5;

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div style="font-size:3rem;">🏪</div>
        <div class="question-box" id="shop-question"></div>
        <div class="answers-grid" id="shop-answers"></div>
        <div style="color:rgba(255,255,255,0.6);">${rounds}/${total}</div>
      </div>
    `;

    function buildRound() {
      const item    = items[rand(0, items.length-1)];
      const have    = rand(item.price, item.price + 5);
      const change  = have - item.price;

      const q = document.getElementById('shop-question');
      if (q) q.innerHTML = `
        <div class="question-text" style="font-size:1.2rem;">
          ${item.emoji} ${item.article} ${item.name} cuesta <strong style="color:var(--yellow)">${item.price}</strong> monedas.<br>
          Pagas <strong style="color:var(--mint)">${have}</strong> monedas.<br>
          ¿Cuánto cambio recibes?
        </div>
      `;

      const ans = document.getElementById('shop-answers');
      if (!ans) return;
      ans.innerHTML = '';
      const opts = shuffle([change, change+1, change-1, change+2].filter(n=>n>=0).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = `${n} 🪙`;
        btn.addEventListener('click', () => {
          if (n === change) {
            btn.classList.add('correct');
            rounds++;
            addScore(20);
            setTimeout(() => { if (rounds >= total) endGame(true); else buildRound(); }, 600);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        ans.appendChild(btn);
      });
    }
    buildRound();
  }

  /** M5-G2: Problema cotidiano */
  function dailyProblem() {
    setGameTitle('💡 Problema del Día');
    const max = Math.min(getMaxNum(), 10);
    let   rounds = 0;
    const total  = 4;

    const templates = [
      (a,b) => ({ q: `Tengo ${a} globos. Me dan ${b} más. ¿Cuántos tengo?`, r: a+b }),
      (a,b) => ({ q: `Hay ${a+b} niños. Se van ${b}. ¿Cuántos quedan?`,    r: a }),
      (a,b) => ({ q: `${a} patos nadan y ${b} más llegan. ¿Cuántos hay?`,   r: a+b }),
      (a,b) => ({ q: `Tengo ${a+b} dulces. Como ${b}. ¿Cuántos me quedan?`, r: a }),
    ];

    const ui = getGameContainer();
    ui.innerHTML = `
      <div class="minigame-container">
        <div class="question-box">
          <div id="daily-q" class="question-text" style="font-size:1.15rem;line-height:1.5;"></div>
        </div>
        <div class="answers-grid" id="daily-ans"></div>
        <div style="color:rgba(255,255,255,0.6);">${rounds}/${total}</div>
      </div>
    `;

    function buildRound() {
      const a   = rand(1, Math.floor(max/2));
      const b   = rand(1, Math.floor(max/2));
      const tmpl = templates[rand(0, templates.length-1)];
      const {q, r} = tmpl(a, b);

      document.getElementById('daily-q').textContent = q;

      const ans = document.getElementById('daily-ans');
      if (!ans) return;
      ans.innerHTML = '';
      const opts = shuffle([r, r+1, r-1, r+2].filter(n=>n>0).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4));
      opts.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === r) {
            btn.classList.add('correct');
            rounds++;
            addScore(20);
            setTimeout(() => { if (rounds >= total) endGame(true); else buildRound(); }, 500);
          } else {
            btn.classList.add('wrong');
            loseLife();
          }
        });
        ans.appendChild(btn);
      });
    }
    buildRound();
  }

  /** M5-G3: Ayudar personajes */
  function helpCharacter() { dailyProblem(); }

  /** M5-G4: Elegir respuestas correctas */
  function multiChoice() { doorOperation(); }

  /** M5-G5: Reto interactivo */
  function interactiveRiddle() {
    setGameTitle('🎯 Reto Interactivo');
    shoppingGame();
  }

  // ── Exposición pública ─────────────────────────────────────
  return { launch };

})();
