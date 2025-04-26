const DEFAULT_MAX = 120;
const DEFAULT_LANG = 'en';
const LANGUAGES = {
  en: {
    title: 'Real-Time Character Counter',
    floatingLabel: 'Please write your text here...',
    maxLength: 'Max Length',
    language: 'Language',
    totalChars: 'Total Characters:',
    remaining: 'Remaining:',
    words: 'Words:',
    sentences: 'Sentences:',
    paragraphs: 'Paragraphs:',
    avgWord: 'Avg. Word Length:',
    longestWord: 'Longest Word:',
    readingTime: 'Reading Time:',
    copy: 'Copy',
    undo: 'Undo',
    redo: 'Redo',
    download: 'Download',
    copied: '✅ Copied!',
    downloadFile: 'character-count.txt',
  },
  es: {
    title: 'Contador de Caracteres en Tiempo Real',
    floatingLabel: 'Por favor, escribe tu texto aquí...',
    maxLength: 'Máx. Longitud',
    language: 'Idioma',
    totalChars: 'Total de Caracteres:',
    remaining: 'Restante:',
    words: 'Palabras:',
    sentences: 'Oraciones:',
    paragraphs: 'Párrafos:',
    avgWord: 'Longitud Media de Palabra:',
    longestWord: 'Palabra Más Larga:',
    readingTime: 'Tiempo de Lectura:',
    copy: 'Copiar',
    undo: 'Deshacer',
    redo: 'Rehacer',
    download: 'Descargar',
    copied: '✅ ¡Copiado!',
    downloadFile: 'contador-caracteres.txt',
  },
  fr: {
    title: 'Compteur de Caractères en Temps Réel',
    floatingLabel: 'Veuillez écrire votre texte ici...',
    maxLength: 'Longueur Max',
    language: 'Langue',
    totalChars: 'Nombre Total de Caractères:',
    remaining: 'Restant:',
    words: 'Mots:',
    sentences: 'Phrases:',
    paragraphs: 'Paragraphes:',
    avgWord: 'Longueur Moyenne de Mot:',
    longestWord: 'Mot le Plus Long:',
    readingTime: 'Temps de Lecture:',
    copy: 'Copier',
    undo: 'Annuler',
    redo: 'Rétablir',
    download: 'Télécharger',
    copied: '✅ Copié!',
    downloadFile: 'compteur-caracteres.txt',
  },
  de: {
    title: 'Zeichen-Zähler in Echtzeit',
    floatingLabel: 'Bitte geben Sie hier Ihren Text ein...',
    maxLength: 'Maximale Länge',
    language: 'Sprache',
    totalChars: 'Zeichen insgesamt:',
    remaining: 'Verbleibend:',
    words: 'Wörter:',
    sentences: 'Sätze:',
    paragraphs: 'Absätze:',
    avgWord: 'Durchschn. Wortlänge:',
    longestWord: 'Längstes Wort:',
    readingTime: 'Lesezeit:',
    copy: 'Kopieren',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    download: 'Herunterladen',
    copied: '✅ Kopiert!',
    downloadFile: 'zeichen-zaehler.txt',
  },
  ar: {
    title: 'عداد الأحرف الفوري',
    floatingLabel: 'يرجى كتابة نصك هنا...',
    maxLength: 'الحد الأقصى للطول',
    language: 'اللغة',
    totalChars: 'إجمالي الأحرف:',
    remaining: 'المتبقي:',
    words: 'كلمات:',
    sentences: 'جمل:',
    paragraphs: 'فقرات:',
    avgWord: 'متوسط طول الكلمة:',
    longestWord: 'أطول كلمة:',
    readingTime: 'وقت القراءة:',
    copy: 'نسخ',
    undo: 'تراجع',
    redo: 'إعادة',
    download: 'تنزيل',
    copied: '✅ تم النسخ!',
    downloadFile: 'عداد-الأحرف.txt',
  }
};

