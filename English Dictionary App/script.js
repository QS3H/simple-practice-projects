// Modern English Dictionary App JS
const inputEl = document.getElementById("input");
const infoTextEl = document.getElementById("info-text");
const titleEl = document.getElementById("title");
const meaningEl = document.getElementById("meaning");
const meaningContainerEl = document.getElementById("meaning-container");
const audioEl = document.getElementById("audio");
const phoneticEl = document.getElementById("phonetic");
const exampleEl = document.getElementById("example");
const synonymsEl = document.getElementById("synonyms");
const antonymsEl = document.getElementById("antonyms");
const autocompleteList = document.getElementById("autocomplete-list");
const favoriteBtn = document.getElementById("favorite-btn");
const historyList = document.getElementById("history-list");
const favoritesList = document.getElementById("favorites-list");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

let debounceTimeout;
let recentHistory = [];
let favorites = [];
let lastSearched = "";

// --- Theme Switcher ---
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('dictionary-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(current === 'light' ? 'dark' : 'light');
}
themeToggle.addEventListener('click', toggleTheme);
(function initTheme() {
  const stored = localStorage.getItem('dictionary-theme');
  setTheme(stored === 'dark' ? 'dark' : 'light');
})();

// --- Autocomplete ---
async function fetchSuggestions(query) {
  if (!query) return [];
  // Using Datamuse API for suggestions
  const url = `https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=8`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.map(item => item.word);
  } catch {
    return [];
  }
}
function showAutocomplete(suggestions) {
  autocompleteList.innerHTML = '';
  if (!suggestions.length) {
    autocompleteList.classList.remove('active');
    return;
  }
  suggestions.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    li.onclick = () => {
      inputEl.value = word;
      autocompleteList.classList.remove('active');
      fetchApi(word);
    };
    autocompleteList.appendChild(li);
  });
  autocompleteList.classList.add('active');
}
inputEl.addEventListener('input', async (e) => {
  clearTimeout(debounceTimeout);
  const val = e.target.value.trim();
  if (!val) {
    autocompleteList.classList.remove('active');
    return;
  }
  debounceTimeout = setTimeout(async () => {
    const suggestions = await fetchSuggestions(val);
    showAutocomplete(suggestions);
  }, 200);
});
inputEl.addEventListener('blur', () => setTimeout(()=>autocompleteList.classList.remove('active'), 100));

// --- Fetch & Display Word Data ---
async function fetchApi(word) {
  if (!word) return;
  lastSearched = word;
  infoTextEl.style.display = "block";
  meaningContainerEl.classList.remove('active');
  infoTextEl.innerText = `Searching the meaning of "${word}"...`;
  try {
    const api = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const result = await fetch(api).then((res) => res.json());
    if (result.title) {
      meaningContainerEl.classList.add('active');
      infoTextEl.style.display = "none";
      titleEl.innerText = word;
      meaningEl.innerText = "Not Available";
      phoneticEl.innerText = "-";
      exampleEl.innerText = "-";
      synonymsEl.innerText = "-";
      antonymsEl.innerText = "-";
      audioEl.style.display = "none";
    } else {
      infoTextEl.style.display = "none";
      meaningContainerEl.classList.add('active');
      titleEl.innerText = result[0].word || word;
      phoneticEl.innerText = result[0].phonetic || (result[0].phonetics && result[0].phonetics[0]?.text) || '-';
      meaningEl.innerText = result[0].meanings[0]?.definitions[0]?.definition || '-';
      exampleEl.innerText = result[0].meanings[0]?.definitions[0]?.example || '-';
      synonymsEl.innerText = (result[0].meanings[0]?.definitions[0]?.synonyms || []).join(', ') || '-';
      antonymsEl.innerText = (result[0].meanings[0]?.definitions[0]?.antonyms || []).join(', ') || '-';
      // Audio
      const audioSrc = (result[0].phonetics || []).find(p => p.audio)?.audio;
      if (audioSrc) {
        audioEl.src = audioSrc;
        audioEl.style.display = "inline-flex";
      } else {
        audioEl.style.display = "none";
      }
      // History
      addToHistory(word);
      updateFavoriteBtn();
    }
  } catch (error) {
    infoTextEl.innerText = `An error occurred. Please check your internet connection.`;
    meaningContainerEl.classList.remove('active');
  }
}
inputEl.addEventListener("keyup", (event) => {
  if (event.target.value && event.key === "Enter") {
    fetchApi(event.target.value.trim());
    autocompleteList.classList.remove('active');
  }
});

// --- History ---
function addToHistory(word) {
  if (!word) return;
  recentHistory = recentHistory.filter(w => w !== word);
  recentHistory.unshift(word);
  if (recentHistory.length > 10) recentHistory.pop();
  localStorage.setItem('dictionary-history', JSON.stringify(recentHistory));
  renderHistory();
}
function renderHistory() {
  historyList.innerHTML = '';
  recentHistory.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    li.onclick = (e) => {
      // Don't trigger fetch if remove icon is clicked
      if (e.target.classList.contains('remove-history')) return;
      fetchApi(word);
    };
    // Remove icon
    const removeBtn = document.createElement('span');
    removeBtn.textContent = '🗑️';
    removeBtn.className = 'remove-history';
    removeBtn.title = 'Remove from recent';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeFromHistory(word);
    };
    li.appendChild(removeBtn);
    historyList.appendChild(li);
  });
}
function removeFromHistory(word) {
  recentHistory = recentHistory.filter(w => w !== word);
  localStorage.setItem('dictionary-history', JSON.stringify(recentHistory));
  renderHistory();
}
function loadHistory() {
  try {
    recentHistory = JSON.parse(localStorage.getItem('dictionary-history')) || [];
    renderHistory();
  } catch { recentHistory = []; }
}

// --- Favorites ---
function addToFavorites(word) {
  if (!word) return;
  favorites = favorites.filter(w => w !== word);
  favorites.unshift(word);
  if (favorites.length > 20) favorites.pop();
  localStorage.setItem('dictionary-favorites', JSON.stringify(favorites));
  renderFavorites();
}
function removeFromFavorites(word) {
  favorites = favorites.filter(w => w !== word);
  localStorage.setItem('dictionary-favorites', JSON.stringify(favorites));
  renderFavorites();
}
function renderFavorites() {
  favoritesList.innerHTML = '';
  favorites.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    li.onclick = () => fetchApi(word);
    li.ondblclick = () => removeFromFavorites(word);
    favoritesList.appendChild(li);
  });
  updateFavoriteBtn();
}
function loadFavorites() {
  try {
    favorites = JSON.parse(localStorage.getItem('dictionary-favorites')) || [];
    renderFavorites();
  } catch { favorites = []; }
}
function updateFavoriteBtn() {
  if (favorites.includes(lastSearched)) {
    favoriteBtn.classList.add('active');
    favoriteBtn.textContent = '★';
  } else {
    favoriteBtn.classList.remove('active');
    favoriteBtn.textContent = '☆';
  }
}
favoriteBtn.addEventListener('click', () => {
  if (!lastSearched) return;
  if (favorites.includes(lastSearched)) {
    removeFromFavorites(lastSearched);
  } else {
    addToFavorites(lastSearched);
  }
  updateFavoriteBtn();
});

// --- Initial Load ---
window.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  loadFavorites();
});
