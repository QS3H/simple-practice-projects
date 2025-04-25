// --- Tic Tac Toe Modernized ---
// Features: PvP, AI (easy/hard), scoreboard, sound, animations, mobile, player names

// --- Particle Background ---
(function particleBackground() {
  const canvas = document.getElementById('particle-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = window.innerWidth, h = window.innerHeight;
  let particles = [];
  const PARTICLE_COUNT = Math.floor((w * h) / 3500);
  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    particles = Array.from({length: PARTICLE_COUNT}, () => createParticle());
  }
  function createParticle() {
    const angle = Math.random() * 2 * Math.PI;
    const speed = 0.3 + Math.random() * 0.7;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.2 + Math.random() * 2.3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      a: 0.22 + Math.random() * 0.18,
      color: `hsla(${Math.floor(Math.random()*360)},80%,60%,0.65)`
    };
  }
  function draw() {
    ctx.clearRect(0,0,w,h);
    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.a;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      p.x += p.vx; p.y += p.vy;
      // Wrap around
      if (p.x < -p.r) p.x = w + p.r;
      if (p.x > w + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = h + p.r;
      if (p.y > h + p.r) p.y = -p.r;
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// --- Audio Unlock for Autoplay Policy ---
(function unlockAudioOnUserGesture() {
  let unlocked = false;
  function unlock() {
    if (unlocked) return;
    const audios = [
      document.getElementById("moveSound"),
      document.getElementById("winSound"),
      document.getElementById("drawSound"),
      document.getElementById("errorSound")
    ];
    audios.forEach(audio => {
      if (audio) {
        audio.muted = false;
        audio.volume = 1;
        // Play and pause immediately to unlock
        try {
          audio.play().then(() => audio.pause()).catch(()=>{});
        } catch(e) {}
      }
    });
    unlocked = true;
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  }
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
})();

// --- Tic Tac Toe code below ---

const boardIds = [null, ...Array(9).fill().map((_, i) => `item${i+1}`)];
let board = Array(10).fill("");
let turn = "X";
let running = true;
let mode = "pvp";
let playerNames = { X: "Player 1", O: "Player 2" };
let scores = { X: 0, O: 0, D: 0 };

const statusDiv = document.getElementById("status");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");
const modeSelect = document.getElementById("modeSelect");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const restartBtn = document.getElementById("restartBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");
const confettiCanvas = document.getElementById("confettiCanvas");
const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");
const errorSound = document.getElementById("errorSound");

function loadScores() {
  const saved = JSON.parse(localStorage.getItem("ttt_scores_v2") || "{}" );
  if (saved.X) scores.X = saved.X;
  if (saved.O) scores.O = saved.O;
  if (saved.D) scores.D = saved.D;
  updateScoreboard();
}

function saveScores() {
  localStorage.setItem("ttt_scores_v2", JSON.stringify(scores));
}

function updateScoreboard() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.D;
}

function updateNames() {
  playerNames.X = player1Input.value.trim() || "Player 1";
  playerNames.O = player2Input.value.trim() || (mode === "pvp" ? "Player 2" : "Computer");
}

function setStatus(msg) {
  statusDiv.textContent = msg;
}

function clearBoard() {
  board = Array(10).fill("");
  for (let i = 1; i <= 9; i++) {
    const sq = document.getElementById(boardIds[i]);
    sq.textContent = "";
    sq.classList.remove("active");
    sq.style.pointerEvents = "auto";
  }
  running = true;
  turn = "X";
  setStatus(`${playerNames[turn]}'s Turn (${turn})`);
}

function resetScoreboard() {
  scores = { X: 0, O: 0, D: 0 };
  saveScores();
  updateScoreboard();
}

function playSound(sound) {
  if (!sound) return;
  try {
    sound.muted = false;
    sound.volume = 1;
    sound.currentTime = 0;
    sound.play();
  } catch (e) {
    // Optionally log: console.warn('Audio play error', e);
  }
}

function highlightWin(winCombo) {
  winCombo.forEach(idx => {
    document.getElementById(boardIds[idx]).classList.add("active");
  });
}

function winAnimation() {
  confettiCanvas.style.display = "block";
  runConfetti();
  setTimeout(() => { confettiCanvas.style.display = "none"; }, 2000);
}

// --- Confetti Animation ---
function runConfetti() {
  const ctx = confettiCanvas.getContext("2d");
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  let pieces = Array.from({length: 120}, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - 50,
    r: Math.random() * 6 + 4,
    c: `hsl(${Math.random()*360},80%,60%)`,
    v: Math.random()*2+2,
    s: Math.random()*2-1
  }));
  let t = 0;
  function draw() {
    ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    for (let p of pieces) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2*Math.PI);
      ctx.fillStyle = p.c;
      ctx.fill();
      p.x += p.s;
      p.y += p.v;
      if (p.y > confettiCanvas.height) p.y = -10;
      if (p.x > confettiCanvas.width) p.x = 0;
      if (p.x < 0) p.x = confettiCanvas.width;
    }
    t++;
    if (t < 70) requestAnimationFrame(draw);
  }
  draw();
}