class CharacterCounter {
  constructor() {
    // Elements
    this.textArea = document.getElementById("textarea");
    this.floatingLabel = document.getElementById("floating-label");
    this.totalChars = document.getElementById("total-characters");
    this.remainingChars = document.getElementById("remaining-characters");
    this.wordCount = document.getElementById("word-count");
    this.sentenceCount = document.getElementById("sentence-count");
    this.paragraphCount = document.getElementById("paragraph-count");
    this.progressBar = document.getElementById("progress-bar");
    this.copyBtn = document.getElementById("copy-btn");
    this.undoBtn = document.getElementById("undo-btn");
    this.redoBtn = document.getElementById("redo-btn");
    this.downloadBtn = document.getElementById("download-btn");
    this.themeSwitch = document.getElementById("theme-switch");
    this.maxLengthInput = document.getElementById("max-length");
    this.languageSelect = document.getElementById("language");
    this.avgWordLength = document.getElementById("avg-word-length");
    this.longestWord = document.getElementById("longest-word");
    this.readingTime = document.getElementById("reading-time");
    this.confetti = document.getElementById("confetti");
    // Stats labels
    this.labels = {
      statCharacters: document.getElementById("stat-characters-label"),
      statRemaining: document.getElementById("stat-remaining-label"),
      statWords: document.getElementById("stat-words-label"),
      statSentences: document.getElementById("stat-sentences-label"),
      statParagraphs: document.getElementById("stat-paragraphs-label"),
      statAvgWord: document.getElementById("stat-avgword-label"),
      statLongestWord: document.getElementById("stat-longestword-label"),
      statReadTime: document.getElementById("stat-readtime-label")
    };
    // Undo/redo stacks
    this.undoStack = [];
    this.redoStack = [];
    // State
    this.maxLength = DEFAULT_MAX;
    this.language = DEFAULT_LANG;
    // Init
    this.initTheme();
    this.loadSettings();
    this.initializeEventListeners();
    this.restoreDraft();
    this.updateAll();
  }

  initializeEventListeners() {
    this.textArea.addEventListener("input", (e) => this.onInput(e));
    this.textArea.addEventListener("keydown", (e) => this.onKeyDown(e));
    this.copyBtn.addEventListener("click", () => this.copyToClipboard());
    this.undoBtn.addEventListener("click", () => this.undo());
    this.redoBtn.addEventListener("click", () => this.redo());
    this.downloadBtn.addEventListener("click", () => this.downloadTxt());
    this.themeSwitch.addEventListener("change", () => this.toggleTheme());
    this.maxLengthInput.addEventListener("input", () => this.onMaxLengthChange());
    this.languageSelect.addEventListener("change", () => this.onLanguageChange());
    this.textArea.addEventListener("focus", () => this.floatingLabel.classList.add('active'));
    this.textArea.addEventListener("blur", () => {
      if (!this.textArea.value) this.floatingLabel.classList.remove('active');
    });
    window.addEventListener("beforeunload", () => this.saveDraft());
  }

  // --- Input and stats ---
  onInput(e) {
    this.pushUndo();
    this.redoStack = [];
    this.updateAll();
    this.saveDraft();
    // Confetti if exact limit
    if (this.textArea.value.length === this.maxLength) {
      this.launchConfetti();
    }
  }

