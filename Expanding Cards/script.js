"use strict";

class CardManager {
  constructor() {
    this.cards = document.querySelectorAll(".card");
    this.activeCard = null;
    this.isAnimating = false;
    this.initializeCards();
  }

  initializeCards() {
    this.cards.forEach((card, index) => {
      // Add keyboard navigation
      card.setAttribute("tabindex", "0");

      // Add event listeners
      card.addEventListener("click", () => this.handleCardActivation(card));
      card.addEventListener("keydown", (e) => this.handleKeyPress(e, card));

      // Add animation end listener
      card.addEventListener("transitionend", () => (this.isAnimating = false));

      // Add numbered data attribute
      card.dataset.cardIndex = index + 1;
    });

    // Auto-rotate cards if no interaction
    this.startAutoRotation();
  }

  handleCardActivation(card) {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.removeActiveClasses();
    card.classList.add("active");
    this.activeCard = card;

    // Emit custom event
    this.emitCardChangeEvent(card);
  }

  handleKeyPress(e, card) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.handleCardActivation(card);
    }
  }

  removeActiveClasses() {
    this.cards.forEach((card) => card.classList.remove("active"));
  }

  emitCardChangeEvent(card) {
    const event = new CustomEvent("cardChange", {
      detail: {
        cardIndex: card.dataset.cardIndex,
        cardElement: card,
      },
    });
    document.dispatchEvent(event);
  }

  startAutoRotation(interval = 5000) {
    let currentIndex = 0;
    this.autoRotateInterval = setInterval(() => {
      // Only rotate if no user interaction has occurred
      if (!document.querySelector(".card:hover")) {
        currentIndex = (currentIndex + 1) % this.cards.length;
        this.handleCardActivation(this.cards[currentIndex]);
      }
    }, interval);
  }

  stopAutoRotation() {
    clearInterval(this.autoRotateInterval);
  }
}

// Initialize the card manager
const cardManager = new CardManager();

// Example of listening to card changes
document.addEventListener("cardChange", (e) => {
  console.log(`Card ${e.detail.cardIndex} activated`);
});
