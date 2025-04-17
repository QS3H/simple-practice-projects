class ProgressSteps {
  constructor() {
    this.progress = document.getElementById("progress");
    this.prevButton = document.getElementById("previous");
    this.nextButton = document.getElementById("next");
    this.circles = document.querySelectorAll(".circle");
    this.currentActive = 1;
    this.maxSteps = this.circles.length;

    this.initializeEventListeners();
    this.updateUI();
  }

  initializeEventListeners() {
    this.nextButton.addEventListener("click", () => this.handleNext());
    this.prevButton.addEventListener("click", () => this.handlePrevious());

    // Add keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") this.handleNext();
      if (e.key === "ArrowLeft") this.handlePrevious();
    });
  }

  handleNext() {
    if (this.currentActive >= this.maxSteps) return;
    this.currentActive++;
    this.updateUI();
  }

  handlePrevious() {
    if (this.currentActive <= 1) return;
    this.currentActive--;
    this.updateUI();
  }

  updateUI() {
    // Update circles
    this.circles.forEach((circle, index) => {
      circle.classList.toggle("active", index < this.currentActive);
    });

    // Update progress bar
    const progressWidth =
      ((this.currentActive - 1) / (this.maxSteps - 1)) * 100;
    this.progress.style.width = `${progressWidth}%`;

    // Update buttons
    this.updateButtonStates();
  }

  updateButtonStates() {
    this.prevButton.disabled = this.currentActive === 1;
    this.nextButton.disabled = this.currentActive === this.maxSteps;
  }
}

// Initialize the progress steps
const progressSteps = new ProgressSteps();
