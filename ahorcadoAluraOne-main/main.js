// ============================================
// JUEGO DEL AHORCADO - VERSIÓN MEJORADA
// ============================================

// --- SELECTORES DE UI ---
const ui = {
  homePage: document.querySelector(".home-page"),
  gamePage: document.querySelector(".game-page"),
  newWordPage: document.querySelector(".newWord-page"),
  btnStart: document.querySelector(".btn-start"),
  btnNewWord: document.querySelector(".btn-newWord"),
  btnNewGame: document.querySelector(".btn-newGame"),
  btnDesist: document.querySelector(".btn-desist"),
  btnSave: document.querySelector(".btn__save"),
  btnCancel: document.querySelector(".btn__cancel"),
  btnHint: document.getElementById("btnHint"),
  btnSkip: document.getElementById("btnSkip"),
  difficultySelect: document.getElementById("difficultySelect"),
  difficultyLabel: document.getElementById("difficultyLabel"),
  livesLeft: document.getElementById("livesLeft"),
  liveStreak: document.getElementById("liveStreak"),
  timer: document.getElementById("timer"),
  wordHint: document.getElementById("wordHint"),
  letterInput: document.getElementById("letterInput"),
  keyboard: document.getElementById("keyboard"),
  wordCounter: document.getElementById("wordCounter"),
  savedWords: document.getElementById("savedWords"),
  newWordText: document.getElementById("newWord__text"),
  statGames: document.getElementById("statGames"),
  statStreak: document.getElementById("statStreak"),
  statBestTime: document.getElementById("statBestTime"),
  modalWin: document.querySelector(".modal__win"),
  modalWinText: document.querySelector(".modal__win .modal__paragraph"),
  modalLose: document.querySelector(".modal__gameOver"),
  modalLoseText: document.getElementById("end"),
  modalCloseWin: document.querySelector(".modal__close"),
  modalCloseLose: document.querySelector(".modal__close--end"),
  themeToggle: document.getElementById("themeToggle"),
  ahorcado: null,
  guessedContainer: null,
  wrongContainer: null,
};

// --- CONSTANTES ---
const STORAGE_KEYS = {
  words: "hangman_words",
  stats: "hangman_stats",
  theme: "hangman_theme",
};

const DEFAULT_WORDS = [
  "PELOTA", "HORCA", "AHORCADO", "CELULAR", "FRONTEND", "ALURA", "LATAM",
  "ECUADOR", "CHILE", "ORACLE", "REACT", "GITHUB", "GOOGLE", "NETFLIX",
  "DISNEY", "YOUTUBE", "FACEBOOK", "PROGRAMAR", "TECLADO", "PANTALLA",
  "JAVASCRIPT", "PYTHON", "VARIABLE", "FUNCION", "BUCLE", "CONDICIONAL",
  "ARRAY", "OBJETO", "PROMESA", "ASINCRONO", "NAVEGADOR", "SERVIDOR",
  "DATABASE", "API", "BACKEND", "DEVOPS", "DOCKER", "KUBERNETES",
  "GIT", "COMMIT", "BRANCH", "MERGE", "PULL", "REQUEST", "DEPLOY",
  "TESTING", "DEBUG", "ERROR", "EXCEPCION", "VALIDACION", "SEGURIDAD",
  "AUTENTICACION", "TOKEN", "SESION", "USUARIO", "PERMISO", "ROL",
  "INTERNET", "WIFI", "BLUETOOTH", "USB", "HARDDISK", "MEMORIA",
  "PROCESADOR", "GPU", "RAM", "ROM", "BOOT", "BIOS", "KERNEL",
  "LINUX", "WINDOWS", "MACOS", "ANDROID", "IOS", "MOBILE", "TABLET",
  "LAPTOP", "DESKTOP", "MONITOR", "MOUSE", "WEBCAM", "MICROFONO",
  "AUDIFONOS", "PARLANTE", "IMPRESORA", "ESCANNER", "MODEM", "ROUTER",
  "FIBRA", "CABLE", "ETHERNET", "PROTOCOL", "HTTP", "HTTPS", "DNS",
  "FIREWALL", "PROXY", "VPN", "CLOUD", "AWS", "AZURE", "GCP",
  "MYSQL", "POSTGRES", "MONGODB", "REDIS", "SQLITE", "ORACLE",
  "TYPESCRIPT", "RUST", "GO", "KOTLIN", "SWIFT", "RUBY", "PHP",
  "LARAVEL", "DJANGO", "FLASK", "EXPRESS", "NEXT", "NUXT", "ANGULAR",
  "VUE", "SVELT", "TAILWIND", "BOOTSTRAP", "SASS", "LESS", "WEBPACK",
  "VITE", "BABEL", "ESLINT", "PRETTIER", "JEST", "CYPRESS", "PLAYWRIGHT",
  "INTELIGENCIA", "ARTIFICIAL", "MACHINE", "LEARNING", "DEEP", "NEURAL",
  "DATOS", "ANALITICA", "BIGDATA", "BLOCKCHAIN", "CRIPTO", "BITCOIN",
  "ETHEREUM", "SMART", "CONTRACT", "WEB3", "METAVERSO", "REALIDAD",
  "VIRTUAL", "AUMENTADA", "GAMING", "ESPORTS", "STREAMING", "PODCAST",
];

