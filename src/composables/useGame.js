import { ref, computed } from 'vue'

const STORAGE_KEYS = {
  words: 'hangman_words',
  stats: 'hangman_stats',
  theme: 'hangman_theme',
}

const DEFAULT_WORDS = [
  'PELOTA', 'HORCA', 'AHORCADO', 'CELULAR', 'FRONTEND', 'ALURA', 'LATAM',
  'ECUADOR', 'CHILE', 'ORACLE', 'REACT', 'GITHUB', 'GOOGLE', 'NETFLIX',
  'DISNEY', 'YOUTUBE', 'FACEBOOK', 'PROGRAMAR', 'TECLADO', 'PANTALLA',
  'JAVASCRIPT', 'PYTHON', 'VARIABLE', 'FUNCION', 'BUCLE', 'CONDICIONAL',
  'ARRAY', 'OBJETO', 'PROMESA', 'ASINCRONO', 'NAVEGADOR', 'SERVIDOR',
  'DATABASE', 'API', 'BACKEND', 'DEVOPS', 'DOCKER', 'KUBERNETES',
  'GIT', 'COMMIT', 'BRANCH', 'MERGE', 'PULL', 'REQUEST', 'DEPLOY',
  'INTELIGENCIA', 'ARTIFICIAL', 'MACHINE', 'LEARNING', 'DEEP', 'NEURAL',
]

const DIFFICULTIES = {
  easy: { label: 'Fácil', hints: 2, revealVowels: true, lives: 8 },
  normal: { label: 'Normal', hints: 1, revealVowels: false, lives: 7 },
  hard: { label: 'Difícil', hints: 0, revealVowels: false, lives: 6 },
}

let gameInstance = null

