// --- UI Elements ---
const randomQuoteApi = "https://qapi.vercel.app/api/random";
const quoteElement = document.getElementById("quote");
const quoteInput = document.getElementById("input");
const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const progressBar = document.getElementById("progress");
const motivationalMsg = document.getElementById("motivational-message");
const usernameInput = document.getElementById("username");
const difficultySelect = document.getElementById("difficulty");
const startBtn = document.getElementById("start-btn");
const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardList = document.getElementById("leaderboard-list");
const showLeaderboardBtn = document.getElementById("show-leaderboard");
const closeLeaderboardBtn = document.getElementById("close-leaderboard");

// --- Game State ---
let startTime, timerInterval, correctChars, totalChars, finished, quoteText;
let gameActive = false;
let difficulty = 'medium';
let userName = '';

// --- Difficulty Settings ---
const difficultySettings = {
  easy: { min: 30, max: 60 },
  medium: { min: 61, max: 100 },
  hard: { min: 101, max: 200 }
};

// --- Event Listeners ---
startBtn.addEventListener("click", startGame);
difficultySelect.addEventListener("change", e => difficulty = e.target.value);
showLeaderboardBtn.addEventListener("click", showLeaderboard);
if (closeLeaderboardBtn) closeLeaderboardBtn.addEventListener("click", () => leaderboardModal.classList.remove('active'));

quoteInput.addEventListener("input", handleTyping);

function startGame() {
  userName = usernameInput.value.trim() || 'Anonymous';
  quoteInput.value = '';
  quoteInput.disabled = true;
  motivationalMsg.textContent = '';
  wpmElement.textContent = '0';
  accuracyElement.textContent = '100';
  progressBar.style.width = '0%';
  finished = false;
  gameActive = false;
  fetchAndRenderQuote();
}

async function fetchAndRenderQuote() {
  try {
    let quote = '';
    let lastFetched = '';
    let tries = 0;
    // Fetch quote matching difficulty
    while (tries < 20) {
      const res = await fetch(randomQuoteApi);
      const data = await res.json();
      if (data && data.quote) {
        lastFetched = data.quote;
        const len = data.quote.length;
        const { min, max } = difficultySettings[difficulty];
        if (len >= min && len <= max) {
          quote = data.quote;
          break;
        }
      }
      tries++;
    }
    if (!quote) {
      quote = lastFetched;
      motivationalMsg.textContent =
        'No long quotes found for hard mode. Showing a random quote instead.';
    } else {
      motivationalMsg.textContent = '';
    }
    if (!quote) throw new Error('Could not fetch suitable quote.');
    renderQuote(quote);
  } catch (error) {
    quoteElement.innerText = 'Failed to load quote. Please try again.';
    quoteInput.disabled = true;
  }
}

function renderQuote(quote) {
  quoteText = quote;
  quoteElement.innerHTML = '';
  quote.split("").forEach(char => {
    const charSpan = document.createElement("span");
    charSpan.innerText = char;
    quoteElement.appendChild(charSpan);
  });
  quoteInput.value = '';
  quoteInput.disabled = false;
  quoteInput.focus();
  correctChars = 0;
  totalChars = quote.length;
  finished = false;
  gameActive = true;
  progressBar.style.width = '0%';
  startTimer();
}

function handleTyping() {
  if (!gameActive) return;
  const quoteArray = quoteElement.querySelectorAll("span");
  const inputValue = quoteInput.value.split("");
  let correct = true, correctCount = 0;
  quoteArray.forEach((charSpan, idx) => {
    const char = inputValue[idx];
    if (char === undefined) {
      charSpan.classList.remove("correct", "incorrect");
      correct = false;
    } else if (char === charSpan.innerText) {
      charSpan.classList.add("correct");
      charSpan.classList.remove("incorrect");
      correctCount++;
    } else {
      charSpan.classList.remove("correct");
      charSpan.classList.add("incorrect");
      correct = false;
    }
  });
  correctChars = correctCount;
  updateStats();
  progressBar.style.width = `${(inputValue.length / totalChars) * 100}%`;
  if (inputValue.length === totalChars && correct) {
    endGame();
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerElement.textContent = '0';
  startTime = new Date();
  timerInterval = setInterval(() => {
    timerElement.textContent = getElapsedTime();
    updateStats();
  }, 200);
}

function getElapsedTime() {
  return Math.floor((new Date() - startTime) / 1000);
}

function updateStats() {
  const elapsed = (new Date() - startTime) / 1000;
  const wordsTyped = quoteInput.value.trim().split(/\s+/).length;
  const wpm = elapsed > 0 ? Math.round((wordsTyped / elapsed) * 60) : 0;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  wpmElement.textContent = isFinite(wpm) ? wpm : '0';
  accuracyElement.textContent = accuracy;
}

function endGame() {
  gameActive = false;
  finished = true;
  clearInterval(timerInterval);
  updateStats();
  quoteInput.disabled = true;
  // Save to leaderboard
  saveScore({
    name: userName,
    wpm: parseInt(wpmElement.textContent),
    accuracy: parseInt(accuracyElement.textContent),
    time: parseInt(timerElement.textContent),
    date: new Date().toLocaleDateString()
  });
  showMotivationalMessage();
}

function saveScore(score) {
  let scores = JSON.parse(localStorage.getItem('stg-leaderboard') || '[]');
  scores.push(score);
  scores = scores.sort((a, b) => b.wpm - a.wpm).slice(0, 10);
  localStorage.setItem('stg-leaderboard', JSON.stringify(scores));
}

function showLeaderboard() {
  let scores = JSON.parse(localStorage.getItem('stg-leaderboard') || '[]');
  leaderboardList.innerHTML = scores.length ? scores.map(s => `<li><b>${s.name}</b> - ${s.wpm} WPM, ${s.accuracy}% (${s.time}s)</li>`).join('') : '<li>No scores yet.</li>';
  leaderboardModal.classList.add('active');
}

function showMotivationalMessage() {
  const messages = [
    "Great job! Keep improving!",
    "You're getting faster!",
    "Awesome accuracy!",
    "Keep practicing!",
    "You're a typing star!",
    "Impressive! Try a harder level next!"
  ];
  const idx = Math.floor(Math.random() * messages.length);
  motivationalMsg.textContent = messages[idx];
}

// Start with the game disabled until user clicks Start
quoteInput.disabled = true;

// Optionally, auto-focus username field on load
window.onload = () => { usernameInput.focus(); };