  onKeyDown(e) {
    // Accessibility: Ctrl+Z/Y for undo/redo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      this.undo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
      e.preventDefault();
      this.redo();
    }
  }

  updateAll() {
    const value = this.textArea.value;
    const total = value.length;
    const remaining = this.maxLength - total;
    const wordsArr = value.trim() ? value.trim().split(/\s+/) : [];
    const words = wordsArr.length;
    const sentences = value.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = value.split(/\n{2,}/).filter(p => p.trim().length > 0).length;
    const avgWord = words ? (wordsArr.reduce((a, b) => a + b.length, 0) / words).toFixed(2) : 0;
    const longest = words ? wordsArr.reduce((a, b) => a.length > b.length ? a : b, '') : '-';
    const readingTimeSec = Math.ceil(words / 3.3); // ~200wpm

    this.totalChars.textContent = total;
    this.remainingChars.textContent = remaining;
    this.wordCount.textContent = words;
    this.sentenceCount.textContent = sentences;
    this.paragraphCount.textContent = paragraphs;
    this.avgWordLength.textContent = avgWord;
    this.longestWord.textContent = longest;
    this.readingTime.textContent = readingTimeSec + 's';

    // Progress bar and limit
    let percent = Math.min((total / this.maxLength) * 100, 100);
    this.progressBar.style.width = percent + "%";
    if (total >= this.maxLength) {
      this.progressBar.classList.add("limit");
      this.textArea.classList.add("exceed");
    } else {
      this.progressBar.classList.remove("limit");
      this.textArea.classList.remove("exceed");
    }
  }

  // --- Undo/Redo ---
  pushUndo() {
    this.undoStack.push(this.textArea.value);
    if (this.undoStack.length > 100) this.undoStack.shift();
  }
  undo() {
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop());
      this.textArea.value = this.undoStack[this.undoStack.length - 1];
      this.updateAll();
    }
  }
  redo() {
    if (this.redoStack.length) {
      this.textArea.value = this.redoStack.pop();
      this.pushUndo();
      this.updateAll();
    }
  }

  // --- Download ---
  downloadTxt() {
    const blob = new Blob([this.textArea.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = LANGUAGES[this.language].downloadFile;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // --- Copy ---
  copyToClipboard() {
    this.textArea.select();
    document.execCommand("copy");
    this.copyBtn.classList.add("copied");
    this.copyBtn.innerHTML = `<span>${LANGUAGES[this.language].copied}</span>`;
    setTimeout(() => {
      this.copyBtn.classList.remove("copied");
      this.copyBtn.innerHTML = '<span>📋</span>';
    }, 1200);
  }

  // --- Max length ---
  onMaxLengthChange() {
    let val = parseInt(this.maxLengthInput.value);
    if (isNaN(val) || val < 10) val = 10;
    if (val > 1000) val = 1000;
    this.maxLength = val;
    this.textArea.maxLength = val;
    this.updateAll();
    this.saveSettings();
  }

  // --- Language ---
  onLanguageChange() {
    this.language = this.languageSelect.value;
    this.applyLanguage();
    this.saveSettings();
  }
  applyLanguage() {
    const lang = LANGUAGES[this.language];
    document.title = lang.title;
    this.floatingLabel.textContent = lang.floatingLabel;
    this.maxLengthInput.previousElementSibling.textContent = lang.maxLength;
    this.languageSelect.previousElementSibling.textContent = lang.language;
    this.labels.statCharacters.textContent = lang.totalChars;
    this.labels.statRemaining.textContent = lang.remaining;
    this.labels.statWords.textContent = lang.words;
    this.labels.statSentences.textContent = lang.sentences;
    this.labels.statParagraphs.textContent = lang.paragraphs;
    this.labels.statAvgWord.textContent = lang.avgWord;
    this.labels.statLongestWord.textContent = lang.longestWord;
    this.labels.statReadTime.textContent = lang.readingTime;
    this.copyBtn.setAttribute('aria-label', lang.copy);
    this.undoBtn.setAttribute('aria-label', lang.undo);
    this.redoBtn.setAttribute('aria-label', lang.redo);
    this.downloadBtn.setAttribute('aria-label', lang.download);
  }

  // --- Theme ---
  initTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem("charCounterTheme");
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.body.classList.add("dark");
      this.themeSwitch.checked = true;
    } else {
      document.body.classList.remove("dark");
      this.themeSwitch.checked = false;
    }
  }
  toggleTheme() {
    if (this.themeSwitch.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("charCounterTheme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("charCounterTheme", "light");
    }
  }

  // --- Auto-save/restore draft ---
  saveDraft() {
    localStorage.setItem("charCounterDraft", this.textArea.value);
  }
  restoreDraft() {
    const draft = localStorage.getItem("charCounterDraft");
    if (draft) {
      this.textArea.value = draft;
    }
  }
  loadSettings() {
    // Max length
    const savedMax = localStorage.getItem("charCounterMax");
    if (savedMax) {
      this.maxLength = parseInt(savedMax);
      this.maxLengthInput.value = this.maxLength;
      this.textArea.maxLength = this.maxLength;
    }
    // Language
    const savedLang = localStorage.getItem("charCounterLang");
    if (savedLang) {
      this.language = savedLang;
      this.languageSelect.value = this.language;
    }
    this.applyLanguage();
  }
  saveSettings() {
    localStorage.setItem("charCounterMax", this.maxLength);
    localStorage.setItem("charCounterLang", this.language);
  }

  // --- Confetti ---
  launchConfetti() {
    this.confetti.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = Math.random() * 60 + 10 + 'vh';
      el.style.background = `hsl(${Math.random()*360},90%,60%)`;
      el.style.transform = `rotate(${Math.random()*360}deg)`;
      el.style.animation = `fall ${1.5 + Math.random()}s ease-out forwards`;
      this.confetti.appendChild(el);
    }
    setTimeout(() => { this.confetti.innerHTML = ''; }, 2000);
  }
}

// Confetti animation
const style = document.createElement('style');
style.innerHTML = `@keyframes fall { 0% { opacity:1; transform:translateY(0);} 100% { opacity:0; transform:translateY(60vh);} }`;
document.head.appendChild(style);

// Initialize the counter when the DOM is loaded

document.addEventListener("DOMContentLoaded", () => {
  new CharacterCounter();
});
