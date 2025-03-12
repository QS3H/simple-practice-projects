const MAX_CHARACTERS = 120;

class CharacterCounter {
  constructor() {
    this.textArea = document.getElementById("textarea");
    this.totalChars = document.getElementById("total-characters");
    this.remainingChars = document.getElementById("remaining-characters");
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.textArea.addEventListener("keyup", () => this.updateCharacterCount());
  }

  updateCharacterCount() {
    const currentLength = this.textArea.value.length;
    const remaining = MAX_CHARACTERS - currentLength;

    this.updateDisplay(currentLength, remaining);
  }

  updateDisplay(total, remaining) {
    this.totalChars.textContent = total;
    this.remainingChars.textContent = remaining;
  }
}

// Initialize the counter when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new CharacterCounter();
});
