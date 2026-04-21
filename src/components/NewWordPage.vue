<script setup>
import { ref, computed } from 'vue'
import { useGame } from '../composables/useGame.js'

const emit = defineEmits(['home', 'start'])
const { words, addWord, startGame } = useGame()

const newWord = ref('')
const error = ref('')

const wordCount = computed(() => newWord.value.trim().length)
const isValid = computed(() => {
  const w = newWord.value.trim().toUpperCase()
  return /^[A-ZÑ]+$/.test(w) && w.length >= 2 && w.length <= 12
})

const handleSave = () => {
  if (!isValid.value) {
    error.value = 'Escribe una palabra válida (2-12 letras, solo A-Z, Ñ)'
    return
  }
  
  const success = addWord(newWord.value)
  if (success) {
    newWord.value = ''
    error.value = ''
    emit('start', 'normal')
  } else {
    error.value = 'La palabra ya existe o es inválida'
  }
}

const handleCancel = () => {
  emit('home')
}

const previewWords = computed(() => words.value.slice(-6).join(', '))
</script>

<template>
  <section class="page" role="main" aria-label="Agregar palabra">
    <div class="card newword-card">
      <div class="newword-header">
        <h2>Agregar palabra</h2>
        <p>Se guarda en tu navegador. Máximo 12 letras.</p>
      </div>

      <textarea
        v-model="newWord"
        class="input newword-input"
        placeholder="Escribe tu nueva palabra"
        maxlength="12"
        @keyup.enter="handleSave"
      ></textarea>

      <div class="word-counter">
        <img src="/exclamacion.svg" alt="icono" />
        <p>
          <span>{{ wordCount }}</span>/12 • Solo letras (A-Z, Ñ). Sin espacios.
        </p>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="saved-words">
        Guardadas: {{ words.length }}. Últimas: {{ previewWords || '-' }}
      </div>

      <div class="btns">
        <button class="btn btn-primary" :disabled="!isValid" @click="handleSave">
          Guardar y empezar
        </button>
        <button class="btn btn-secondary" @click="handleCancel">
          Cancelar
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.newword-card {
  width: min(500px, 90vw);
  max-width: 500px;
}

.newword-header {
  margin-bottom: 24px;
}

.newword-header h2 {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: var(--text);
}

.newword-header p {
  color: var(--muted);
  font-size: 0.95rem;
}

.newword-input {
  width: 100%;
  min-height: 100px;
  resize: none;
  margin-bottom: 16px;
}

.word-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.word-counter img {
  width: 20px;
  height: 20px;
}

.error-message {
  color: var(--danger);
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.saved-words {
  color: var(--muted);
  font-size: 0.85rem;
  margin-bottom: 24px;
  padding: 12px;
  background: var(--surface-strong);
  border-radius: 12px;
}

.btns {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btns .btn {
  width: 100%;
}
</style>