const DIFFICULTIES = {
  easy: { label: "Fácil", hints: 2, revealVowels: true, lives: 8 },
  normal: { label: "Normal", hints: 1, revealVowels: false, lives: 7 },
  hard: { label: "Difícil", hints: 0, revealVowels: false, lives: 6 },
};

// --- ESTADO DEL JUEGO ---
let words = [];
let stats = {};
let gameState = null;
let timerInterval = null;

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  init();
});

function init() {
  words = loadWords();
  stats = loadStats();
  gameState = createNewState();
  loadTheme();

  setPage("home");
  renderKeyboard();
  updateStatsUI();
  updateSavedWordsUI();
  updateWordCounter();
  updateDifficultyLabel();
  updateHintButton();

  setupEventListeners();
}

function setupEventListeners() {
  ui.btnStart?.addEventListener("click", startGame);
  ui.btnNewWord?.addEventListener("click", openNewWord);
  ui.btnNewGame?.addEventListener("click", newGame);
  ui.btnDesist?.addEventListener("click", goHome);
  ui.btnSave?.addEventListener("click", saveNewWord);
  ui.btnCancel?.addEventListener("click", goHome);
  ui.btnHint?.addEventListener("click", useHint);
  ui.btnSkip?.addEventListener("click", skipWord);
  ui.letterInput?.addEventListener("input", onLetterInput);
  ui.newWordText?.addEventListener("input", updateWordCounter);
  ui.difficultySelect?.addEventListener("change", updateDifficultyLabel);
  ui.themeToggle?.addEventListener("click", toggleTheme);

  document.addEventListener("keydown", onKeyDown);
  ui.modalCloseWin?.addEventListener("click", closeWinModal);
  ui.modalCloseLose?.addEventListener("click", closeLoseModal);
}

// --- NAVEGACIÓN ---
function setPage(page) {
  if (ui.homePage) ui.homePage.style.display = page === "home" ? "flex" : "none";
  if (ui.gamePage) ui.gamePage.style.display = page === "game" ? "block" : "none";
  if (ui.newWordPage) ui.newWordPage.style.display = page === "newWord" ? "block" : "none";
}

function startGame() {
  gameState.difficulty = ui.difficultySelect.value;
  updateDifficultyLabel();
  setPage("game");
  newGame();
}

function openNewWord() {
  setPage("newWord");
  ui.newWordText?.focus();
}

function goHome() {
  stopTimer();
  closeWinModal();
  closeLoseModal();
  setPage("home");
}

// --- LÓGICA DEL JUEGO ---
function newGame() {
  stopTimer();
  gameState = createNewState();
  gameState.difficulty = ui.difficultySelect.value;
  const difficulty = DIFFICULTIES[gameState.difficulty];
  gameState.hintsLeft = difficulty.hints;
  gameState.maxLives = difficulty.lives;
  gameState.lives = difficulty.lives;
  gameState.secretWord = randomWord();

  if (difficulty.revealVowels) {
    revealVowels();
  }

  updateHintButton();
  updateDifficultyLabel();
  draw();
  startTimer();
}