function checkWinDraw() {
  const wins = [
    [1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]
  ];
  for (let combo of wins) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      running = false;
      highlightWin(combo);
      playSound(winSound);
      setStatus(`${playerNames[board[a]]} Wins! (${board[a]})`);
      scores[board[a]]++;
      saveScores();
      updateScoreboard();
      winAnimation();
      return true;
    }
  }
  if (board.slice(1).every(cell => cell)) {
    running = false;
    playSound(drawSound);
    setStatus("Draw!");
    scores.D++;
    saveScores();
    updateScoreboard();
    return true;
  }
  return false;
}

function aiMoveEasy() {
  // Random empty cell
  let empties = [];
  for (let i = 1; i <= 9; i++) if (!board[i]) empties.push(i);
  if (empties.length) {
    let idx = empties[Math.floor(Math.random()*empties.length)];
    makeMove(idx, "O");
  }
}

function aiMoveHard() {
  // Minimax for unbeatable AI
  let bestScore = -Infinity;
  let move = null;
  for (let i = 1; i <= 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  if (move) makeMove(move, "O");
}

function minimax(bd, depth, isMax) {
  const wins = [
    [1,2,3],[4,5,6],[7,8,9],[1,4,7],[2,5,8],[3,6,9],[1,5,9],[3,5,7]
  ];
  for (let combo of wins) {
    const [a,b,c] = combo;
    if (bd[a] && bd[a] === bd[b] && bd[b] === bd[c]) {
      if (bd[a] === "O") return 10 - depth;
      if (bd[a] === "X") return depth - 10;
    }
  }
  if (bd.slice(1).every(cell => cell)) return 0;
  if (isMax) {
    let best = -Infinity;
    for (let i = 1; i <= 9; i++) {
      if (!bd[i]) {
        bd[i] = "O";
        best = Math.max(best, minimax(bd, depth+1, false));
        bd[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 1; i <= 9; i++) {
      if (!bd[i]) {
        bd[i] = "X";
        best = Math.min(best, minimax(bd, depth+1, true));
        bd[i] = "";
      }
    }
    return best;
  }
}

function makeMove(idx, player) {
  if (!running || board[idx]) {
    playSound(errorSound);
    return;
  }
  board[idx] = player;
  document.getElementById(boardIds[idx]).textContent = player;
  playSound(moveSound);
  if (checkWinDraw()) {
    // End
    for (let i = 1; i <= 9; i++) {
      document.getElementById(boardIds[i]).style.pointerEvents = "none";
    }
    return;
  }
  turn = turn === "X" ? "O" : "X";
  setStatus(`${playerNames[turn]}'s Turn (${turn})`);
  if (mode !== "pvp" && running && turn === "O") {
    setTimeout(() => {
      if (mode === "easy") aiMoveEasy();
      else aiMoveHard();
      // After AI move, check win/draw again
      if (checkWinDraw()) {
        for (let i = 1; i <= 9; i++) {
          document.getElementById(boardIds[i]).style.pointerEvents = "none";
        }
      } else {
        turn = "X";
        setStatus(`${playerNames[turn]}'s Turn (${turn})`);
      }
    }, 420);
  }
}

function handleSqrClick(e) {
  const idx = Number(e.target.dataset.index);
  if (mode === "pvp" || turn === "X") makeMove(idx, turn);
}

function setupBoard() {
  for (let i = 1; i <= 9; i++) {
    const sq = document.getElementById(boardIds[i]);
    sq.addEventListener("click", handleSqrClick);
    sq.textContent = "";
    sq.classList.remove("active");
    sq.style.pointerEvents = "auto";
  }
}

function onModeChange() {
  mode = modeSelect.value;
  player2Input.disabled = mode !== "pvp";
  player2Input.value = mode === "pvp" ? playerNames.O : "Computer";
  updateNames();
  clearBoard();
}

function onNameInput() {
  updateNames();
  setStatus(`${playerNames[turn]}'s Turn (${turn})`);
}

function onRestart() {
  clearBoard();
}

function onResetScore() {
  resetScoreboard();
  clearBoard();
}

// --- Initialization ---
window.addEventListener("DOMContentLoaded", () => {
  loadScores();
  setupBoard();
  updateNames();
  setStatus(`${playerNames[turn]}'s Turn (${turn})`);
  modeSelect.addEventListener("change", onModeChange);
  player1Input.addEventListener("input", onNameInput);
  player2Input.addEventListener("input", onNameInput);
  restartBtn.addEventListener("click", onRestart);
  resetScoreBtn.addEventListener("click", onResetScore);
  player2Input.disabled = false;
  player1Input.value = playerNames.X;
  player2Input.value = playerNames.O;
  window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });
});
