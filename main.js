const btnStart = document.querySelector(".btn-start");
const btnNewWord = document.querySelector(".btn-newWord");
document.querySelector(".game-page").style.display = "none";
document.querySelector(".newWord-page").style.display = "none";
const btnNewGame = document.querySelector(".btn-newGame");
const btnDesist = document.querySelector(".btn-desist");
const btnSave = document.querySelector(".btn__save");
const btnCancel = document.querySelector(".btn__cancel");
const openModal = document.querySelector(".modal__win");
const openModalEnd = document.querySelector(".modal__gameOver");
const closeModal = document.querySelector(".modal__close");
const closeModalEnd = document.querySelector(".modal__close--end");

let words = [
  "Pelota",
  "horca",
  "Ahorcado",
  "Celular",
  "Frontend",
  "ALURA",
  "LATAM",
  "ECUADOR",
  "CHILE",
  "ORACLE",
  "REACT",
  "GITHUB",
  "GIT",
  "GOOGLE",
  "NETFLIX",
  "DISNEY",
  "YOUTUBE",
  "FACEBOOK",
];

btnStart.onclick = startGame;
btnNewWord.onclick = addnewWord;
btnNewGame.onclick = newGame;
btnDesist.onclick = desist;
btnSave.onclick = save;
btnCancel.onclick = cancel;

// Generar palabra aleatoria y cambiar a la seccion de juego
function randomWord() {
  const localRandom = Math.floor(Math.random() * newWords.length);
  const rWords = newWords[localRandom].toUpperCase();
  gameHorca.secretWord = rWords;
  draw(gameHorca);
}

function startGame() {
  document.querySelector(".home-page").style.display = "none";
  document.querySelector(".game-page").style.display = "block";
  newGame();
}

function addnewWord() {
  document.querySelector(".home-page").style.display = "none";
  document.querySelector(".newWord-page").style.display = "block";
}

// Restablecer el juego
function newGame() {
  randomWord();
  gameHorca.state = 8;
  gameHorca.guessed = [];
  gameHorca.wrong = [];
  draw(gameHorca);
}

function desist() {
  document.querySelector(".home-page").style.display = "block";
  document.querySelector(".game-page").style.display = "none";
}

localStorage.setItem("myNewWords", JSON.stringify(words));
let newWords = JSON.parse(localStorage.getItem("myNewWords"));
function getNewWord() {
  let inputWord = document.getElementById("newWord__text").value;
  if (
    /^[A-zÑñ]*$/.test(inputWord) &&
    inputWord.length > 1 &&
    inputWord.length <= 8
  ) {
    console.log(inputWord);
    newWords.push(inputWord);
    localStorage.setItem("myNewWords", JSON.stringify(newWords));
    document.getElementById("newWord__text").value = "";
  }
}
function save() {
  document.querySelector(".home-page").style.display = "block";
  document.querySelector(".newWord-page").style.display = "none";
  getNewWord();
}
function cancel() {
  document.querySelector(".home-page").style.display = "block";
  document.querySelector(".newWord-page").style.display = "none";
}