function randomWord() {
  if (!words.length) {
    words = [...DEFAULT_WORDS];
  }
  const choice = words[Math.floor(Math.random() * words.length)];
  return normalizeWord(choice);
}

function revealVowels() {
  const vowels = ["A", "E", "I", "O", "U"];
  vowels.forEach((vowel) => {
    if (gameState.secretWord.includes(vowel)) {
      gameState.guessed.add(vowel);
    }
  });
}

function createNewState() {
  return {
    guessed: new Set(),
    wrong: new Set(),
    secretWord: "",
    status: "playing",
    difficulty: "normal",
    hintsLeft: 1,
    maxLives: 7,
    lives: 7,
    startTime: 0,
  };
}

// --- MANEJO DE LETRAS ---
function onLetterInput(event) {
  const value = event.target.value;
  event.target.value = "";
  handleGuess(value);
}

function onKeyDown(event) {
  if (event.ctrlKey || event.altKey || event.metaKey) return;

  const target = event.target;
  const isTyping = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
  if (isTyping) return;

  if (event.key.length === 1 && /^[a-zA-ZÑñ]$/.test(event.key)) {
    handleGuess(event.key);
  }
}

function handleGuess(input) {
  if (gameState.status !== "playing") return;

  const letter = normalizeWord(input).charAt(0).toUpperCase();
  if (!letter || !/^[A-ZÑ]$/.test(letter)) return;
  if (gameState.guessed.has(letter) || gameState.wrong.has(letter)) return;

  if (gameState.secretWord.includes(letter)) {
    gameState.guessed.add(letter);
    playSound("correct");
  } else {
    gameState.lives -= 1;
    gameState.wrong.add(letter);
    playSound("wrong");
  }

  draw();
  checkGameEnd();
}

// --- PISTAS Y SALTOS ---
function useHint() {
  if (gameState.status !== "playing" || gameState.hintsLeft <= 0) return;

  const remainingLetters = [...new Set(gameState.secretWord.split(""))]
    .filter((letter) => !gameState.guessed.has(letter));

  if (!remainingLetters.length) return;

  const letter = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
  gameState.guessed.add(letter);
  gameState.hintsLeft -= 1;

  playSound("hint");
  draw();
  checkGameEnd();
}

function skipWord() {
  if (gameState.status !== "playing") return;
  gameState.lives = 0;
  finishGame(false);
}

// --- DIBUJADO Y RENDERIZADO ---
function draw() {
  updateHangmanImage();
  renderGuessedLetters();
  renderWrongLetters();
  updateKeyboardState();
  updateLivesDisplay();

  if (ui.wordHint && gameState.secretWord) {
    ui.wordHint.textContent = `Palabra de ${gameState.secretWord.length} letras`;
  }

  if (ui.letterInput) {
    ui.letterInput.disabled = gameState.status !== "playing";
  }

  updateStatsUI();
  updateHintButton();
}

function updateHangmanImage() {
  const ahorcadoEl = document.getElementById("ahorcado");
  if (!ahorcadoEl) return;

  const livesLost = gameState.maxLives - gameState.lives;
  const imageIndex = Math.max(1, Math.min(8, livesLost + 1));
  const indexStr = imageIndex.toString().padStart(2, '0');
  const newSrc = `img/ahorcado${indexStr}.png`;

  ahorcadoEl.src = newSrc;
  ahorcadoEl.alt = `Ahorcado - Estado ${imageIndex}`;
}

function renderGuessedLetters() {
  const container = ui.guessedContainer || document.querySelector(".guessed-words");
  if (!container || !gameState.secretWord) return;

  ui.guessedContainer = container;
  container.innerHTML = "";

  gameState.secretWord.split("").forEach((letter) => {
    const span = document.createElement("span");
    span.className = "word guessed";
    span.textContent = gameState.guessed.has(letter) ? letter : "_";
    span.setAttribute("aria-label", gameState.guessed.has(letter) ? letter : "letra oculta");
    container.appendChild(span);
  });
}