export function useGame() {
  if (gameInstance) return gameInstance

  let audioContext = null

  const words = ref([])
  const stats = ref({ games: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0, bestTime: null })
  const theme = ref('dark')

  const gameState = ref({
    guessed: new Set(),
    wrong: new Set(),
    secretWord: '',
    status: 'playing',
    difficulty: 'normal',
    hintsLeft: 1,
    maxLives: 7,
    lives: 7,
    startTime: 0,
  })

  const currentPage = ref('home')
  const timer = ref('00:00')
  let timerInterval = null

  const init = () => {
    words.value = loadWords()
    stats.value = loadStats()
    theme.value = loadTheme()
    gameState.value = createNewState()
  }

  const loadWords = () => {
    const stored = localStorage.getItem(STORAGE_KEYS.words)
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.words, JSON.stringify(DEFAULT_WORDS))
      return [...DEFAULT_WORDS]
    }
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length) return parsed
    } catch {}
    localStorage.setItem(STORAGE_KEYS.words, JSON.stringify(DEFAULT_WORDS))
    return [...DEFAULT_WORDS]
  }

  const loadStats = () => {
    const base = { games: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0, bestTime: null }
    const stored = localStorage.getItem(STORAGE_KEYS.stats)
    if (!stored) return base
    try {
      return { ...base, ...JSON.parse(stored) }
    } catch {
      return base
    }
  }

  const saveStats = () => {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats.value))
  }

  const loadTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return saved || (prefersDark ? 'dark' : 'dark')
  }

  const saveTheme = () => {
    localStorage.setItem(STORAGE_KEYS.theme, theme.value)
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme.value)
    saveTheme()
  }

  const createNewState = () => ({
    guessed: new Set(),
    wrong: new Set(),
    secretWord: '',
    status: 'playing',
    difficulty: 'normal',
    hintsLeft: 1,
    maxLives: 7,
    lives: 7,
    startTime: 0,
  })

  const normalizeWord = (text) => {
    const upper = text.toUpperCase()
    const replacements = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' }
    return upper.replace(/[ÁÉÍÓÚÜ]/g, (c) => replacements[c] || c).replace(/\s+/g, '')
  }

  const randomWord = () => {
    if (!words.value.length) words.value = [...DEFAULT_WORDS]
    const choice = words.value[Math.floor(Math.random() * words.value.length)]
    return normalizeWord(choice)
  }

  const startGame = (difficulty) => {
    stopTimer()
    gameState.value = createNewState()
    gameState.value.difficulty = difficulty
    const diff = DIFFICULTIES[difficulty]
    gameState.value.hintsLeft = diff.hints
    gameState.value.maxLives = diff.lives
    gameState.value.lives = diff.lives
    gameState.value.secretWord = randomWord()

    if (diff.revealVowels) {
      const vowels = ['A', 'E', 'I', 'O', 'U']
      vowels.forEach((v) => {
        if (gameState.value.secretWord.includes(v)) gameState.value.guessed.add(v)
      })
    }

    currentPage.value = 'game'
    startTimer()
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const startTimer = () => {
    gameState.value.startTime = Date.now()
    timer.value = '00:00'
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.value.startTime) / 1000)
      timer.value = formatTime(elapsed)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const guess = (letter) => {
    if (gameState.value.status !== 'playing') return

    const l = normalizeWord(letter).charAt(0)
    if (!l || !/^[A-ZÑ]$/.test(l)) return
    if (gameState.value.guessed.has(l) || gameState.value.wrong.has(l)) return

    if (gameState.value.secretWord.includes(l)) {
      gameState.value.guessed.add(l)
      playSound('correct')
    } else {
      gameState.value.lives -= 1
      gameState.value.wrong.add(l)
      playSound('wrong')
    }

    checkGameEnd()
  }

  const useHint = () => {
    if (gameState.value.status !== 'playing' || gameState.value.hintsLeft <= 0) return

    const remaining = [...new Set(gameState.value.secretWord.split(''))].filter(
      (l) => !gameState.value.guessed.has(l)
    )
    if (!remaining.length) return

    const letter = remaining[Math.floor(Math.random() * remaining.length)]
    gameState.value.guessed.add(letter)
    gameState.value.hintsLeft -= 1
    playSound('hint')
    checkGameEnd()
  }

  const skipWord = () => {
    if (gameState.value.status !== 'playing') return
    gameState.value.lives = 0
    finishGame(false)
  }

  const checkGameEnd = () => {
    if (gameState.value.lives <= 0) {
      finishGame(false)
      return
    }
    const uniqueLetters = [...new Set(gameState.value.secretWord.split(''))]
    const won = uniqueLetters.every((l) => gameState.value.guessed.has(l))
    if (won) finishGame(true)
  }

  const finishGame = (won) => {
    if (gameState.value.status !== 'playing') return

    gameState.value.status = 'over'
    stopTimer()

    stats.value.games += 1

    if (won) {
      stats.value.wins += 1
      stats.value.streak += 1
      stats.value.bestStreak = Math.max(stats.value.bestStreak, stats.value.streak)

      const elapsed = Math.floor((Date.now() - gameState.value.startTime) / 1000)
      if (!stats.value.bestTime || elapsed < stats.value.bestTime) {
        stats.value.bestTime = elapsed
      }
      playSound('win')
    } else {
      stats.value.losses += 1
      stats.value.streak = 0
      playSound('lose')
    }

    saveStats()
  }

  const playSound = (type) => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioContext.state === 'suspended') audioContext.resume()

    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()
    osc.connect(gain)
    gain.connect(audioContext.destination)

    switch (type) {
      case 'correct':
        osc.frequency.setValueAtTime(523.25, audioContext.currentTime)
        osc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1)
        osc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2)
        gain.gain.setValueAtTime(0.3, audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        osc.start()
        osc.stop(audioContext.currentTime + 0.3)
        break
      case 'wrong':
        osc.frequency.setValueAtTime(196, audioContext.currentTime)
        osc.frequency.setValueAtTime(164.81, audioContext.currentTime + 0.15)
        gain.gain.setValueAtTime(0.3, audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        osc.start()
        osc.stop(audioContext.currentTime + 0.3)
        break
      case 'hint':
        osc.frequency.setValueAtTime(440, audioContext.currentTime)
        osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.1)
        gain.gain.setValueAtTime(0.2, audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        osc.start()
        osc.stop(audioContext.currentTime + 0.2)
        break
      case 'win':
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          const o = audioContext.createOscillator()
          const g = audioContext.createGain()
          o.connect(g)
          g.connect(audioContext.destination)
          o.frequency.value = freq
          g.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1)
          g.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3)
          o.start(audioContext.currentTime + i * 0.1)
          o.stop(audioContext.currentTime + i * 0.1 + 0.3)
        })
        break
      case 'lose':
        osc.frequency.setValueAtTime(300, audioContext.currentTime)
        osc.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.5)
        gain.gain.setValueAtTime(0.3, audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        osc.start()
        osc.stop(audioContext.currentTime + 0.5)
        break
    }
  }

  const goHome = () => {
    stopTimer()
    currentPage.value = 'home'
  }

  const addWord = (word) => {
    const normalized = normalizeWord(word)
    const valid = /^[A-ZÑ]+$/.test(normalized) && normalized.length >= 2 && normalized.length <= 12
    if (!valid) return false
    if (!words.value.includes(normalized)) {
      words.value.push(normalized)
      localStorage.setItem(STORAGE_KEYS.words, JSON.stringify(words.value))
    }
    return true
  }

  const wordLength = computed(() => gameState.value.secretWord.length)
  const livesLeft = computed(() => gameState.value.lives)
  const isPlaying = computed(() => gameState.value.status === 'playing')
  const won = computed(() => gameState.value.status === 'over' && gameState.value.lives > 0)
  const lost = computed(() => gameState.value.status === 'over' && gameState.value.lives <= 0)
  const guessedWord = computed(() => {
    return gameState.value.secretWord
      .split('')
      .map((l) => (gameState.value.guessed.has(l) ? l : '_'))
      .join('')
  })
  const wrongLetters = computed(() => [...gameState.value.wrong].sort())
  const difficultyLabel = computed(() => DIFFICULTIES[gameState.value.difficulty].label)
  const elapsedTime = computed(() => {
    if (!gameState.value.startTime) return 0
    return Math.floor((Date.now() - gameState.value.startTime) / 1000)
  })

  const api = {
    words,
    stats,
    theme,
    gameState,
    currentPage,
    timer,
    wordLength,
    livesLeft,
    isPlaying,
    won,
    lost,
    guessedWord,
    wrongLetters,
    difficultyLabel,
    elapsedTime,
    DIFFICULTIES,
    init,
    startGame,
    guess,
    useHint,
    skipWord,
    goHome,
    addWord,
    toggleTheme,
    formatTime,
  }

  gameInstance = api
  return api
}