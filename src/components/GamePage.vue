<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGame } from '../composables/useGame.js'

const emit = defineEmits(['home'])
const { 
  gameState, timer, guess, useHint, skipWord, goHome, startGame,
  guessedWord, wrongLetters, difficultyLabel, isPlaying, won, lost
} = useGame()

const letterInput = ref('')
const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('')

const isKeyHit = (l) => gameState.value.guessed.has(l)
const isKeyMiss = (l) => gameState.value.wrong.has(l)
const isKeyDisabled = (l) => isKeyHit(l) || isKeyMiss(l) || !isPlaying.value

const handleGuess = (letter) => {
  guess(letter)
}

const handleInput = () => {
  const val = letterInput.value.trim().toUpperCase()
  if (val) guess(val)
  letterInput.value = ''
}

const handleKeydown = (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey) return
  const target = e.target
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
  if (e.key.length === 1 && /^[a-zA-ZÑñ]$/.test(e.key)) {
    guess(e.key.toUpperCase())
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const hangmanImage = computed(() => {
  const livesLost = gameState.value.maxLives - gameState.value.lives
  const index = Math.max(1, Math.min(8, livesLost + 1))
  return `/ahorcado0${index.toString().padStart(2, '0')}.png`
})
</script>

<template>
  <section class="page" role="main" aria-label="Juego del ahorcado">
    <div class="card game-card">
      <div class="game-header">
        <div class="badge">Dificultad: {{ difficultyLabel }}</div>
        <div class="pill">Vidas: <span>{{ gameState.lives }}</span></div>
        <div class="pill">Tiempo: <span>{{ timer }}</span></div>
        <div class="pill">Racha: <span>{{ gameState.streak }}</span></div>
      </div>

      <div class="game-main">
        <div class="hangman-container">
          <img :src="hangmanImage" :alt="`Ahorcado - Estado ${gameState.lives}`" class="hangman-img" />
        </div>

        <div class="guess-area">
          <div class="guessed-word">
            <span 
              v-for="(letter, i) in guessedWord" 
              :key="i" 
              class="letter"
              :class="{ revealed: letter !== '_' }"
            >
              {{ letter }}
            </span>
          </div>
          <p class="word-hint">Palabra de {{ gameState.secretWord.length }} letras</p>

          <div class="input-row">
            <input
              v-model="letterInput"
              type="text"
              maxlength="1"
              class="input"
              placeholder="Escribe una letra"
              :disabled="!isPlaying"
              @keyup.enter="handleInput"
            />
            <button 
              class="btn btn-icon" 
              :disabled="gameState.hintsLeft <= 0 || !isPlaying"
              @click="useHint"
            >
              Pista ({{ gameState.hintsLeft }})
            </button>
            <button class="btn btn-ghost" :disabled="!isPlaying" @click="skipWord">
              Saltar
            </button>
          </div>

          <div class="wrong-letters">
            <span v-for="letter in wrongLetters" :key="letter" class="wrong-letter">
              {{ letter }}
            </span>
          </div>

          <div class="keyboard">
            <button
              v-for="letter in letters"
              :key="letter"
              class="key"
              :class="{
                'is-hit': isKeyHit(letter),
                'is-miss': isKeyMiss(letter),
                'is-disabled': isKeyDisabled(letter)
              }"
              :disabled="isKeyDisabled(letter)"
              @click="handleGuess(letter)"
            >
              {{ letter }}
            </button>
          </div>
        </div>
      </div>

      <div class="game-buttons">
        <button class="btn btn-primary" @click="startGame(gameState.difficulty)">Nuevo juego</button>
        <button class="btn btn-secondary" @click="goHome">Volver</button>
      </div>
    </div>
  </section>

  <!-- Modal Victoria -->
  <div v-if="won" class="modal-overlay" @click="goHome">
    <div class="modal-container" @click.stop>
      <h2 class="modal-title win">¡Felicidades!</h2>
      <p class="modal-text">Ganaste en {{ timer }}</p>
      <button class="modal-btn" @click="goHome">OK</button>
    </div>
  </div>

  <!-- Modal Derrota -->
  <div v-if="lost" class="modal-overlay" @click="goHome">
    <div class="modal-container" @click.stop>
      <h2 class="modal-title lose">Perdiste</h2>
      <p class="modal-text">La palabra era: {{ gameState.secretWord }}</p>
      <button class="modal-btn" @click="goHome">OK</button>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  width: min(1050px, 95vw);
}

.game-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.game-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
  align-items: center;
}

.hangman-container {
  text-align: center;
  padding: 18px;
  background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.65));
  border-radius: 24px;
  border: 1px solid rgba(248, 250, 252, 0.12);
}

.hangman-img {
  max-width: 100%;
  max-height: 320px;
  filter: drop-shadow(0 18px 28px rgba(15, 23, 42, 0.45)) hue-rotate(110deg) saturate(1.8) brightness(1.05);
}

.guess-area {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.guessed-word {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  font-size: 1.9rem;
  min-height: 50px;
}

.letter {
  display: inline-block;
  min-width: 1.5em;
  text-align: center;
  padding: 4px 8px;
  border-bottom: 2px solid var(--muted);
  animation: reveal 0.3s ease-out;
}

.letter.revealed {
  border-bottom-color: var(--accent);
}

@keyframes reveal {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.word-hint {
  text-align: center;
  color: var(--muted);
  font-size: 1rem;
  font-weight: 500;
}

.input-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.input-row .input {
  width: 170px;
  text-align: center;
}

.wrong-letters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  min-height: 28px;
  color: var(--danger);
}

.wrong-letter {
  animation: shake 0.4s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.keyboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(34px, 1fr));
  gap: 8px;
  padding: 10px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.key {
  padding: 8px 6px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  font-family: "Fira Mono", monospace;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.key:hover:not(.is-disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.key.is-hit {
  background: rgba(34, 197, 94, 0.5);
  color: #0f172a;
  border-color: rgba(34, 197, 94, 0.6);
}

.key.is-miss {
  background: rgba(249, 115, 22, 0.5);
  color: #0f172a;
  border-color: rgba(249, 115, 22, 0.6);
}

.key.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.game-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  margin-top: 26px;
}

@media (max-width: 600px) {
  .input-row .input {
    width: 100%;
  }

  .input-row {
    flex-direction: column;
  }

  .keyboard {
    grid-template-columns: repeat(9, 1fr);
  }

  .key {
    font-size: 0.75rem;
    padding: 6px 4px;
  }

  .guessed-word {
    font-size: 1.5rem;
  }
}
</style>