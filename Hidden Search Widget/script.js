class SearchWidget {
  constructor() {
    this.searchContainer = document.querySelector(".search-container");
    this.button = document.querySelector(".btn");
    this.input = document.querySelector(".input");

    if (!this.searchContainer || !this.button || !this.input) {
      throw new Error("Required elements not found!");
    }

    this.isActive = false;
    this.init();
  }

  init() {
    // Handle button click
    this.button.addEventListener("click", () => this.toggleSearch());

    // Handle click outside
    document.addEventListener("click", (e) => this.handleClickOutside(e));

    // Handle escape key
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    // Handle input changes
    this.input.addEventListener("input", (e) => this.handleInput(e));
  }

  toggleSearch() {
    this.isActive = !this.isActive;
    this.searchContainer.classList.toggle("active");

    if (this.isActive) {
      this.input.focus();
      // Add animation class to button icon if it exists
      const icon = this.button.querySelector("i");
      if (icon) icon.classList.add("rotate");
    } else {
      this.input.value = "";
      this.input.blur();
      const icon = this.button.querySelector("i");
      if (icon) icon.classList.remove("rotate");
    }
  }

  handleClickOutside(event) {
    if (!this.searchContainer.contains(event.target) && this.isActive) {
      this.toggleSearch();
    }
  }

  handleKeyPress(event) {
    if (event.key === "Escape" && this.isActive) {
      this.toggleSearch();
    }
  }

  handleInput(event) {
    // Debounce search input
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const searchTerm = event.target.value.trim();
      if (searchTerm) {
        this.performSearch(searchTerm);
      }
    }, 300);
  }

  performSearch(searchTerm) {
    // Example search implementation
    console.log(`Searching for: ${searchTerm}`);
    // Add your search logic here
  }
}

// Initialize the search widget when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    const searchWidget = new SearchWidget();
  } catch (error) {
    console.error("Failed to initialize search widget:", error);
  }
});
