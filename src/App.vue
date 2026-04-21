<script setup>
import { onMounted, watch } from 'vue'
import { useGame } from './composables/useGame.js'
import HomePage from './components/HomePage.vue'
import GamePage from './components/GamePage.vue'
import NewWordPage from './components/NewWordPage.vue'

const { currentPage, theme, init, toggleTheme, goHome, startGame } = useGame()

onMounted(() => {
  init()
  document.documentElement.setAttribute('data-theme', theme.value)
})

watch(theme, (val) => {
  document.documentElement.setAttribute('data-theme', val)
})
</script>

<template>
  <header class="container-logo">
    <img src="/logo.svg" alt="Logo" />
    <button class="theme-toggle" @click="toggleTheme" aria-label="Cambiar tema">
      {{ theme === 'light' ? '☀️' : '🌙' }}
    </button>
  </header>

  <main>
    <HomePage v-if="currentPage === 'home'" @start="(d) => startGame(d)" @new-word="currentPage = 'newWord'" />
    <GamePage v-else-if="currentPage === 'game'" @home="goHome" />
    <NewWordPage v-else-if="currentPage === 'newWord'" @home="goHome" @start="startGame" />
  </main>

  <footer class="footer">
    <p>Creado por DanyDev</p>
    <a href="https://linkedin.com/in/danilophx77" target="_blank">
      <img src="/iconoLinkedin.svg" alt="LinkedIn" />
    </a>
    <a href="https://github.com/danilophx77" target="_blank">
      <img src="/iconoGithub.svg" alt="GitHub" />
    </a>
  </footer>
</template>