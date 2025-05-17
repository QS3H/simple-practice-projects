const notesContainer = document.querySelector(".notes-container");
const createBtn = document.querySelector(".create-btn");
const formatTools = document.querySelector(".formatting-tools");
const searchInput = document.getElementById("searchInput");
const darkModeToggle = document.getElementById("darkModeToggle");
let notes = document.querySelectorAll(".input-box");

// Load dark mode preference
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Load notes from localStorage
function showNotes() {
  const savedNotes = localStorage.getItem("notes");
  if (savedNotes) {
    notesContainer.innerHTML = savedNotes;
    attachNoteListeners();
    // Update character counts for all loaded notes
    document.querySelectorAll(".input-box").forEach((note) => {
      const content = note.querySelector(".note-content");
      const counter = note.querySelector(".char-counter");
      if (content && counter) {
        counter.textContent = `${content.textContent.trim().length} characters`;
      }
    });
  }
}

function updateStorage() {
  localStorage.setItem("notes", notesContainer.innerHTML);
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode") ? "enabled" : "disabled"
  );
}

function createNoteElement() {
  const timestamp = new Date().toLocaleString();
  const noteHtml = `
    <div class="input-box">
      <div class="note-content" contenteditable="true"></div>
      <div class="note-footer">
        <span class="note-tag"></span>
        <span class="char-counter">0 characters</span>
        <div class="note-actions">
          <img src="./images/delete.png" alt="delete" class="delete-btn">
          <i class="fas fa-download save-btn"></i>
        </div>
      </div>
      <small class="timestamp">${timestamp}</small>
    </div>
  `;
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = noteHtml;
  return tempContainer.firstElementChild;
}

function attachNoteListeners() {
  notes = document.querySelectorAll(".input-box");
  notes.forEach((note) => {
    const content = note.querySelector(".note-content");
    const counter = note.querySelector(".char-counter");
    const saveBtn = note.querySelector(".save-btn");

    // Initial character count
    if (content && counter) {
      counter.textContent = `${content.textContent.trim().length} characters`;
    }

    // Update character count on input
    content.addEventListener("input", () => {
      const charCount = content.textContent.trim().length;
      counter.textContent = `${charCount} characters`;
      updateStorage();
    });

    // Save note as text file
    saveBtn.addEventListener("click", () => {
      const text = content.textContent;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `note-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });
  });
}

// Event Listeners
createBtn.addEventListener("click", () => {
  const inputBox = createNoteElement();
  notesContainer.appendChild(inputBox);
  formatTools.style.display = "flex";
  attachNoteListeners();
  updateStorage();
});

notesContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    e.target.closest(".input-box").remove();
    updateStorage();
  }
});

// Formatting tools
document.querySelectorAll(".format-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const format = btn.dataset.format;
    document.execCommand(format, false, null);
    updateStorage();
  });
});

// Tag selection
document.querySelector(".tag-select").addEventListener("change", function (e) {
  const activeNote = document.activeElement.closest(".input-box");
  if (activeNote) {
    const tagSpan = activeNote.querySelector(".note-tag");
    tagSpan.textContent = e.target.value;
    updateStorage();
  }
});

// Search functionality
searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const notes = document.querySelectorAll(".input-box");

  notes.forEach((note) => {
    const content = note
      .querySelector(".note-content")
      .textContent.toLowerCase();
    const tag = note.querySelector(".note-tag").textContent.toLowerCase();
    const isVisible = content.includes(searchTerm) || tag.includes(searchTerm);
    note.style.display = isVisible ? "block" : "none";
  });
});

// Dark mode toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  darkModeToggle.innerHTML = isDarkMode
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});

// Enter key handling
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.execCommand("insertLineBreak");
    e.preventDefault();
  }
});

// Initial load
showNotes();