function renderWrongLetters() {
  const container = ui.wrongContainer || document.querySelector(".wrong-words");
  if (!container) return;

  ui.wrongContainer = container;
  container.innerHTML = "";

  [...gameState.wrong].sort().forEach((letter) => {
    const span = document.createElement("span");
    span.className = "word wrong";
    span.textContent = letter;
    container.appendChild(span);
  });
}

function updateKeyboardState() {
  if (!ui.keyboard) return;

  const keys = ui.keyboard.querySelectorAll(".key");
  keys.forEach((btn) => {
    const letter = btn.dataset.letter;
    btn.classList.remove("is-hit", "is-miss", "is-disabled");

    if (gameState.guessed.has(letter)) {
      btn.classList.add("is-hit", "is-disabled");
      btn.setAttribute("aria-disabled", "true");
    } else if (gameState.wrong.has(letter)) {
      btn.classList.add("is-miss", "is-disabled");
      btn.setAttribute("aria-disabled", "true");
    } else {
      btn.removeAttribute("aria-disabled");
    }

    if (gameState.status !== "playing") {
      btn.classList.add("is-disabled");
      btn.setAttribute("aria-disabled", "true");
    }
  });
}

function updateLivesDisplay() {
  if (ui.livesLeft) {
    ui.livesLeft.textContent = gameState.lives;
  }
}

function renderKeyboard() {
  if (!ui.keyboard) return;

  const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  ui.keyboard.innerHTML = "";

  letters.forEach((letter) => {
    const btn = document.createElement("button");
    btn.className = "key";
    btn.type = "button";
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.setAttribute("aria-label", `Letra ${letter}`);
    btn.addEventListener("click", () => handleGuess(letter));
    ui.keyboard.appendChild(btn);
  });
}

// --- FIN DEL JUEGO ---
function checkGameEnd() {
  if (gameState.lives <= 0) {
    finishGame(false);
    return;
  }

  const uniqueLetters = [...new Set(gameState.secretWord.split(""))];
  const won = uniqueLetters.every((letter) => gameState.guessed.has(letter));

  if (won) {
    finishGame(true);
  }
}

function finishGame(won) {
  if (gameState.status !== "playing") return;

  gameState.status = "over";
  stopTimer();

  stats.games = (stats.games || 0) + 1;

  if (won) {
    stats.wins = (stats.wins || 0) + 1;
    stats.streak = (stats.streak || 0) + 1;
    stats.bestStreak = Math.max(stats.bestStreak || 0, stats.streak);

    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    if (!stats.bestTime || elapsed < stats.bestTime) {
      stats.bestTime = elapsed;
    }

    if (ui.modalWinText) {
      ui.modalWinText.textContent = `¡Ganaste en ${formatTime(elapsed)}!`;
    }
    if (ui.modalWin) {
      ui.modalWin.classList.add("modal__win--show");
    }

    playSound("win");
  } else {
    stats.losses = (stats.losses || 0) + 1;
    stats.streak = 0;

    if (ui.modalLoseText) {
      ui.modalLoseText.textContent = `La palabra era: ${gameState.secretWord}`;
    }
    if (ui.modalLose) {
      ui.modalLose.classList.add("modal__gameOver--show");
    }

    playSound("lose");
  }

  saveStats();
  updateStatsUI();
  updateKeyboardState();
  updateHintButton();
}

// --- TEMPORIZADOR ---
function startTimer() {
  gameState.startTime = Date.now();
  if (ui.timer) ui.timer.textContent = "00:00";

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    if (ui.timer) ui.timer.textContent = formatTime(elapsed);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

// --- SONIDOS (Web Audio API) ---
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  switch (type) {
    case "correct":
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
    case "wrong":
      oscillator.frequency.setValueAtTime(196, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(164.81, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
    case "hint":
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      break;
    case "win":
      playWinSound();
      break;
    case "lose":
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      break;
  }
}

function playWinSound() {
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
    osc.start(audioContext.currentTime + i * 0.1);
    osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
  });
}

// --- GESTIÓN DE PALABRAS ---
function saveNewWord() {
  const added = addNewWord();
  if (added) {
    setPage("game");
    newGame();
  }
}

