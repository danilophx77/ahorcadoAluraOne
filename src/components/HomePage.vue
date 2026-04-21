<script setup>
import { ref } from 'vue'
import { useGame } from '../composables/useGame.js'

const emit = defineEmits(['start', 'newWord'])
const { stats, DIFFICULTIES, formatTime, startGame } = useGame()

const difficulty = ref('normal')
const showRules = ref(false)

const handleStart = () => {
  emit('start', difficulty.value)
}

const handleNewWord = () => {
  emit('newWord')
}
</script>

<template>
  <section class="page" role="main" aria-label="Página principal">
    <div class="card home-card">
      <div class="brand">
        <p class="eyebrow">Clásico renovado</p>
        <h1>Juego del Ahorcado</h1>
        <p class="lead">
          Adivina la palabra, cuida tus vidas y mantén la racha.
        </p>
      </div>

      <div class="home-actions">
        <div class="field">
          <label for="difficulty">Dificultad</label>
          <select id="difficulty" v-model="difficulty" class="select">
            <option v-for="(config, key) in DIFFICULTIES" :key="key" :value="key">
              {{ config.label }}
            </option>
          </select>
        </div>

        <div class="home-stats">
          <div class="stat-card">
            <span class="stat-label">Partidas</span>
            <strong class="stat-value">{{ stats.games }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">Racha</span>
            <strong class="stat-value">{{ stats.bestStreak }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">Mejor tiempo</span>
            <strong class="stat-value">{{ stats.bestTime ? formatTime(stats.bestTime) : '--:--' }}</strong>
          </div>
        </div>

        <div class="btns">
          <button class="btn btn-primary" @click="handleStart">Iniciar juego</button>
          <button class="btn btn-secondary" @click="handleNewWord">Añadir palabra</button>
        </div>

        <details class="rules" :open="showRules">
          <summary @click="showRules = !showRules">Reglas rápidas</summary>
          <p>
            Tienes 7 errores antes de perder. En modo Fácil se revelan las vocales, 
            en Normal solo una pista, y en Difícil no hay pistas.
          </p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-card {
  width: min(980px, 92vw);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-actions {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 500;
}

.home-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.btns {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rules {
  background: var(--surface-strong);
  border-radius: 16px;
  padding: 14px 18px;
  color: var(--muted);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.rules summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
}

.rules p {
  margin-top: 12px;
  line-height: 1.6;
  font-size: 0.95rem;
}
</style>