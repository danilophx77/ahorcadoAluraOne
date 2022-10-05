let gameHorca = {
    state: 8,
    guessed: [],
    wrong: [],
    secretWord: "",
  };
  
  let $html = {
    ahorcado: document.getElementById("ahorcado"),
    guessed: document.querySelector(".guessed-words"),
    wrong: document.querySelector(".wrong-words"),
  };
  
  function draw(gameHorca) {
    // Actualizar imagen del ahorcado
    let $elem;
    $elem = $html.ahorcado;
  
    let state = gameHorca.state;
    if (state === 9) {
      state = gameHorca.previus;
    }
    $elem.src = "img/ahorcado0" + state + ".png";
    // Crear letras adivinadas
    $elem = $html.guessed;
    let guessed = gameHorca.guessed;
    let secretWord = gameHorca.secretWord;
    $elem.innerHTML = "";
    for (let i = 0; i < secretWord.length; i++) {
      let $span = document.createElement("span");
      let $text = document.createTextNode("");
      if (guessed.indexOf(secretWord[i]) >= 0) {
        $text.nodeValue = secretWord[i];
      }
      $span.setAttribute("class", "word guessed");
      $span.appendChild($text);
      $elem.appendChild($span);
    }
    // Crear letras equivocadas
    let wrong = gameHorca.wrong;
    $elem = $html.wrong;
    $elem.innerHTML = "";
    for (let i = 0; i < wrong.length; i++) {
      $span = document.createElement("span");
      $text = document.createTextNode(wrong[i]);
      $span.setAttribute("class", "word wrong");
      $span.appendChild($text);
      $elem.appendChild($span);
    }
  }
  
  function guess(gameHorca, letter) {
    let state = gameHorca.state;
    let secretWord = gameHorca.secretWord;
    if (state === 1 || state === 9) {
      return;
    }
  
    // Actualizar estado
  
    let guessed = gameHorca.guessed;
    let wrong = gameHorca.wrong;
    if (guessed.indexOf(letter) >= 0 || wrong.indexOf(letter) >= 0) {
      return;
    }
  
    if (secretWord.indexOf(letter) >= 0) {
      let win = true;
      for (let i = 0; i < secretWord.length; i++) {
        if (guessed.indexOf(secretWord[i]) < 0 && secretWord[i] != letter) {
          win = false;
          gameHorca.previus = gameHorca.state;
          break;
        }
      }
      if (win) {
        gameHorca.state = 9;
      }
      guessed.push(letter);
    } else {
      gameHorca.state--;
      wrong.push(letter);
    }
  }
  
  // Obtener letras de input
  
  function guessLetter(texto) {
    document.getElementById("words").texto;
    let text = texto.charAt(texto.length - 1);
    text = text.toUpperCase();
    if (/^[A-zÑñ]*$/.test(text)) {
      guess(gameHorca, text);
      draw(gameHorca);
    }
  
    // Mostrar ganado o perdido
    let state = gameHorca.state;
    if (state === 9) {
      winAlert();
      newGame();
      document.getElementById("words").value = "";
    } else if (state === 1) {
      gameOver();
      newGame();
      document.getElementById("words").value = "";
    }
  }
  
  // Obtener letra presionada en el teclado
  
  window.onkeypress = function guessLetter(e) {
    let letter = e.key;
    letter = letter.toUpperCase();
    if (/^[A-zÑñ]*$/.test(letter)) {
      // console.log(letter);
      guess(gameHorca, letter);
      draw(gameHorca);
    }
    let state = gameHorca.state;
    if (state === 9) {
      winAlert();
      newGame();
    } else if (state === 1) {
      gameOver();
      newGame();
    }
  };
  
  function winAlert() {
    openModal.classList.add("modal__win--show");
  }
  
  function gameOver() {
    openModalEnd.classList.add("modal__gameOver--show");
    let end = document.getElementById("end");
    end.innerText = "La palabra era " + gameHorca.secretWord;
  }
  
  closeModal.addEventListener("click", (e) => {
    e.preventDefault();
    openModal.classList.remove("modal__win--show");
  });
  
  closeModalEnd.addEventListener("click", (e) => {
    e.preventDefault();
    openModalEnd.classList.remove("modal__gameOver--show");
  });