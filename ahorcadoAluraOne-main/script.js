function draw(state) {
  updateHangmanImage(state);
  renderGuessedLetters(state);
  renderWrongLetters(state);
  updateKeyboardState(state);
  ui.wordHint.textContent = `Palabra de ${state.secretWord.length} letras`;
  ui.livesLeft.textContent = Math.max(state.state - 1, 0);
  ui.letterInput.disabled = state.status !== "playing";
  updateStatsUI();
  updateHintButton();
}

function updateHangmanImage(state) {
  let imageIndex = state.state;
  if (imageIndex < 1) {
    imageIndex = 1;
  }
  if (imageIndex > 8) {
    imageIndex = 8;
  }
  ui.ahorcado = ui.ahorcado || document.getElementById("ahorcado");
  ui.ahorcado.src = `img/ahorcado0${imageIndex}.png`;
}

function renderGuessedLetters(state) {
  ui.guessed = ui.guessed || document.querySelector(".guessed-words");
  ui.guessed.innerHTML = "";
  state.secretWord.split("").forEach((letter) => {
    const span = document.createElement("span");
    span.className = "word guessed";
    span.textContent = state.guessed.has(letter) ? letter : "";
    ui.guessed.appendChild(span);
  });
}

function renderWrongLetters(state) {
  ui.wrong = ui.wrong || document.querySelector(".wrong-words");
  ui.wrong.innerHTML = "";
  [...state.wrong].forEach((letter) => {
    const span = document.createElement("span");
    span.className = "word wrong";
    span.textContent = letter;
    ui.wrong.appendChild(span);
  });
}

function updateKeyboardState(state) {
  const keys = ui.keyboard.querySelectorAll(".key");
  keys.forEach((btn) => {
    const letter = btn.dataset.letter;
    btn.classList.remove("is-hit", "is-miss", "is-disabled");
    if (state.guessed.has(letter)) {
      btn.classList.add("is-hit", "is-disabled");
    } else if (state.wrong.has(letter)) {
      btn.classList.add("is-miss", "is-disabled");
    }
    if (state.status !== "playing") {
      btn.classList.add("is-disabled");
    }
  });
}

function handleGuess(input) {
  if (gameState.status !== "playing") {
    return;
  }
  const letter = normalizeWord(input).charAt(0);
  if (!letter || !/^[A-ZÑ]$/.test(letter)) {
    return;
  }
  if (gameState.guessed.has(letter) || gameState.wrong.has(letter)) {
    return;
  }

  if (gameState.secretWord.includes(letter)) {
    gameState.guessed.add(letter);
  } else {
    if (gameState.state > 1) {
      gameState.state -= 1;
    }
    gameState.wrong.add(letter);
  }

  draw(gameState);
  checkGameEnd();
}

function checkGameEnd() {
  if (gameState.state <= 1) {
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
  if (gameState.status !== "playing") {
    return;
  }
  gameState.status = "over";
  stopTimer();

  stats.games += 1;
  if (won) {
    stats.wins += 1;
    stats.streak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    if (!stats.bestTime || elapsed < stats.bestTime) {
      stats.bestTime = elapsed;
    }
    ui.modalWinText.textContent = `Ganaste en ${formatTime(elapsed)}.`;
    ui.modalWin.classList.add("modal__win--show");
  } else {
    stats.losses += 1;
    stats.streak = 0;
    ui.modalLoseText.textContent = `La palabra era ${gameState.secretWord}`;
    ui.modalLose.classList.add("modal__gameOver--show");
  }

  saveStats();
  updateStatsUI();
  updateKeyboardState(gameState);
  updateHintButton();
}