function addNewWord() {
  const input = ui.newWordText?.value.trim() || "";
  const normalized = normalizeWord(input);
  const valid = /^[A-ZÑ]+$/.test(normalized) && normalized.length >= 2 && normalized.length <= 12;

  if (!valid) {
    if (ui.savedWords) {
      ui.savedWords.textContent = "Escribe una palabra válida (2-12 letras, solo A-Z, Ñ).";
      ui.savedWords.style.color = "var(--danger)";
    }
    ui.newWordText?.focus();
    return false;
  }

  if (!words.includes(normalized)) {
    words.push(normalized);
    saveWords();
  }

  if (ui.newWordText) ui.newWordText.value = "";
  updateWordCounter();
  updateSavedWordsUI();

  if (ui.savedWords) {
    ui.savedWords.style.color = "var(--muted)";
  }

  playSound("correct");
  return true;
}

function normalizeWord(text) {
  const upper = text.toUpperCase();
  const replacements = {
    Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U", Ü: "U",
  };
  return upper
    .replace(/[ÁÉÍÓÚÜ]/g, (char) => replacements[char] || char)
    .replace(/\s+/g, "");
}

function updateWordCounter() {
  if (!ui.wordCounter || !ui.newWordText) return;
  const length = ui.newWordText.value.trim().length;
  ui.wordCounter.textContent = length;
}

function updateSavedWordsUI() {
  if (!ui.savedWords) return;

  const preview = words.slice(-6).join(", ");
  ui.savedWords.textContent = `Guardadas: ${words.length}. Últimas: ${preview || "-"}`;
}

function loadWords() {
  const stored = localStorage.getItem(STORAGE_KEYS.words);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.words, JSON.stringify(DEFAULT_WORDS));
    return [...DEFAULT_WORDS];
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map(normalizeWord);
    }
  } catch (error) {
    // Error loading saved words
  }
  localStorage.setItem(STORAGE_KEYS.words, JSON.stringify(DEFAULT_WORDS));
  return [...DEFAULT_WORDS];
}

function saveWords() {
  localStorage.setItem(STORAGE_KEYS.words, JSON.stringify(words));
}

// --- ESTADÍSTICAS ---
function loadStats() {
  const base = {
    games: 0,
    wins: 0,
    losses: 0,
    streak: 0,
    bestStreak: 0,
    bestTime: null,
  };
  const stored = localStorage.getItem(STORAGE_KEYS.stats);
  if (!stored) return base;

  try {
    return { ...base, ...JSON.parse(stored) };
  } catch (error) {
    return base;
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
}

function updateStatsUI() {
  if (ui.statGames) ui.statGames.textContent = stats.games || 0;
  if (ui.statStreak) ui.statStreak.textContent = stats.bestStreak || 0;
  if (ui.statBestTime) {
    ui.statBestTime.textContent = stats.bestTime ? formatTime(stats.bestTime) : "--:--";
  }
  if (ui.liveStreak) ui.liveStreak.textContent = stats.streak || 0;
}

// --- UTILIDADES ---
function updateDifficultyLabel() {
  if (!ui.difficultyLabel) return;
  const difficulty = DIFFICULTIES[ui.difficultySelect.value];
  ui.difficultyLabel.textContent = difficulty ? difficulty.label : "Normal";
}

function updateHintButton() {
  if (!ui.btnHint) return;
  ui.btnHint.disabled = gameState.hintsLeft <= 0 || gameState.status !== "playing";
  ui.btnHint.textContent = `Pista (${Math.max(gameState.hintsLeft, 0)})`;
}

function closeWinModal(event) {
  if (event) event.preventDefault();
  ui.modalWin?.classList.remove("modal__win--show");
}

function closeLoseModal(event) {
  if (event) event.preventDefault();
  ui.modalLose?.classList.remove("modal__gameOver--show");
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  localStorage.setItem(STORAGE_KEYS.theme, next);
  ui.themeToggle.textContent = next === "light" ? "☀️" : "🌙";
}

function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "dark");
  document.documentElement.setAttribute("data-theme", theme);
  ui.themeToggle.textContent = theme === "light" ? "☀️" : "🌙";
}
