// Constants
const BUTTON_COLORS = ["red", "blue", "green", "yellow"];
const DELAY_TIMES = {
  sequence: 1000,
  flash: 100,
  gameOver: 200,
};

// Game state
const gameState = {
  pattern: [],
  userPattern: [],
  started: false,
  level: 0,
};

// Cache DOM elements
const $levelTitle = $("#level-title");
const $buttons = $(".btn");
const $body = $("body");

// Event handlers
$(document).keypress(() => {
  if (!gameState.started) {
    startGame();
  }
});

$buttons.click(function () {
  if (!gameState.started) return;

  const userColor = $(this).attr("id");
  handleUserInput(userColor);
});

// Game logic
function handleUserInput(color) {
  gameState.userPattern.push(color);
  playSound(color);
  animatePress(color);
  checkAnswer(gameState.userPattern.length - 1);
}

function checkAnswer(currentLevel) {
  const isCorrect =
    gameState.pattern[currentLevel] === gameState.userPattern[currentLevel];

  if (!isCorrect) {
    handleGameOver();
    return;
  }

  if (gameState.userPattern.length === gameState.pattern.length) {
    setTimeout(nextSequence, DELAY_TIMES.sequence);
  }
}

function nextSequence() {
  gameState.userPattern = [];
  gameState.level++;
  $levelTitle.text(`Level ${gameState.level}`);

  const randomColor =
    BUTTON_COLORS[Math.floor(Math.random() * BUTTON_COLORS.length)];
  gameState.pattern.push(randomColor);

  $(`#${randomColor}`)
    .fadeIn(DELAY_TIMES.flash)
    .fadeOut(DELAY_TIMES.flash)
    .fadeIn(DELAY_TIMES.flash);
  playSound(randomColor);
}

function handleGameOver() {
  playSound("wrong");
  $body.addClass("game-over");
  $levelTitle.text("Game Over, Press Any Key to Restart");

  setTimeout(() => {
    $body.removeClass("game-over");
  }, DELAY_TIMES.gameOver);

  startOver();
}

// UI and Audio
function animatePress(color) {
  const $button = $(`#${color}`);
  $button.addClass("pressed");
  setTimeout(() => $button.removeClass("pressed"), DELAY_TIMES.flash);
}

function playSound(name) {
  new Audio(`sounds/${name}.mp3`).play();
}

// Game state management
function startGame() {
  gameState.started = true;
  gameState.level = 0;
  $levelTitle.text(`Level ${gameState.level}`);
  nextSequence();
}

function startOver() {
  Object.assign(gameState, {
    pattern: [],
    userPattern: [],
    started: false,
    level: 0,
  });
}
