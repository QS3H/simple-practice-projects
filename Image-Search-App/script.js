// API Key and Constants
const CONFIG = {
  API_KEY: "avWy_Rwz2LzoUWbGvptyRLlRx5U15zF1AbhlaNMRpF8",
  STORAGE_KEY: "imageSearchFavorites",
  MAX_FAVORITES: 100,
  API_TIMEOUT: 10000, // 10 seconds
};

// State
const state = {
  query: "",
  page: 1,
  currentCategory: "all",
  isLoading: false,
  favorites: [],
  currentImage: null,
  showFavorites: false,
};

// DOM Elements - Using a proxy pattern for safer access
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  // --- FAVORITES TAB LOGIC ---
  const tabSearch = document.getElementById('tab-search');
  const tabFavorites = document.getElementById('tab-favorites');
  const resultsSection = document.getElementById('results-section');
  const favoritesSection = document.getElementById('favorites-section');

  function showTab(tab) {
    if (tab === 'search') {
      tabSearch.classList.add('active');
      tabFavorites.classList.remove('active');
      resultsSection.style.display = '';
      favoritesSection.style.display = 'none';
    } else {
      tabSearch.classList.remove('active');
      tabFavorites.classList.add('active');
      resultsSection.style.display = 'none';
      favoritesSection.style.display = '';
      renderFavoritesTab();
    }
  }

  function renderFavoritesTab() {
    const container = document.getElementById('favorites-list');
    container.innerHTML = '';
    if (!state.favorites.length) {
      container.innerHTML = '<div class="no-favorites">No favorites yet. Start adding some!</div>';
      return;
    }
    state.favorites.forEach(img => {
      const div = document.createElement('div');
      div.className = 'favorite-image';
      div.innerHTML = `<img src="${img.urls.small}" alt="${img.alt_description || 'Favorite image'}" loading="lazy"><button class="remove-fav" data-id="${img.id}" title="Remove from favorites">&times;</button>`;
      container.appendChild(div);
    });
    container.querySelectorAll('.remove-fav').forEach(btn => {
      btn.onclick = e => {
        const id = btn.getAttribute('data-id');
        toggleFavorite(state.favorites.find(f => f.id === id));
        renderFavoritesTab();
      };
    });
    container.querySelectorAll('img').forEach(img => {
      img.onclick = () => {
        const fav = state.favorites.find(f => f.urls.small === img.src);
        if (fav) openModal(fav);
      };
    });
  }

  tabSearch && tabSearch.addEventListener('click', () => showTab('search'));
  tabFavorites && tabFavorites.addEventListener('click', () => showTab('favorites'));

  // --- END FAVORITES TAB LOGIC ---

  initializeApp();
  setupEventListeners();
});

// Initialize App
function initializeApp() {
  // Set current year in footer
  $("#current-year").textContent = new Date().getFullYear();

  // Load saved favorites
  loadFavorites();

  // Apply saved theme
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    $(".fa-moon")?.classList.replace("fa-moon", "fa-sun");
  }

  // Initial UI setup
  updateUI({
    showMoreButton: false,
    loadingIndicator: false,
    favoritesContainer: false,
    welcomeMessage: true,
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Search form submission
  $("#search-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    state.page = 1;
    searchImages();
  });

  // Show more button
  $("#show-more-button")?.addEventListener("click", searchImages);

  // Category buttons
  $$(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveCategory(btn.dataset.category);
      state.page = 1;
      searchImages();
    });
  });

  // Theme toggle
  $("#theme-toggle")?.addEventListener("click", toggleTheme);

  // Modal close buttons
  $(".close-modal")?.addEventListener("click", closeModal);

  // Click outside modal to close
  $("#image-modal")?.addEventListener("click", (e) => {
    if (e.target === $("#image-modal")) closeModal();
  });

  // Add/remove favorite from modal
  $("#modal-favorite")?.addEventListener("click", () => {
    if (state.currentImage) {
      const imageElem = $(
        `.search-result[data-image-id="${state.currentImage.id}"]`
      );
      toggleFavorite(state.currentImage, imageElem);
    }
  });

  // Toggle favorites display
  $("#toggle-favorites")?.addEventListener("click", toggleFavoritesDisplay);

  // Keyboard events
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#image-modal")?.style.display === "flex") {
      closeModal();
    }
  });

  // Network status
  window.addEventListener("online", () => showToast("You are back online!"));
  window.addEventListener("offline", () =>
    showToast("You are offline. Some features may be limited.")
  );
}

// Search Images
async function searchImages() {
  try {
    if (state.isLoading) return;

    // Validate search query
    if (state.currentCategory === "all" && !$("#search-input").value.trim()) {
      showToast("Please enter a search term or select a category");
      return;
    }

    // Update state and UI
    state.isLoading = true;
    state.query = $("#search-input").value.trim();
    updateUI({ loadingIndicator: true, statusMessage: "" });

    // Create URL
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.append("page", state.page);
    url.searchParams.append("query", state.query || state.currentCategory);
    url.searchParams.append("client_id", CONFIG.API_KEY);

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];

    // Handle no results
    if (results.length === 0) {
      updateUI({
        loadingIndicator: false,
        showMoreButton: false,
        statusMessage: `
          <div class="no-results">
            <i class="fas fa-search"></i>
            <p>No images found for "${
              state.query || state.currentCategory
            }". Please try another search term.</p>
          </div>
        `,
      });
      state.isLoading = false;
      return;
    }

    // Clear results on first page
    if (state.page === 1) {
      $(".search-results").innerHTML = "";
    }

    // Render results and update state
    renderResults(results);
    state.page++;

    updateUI({ loadingIndicator: false, showMoreButton: true });
  } catch (error) {
    console.error("Error fetching images:", error);

    // Show appropriate error message
    const errorMessage =
      error.name === "AbortError"
        ? "Request timed out. Please check your internet connection."
        : error.message.includes("429")
        ? "API rate limit exceeded. Please try again in a few minutes."
        : "Failed to load images. Please try again later.";

    updateUI({
      loadingIndicator: false,
      statusMessage: `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>${errorMessage}</p>
        </div>
      `,
    });
  } finally {
    state.isLoading = false;
  }
}

// Render Search Results
function renderResults(results) {
  const resultsContainer = $(".search-results");
  if (!resultsContainer) return;

  results.forEach((result) => {
    // Skip invalid results
    if (!result?.id || !result?.urls?.small) return;

    // Create image card
    const card = document.createElement("div");
    card.className = "search-result animate-in";
    card.dataset.imageId = result.id;

    // Check if image is favorited
    if (state.favorites.some((f) => f.id === result.id)) {
      card.classList.add("favorited");
    }

    // Create card HTML
    card.innerHTML = `
      <img 
        src="${result.urls.small}" 
        alt="${result.alt_description || "Unsplash image"}" 
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x200?text=Image+Failed+to+Load';this.alt='Failed to load image';"
      />
      <div class="image-overlay">
        <h3>${truncateText(result.alt_description || "Untitled Image", 60)}</h3>
        <div class="image-actions">
          <button aria-label="View image details">
            <i class="fas fa-search-plus"></i>
          </button>
          <button class="favorite-btn" aria-label="${
            state.favorites.some((f) => f.id === result.id)
              ? "Remove from favorites"
              : "Add to favorites"
          }">
            <i class="fa${
              state.favorites.some((f) => f.id === result.id) ? "s" : "r"
            } fa-heart"></i>
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    card.addEventListener("click", () => openModal(result));

    card.querySelector(".favorite-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(result, card);
    });

    card
      .querySelector(".image-actions button:first-child")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(result);
      });

    resultsContainer.appendChild(card);
  });
}

// Open Image Modal
function openModal(imageData) {
  if (!imageData?.urls || !$("#image-modal")) return;

  state.currentImage = imageData;

  // Set modal content
  $("#modal-img").src = imageData.urls.regular || imageData.urls.small;
  $("#modal-img").alt = imageData.alt_description || "Unsplash image";
  $("#modal-title").textContent = imageData.alt_description || "Untitled Image";
  $("#modal-description").textContent =
    imageData.description || "No description available.";

  // Set download link
  const downloadLink = $("#modal-download");
  if (downloadLink && imageData.urls.full) {
    downloadLink.href = imageData.urls.full;
    downloadLink.setAttribute("download", `image-${imageData.id}.jpg`);
  }

  // Set photographer info
  const photographerLink = $("#modal-photographer");
  if (photographerLink) {
    const photographerUrl = imageData.user?.links?.html || "#";
    const photographerName = imageData.user?.name || "Unknown";

    photographerLink.href = photographerUrl;
    photographerLink.innerHTML = `<i class="fas fa-camera"></i> Photo by ${photographerName}`;
  }

  // Set favorite button state
  const isFavorited = state.favorites.some((f) => f.id === imageData.id);
  const favoriteBtn = $("#modal-favorite");
  if (favoriteBtn) {
    favoriteBtn.innerHTML = `
      <i class="fa${isFavorited ? "s" : "r"} fa-heart"></i> 
      ${isFavorited ? "Remove from Favorites" : "Add to Favorites"}
    `;
    favoriteBtn.classList.toggle("active", isFavorited);
  }

  // Show modal
  $("#image-modal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Close Image Modal
function closeModal() {
  const modal = $("#image-modal");
  if (!modal) return;

  modal.style.display = "none";
  document.body.style.overflow = "auto";
  state.currentImage = null;

  // Clear image src to free memory
  const modalImg = $("#modal-img");
  if (modalImg) modalImg.src = "";
}

// Toggle Favorite Status
function toggleFavorite(imageData, imageElement) {
  if (!imageData?.id) {
    showToast("Error: Can't add to favorites");
    return;
  }

  try {
    const index = state.favorites.findIndex((img) => img.id === imageData.id);

    if (index === -1) {
      // Not in favorites - add it
      if (state.favorites.length >= CONFIG.MAX_FAVORITES) {
        showToast(
          `Maximum favorites limit (${CONFIG.MAX_FAVORITES}) reached. Please remove some first.`
        );
        return;
      }

      // Create a minimal favorite object
      const favorite = {
        id: imageData.id,
        urls: {
          small: imageData.urls.small || "",
          regular: imageData.urls.regular || imageData.urls.small || "",
          full:
            imageData.urls.full ||
            imageData.urls.regular ||
            imageData.urls.small ||
            "",
        },
        alt_description: imageData.alt_description || "Untitled Image",
        description: imageData.description || "",
        addedAt: new Date().toISOString(),
        user: imageData.user
          ? {
              name: imageData.user.name || "Unknown",
              links: { html: imageData.user.links?.html || "#" },
            }
          : { name: "Unknown", links: { html: "#" } },
      };

      state.favorites.push(favorite);
      showToast("Added to favorites!");
    } else {
      // Already in favorites - remove it
      state.favorites.splice(index, 1);
      showToast("Removed from favorites");
    }

    // Update UI
    updateFavoriteUI(imageData.id);
    saveFavorites();

    // Re-render favorites if visible
    if (state.showFavorites) renderFavorites();
  } catch (error) {
    console.error("Error updating favorites:", error);
    showToast("Failed to update favorites");
  }
}

// Update all UI elements showing favorite status
function updateFavoriteUI(imageId) {
  const isFavorited = state.favorites.some((f) => f.id === imageId);

  // Update all cards with this image ID
  $$(`.search-result[data-image-id="${imageId}"]`).forEach((card) => {
    card.classList.toggle("favorited", isFavorited);
    const heartIcon = card.querySelector(".favorite-btn i");
    if (heartIcon) {
      heartIcon.className = `fa${isFavorited ? "s" : "r"} fa-heart`;
    }
  });

  // Update modal if it's showing this image
  if (state.currentImage?.id === imageId) {
    const modalFavoriteBtn = $("#modal-favorite");
    if (modalFavoriteBtn) {
      modalFavoriteBtn.innerHTML = `
        <i class="fa${isFavorited ? "s" : "r"} fa-heart"></i> 
        ${isFavorited ? "Remove from Favorites" : "Add to Favorites"}
      `;
      modalFavoriteBtn.classList.toggle("active", isFavorited);
    }
  }

  // Update favorites count badge
  updateFavoritesCount();
}

// Toggle Favorites Display
function toggleFavoritesDisplay() {
  state.showFavorites = !state.showFavorites;
  const favContainer = $("#favorites-container");
  if (!favContainer) return;

  favContainer.classList.toggle("hidden", !state.showFavorites);

  if (state.showFavorites) {
    renderFavorites();
    $("#toggle-favorites").innerHTML = '<i class="fas fa-times"></i>';
    $("#toggle-favorites").setAttribute("aria-label", "Hide favorites");

    // Hide count badge
    $(".count-badge")?.style.setProperty("display", "none");

    // Scroll to favorites
    favContainer.scrollIntoView({ behavior: "smooth" });
  } else {
    $("#toggle-favorites").innerHTML = '<i class="fas fa-heart"></i>';
    $("#toggle-favorites").setAttribute("aria-label", "Show favorites");
    updateFavoritesCount();
  }
}

// Render Favorites
function renderFavorites() {
  const favGrid = $(".favorites-grid");
  if (!favGrid) return;

  favGrid.innerHTML = "";

  // Show empty state if no favorites
  if (state.favorites.length === 0) {
    favGrid.innerHTML = `
      <div class="no-favorites">
        <i class="far fa-heart"></i>
        <p>No favorites yet. Click the heart icon on images to add them here.</p>
      </div>
    `;
    return;
  }

  // Add sorting controls
  const sortingControls = document.createElement("div");
  sortingControls.className = "sorting-controls";
  sortingControls.innerHTML = `
    <span>Sort by:</span>
    <select id="favorites-sort">
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
    </select>
    <button id="clear-all-favorites" class="danger-btn">
      <i class="fas fa-trash"></i> Clear All
    </button>
  `;
  favGrid.appendChild(sortingControls);

  // Add event listeners
  $("#favorites-sort")?.addEventListener("change", (e) => {
    sortFavorites(e.target.value);
    renderFavorites();
  });

  $("#clear-all-favorites")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to remove all favorites?")) {
      state.favorites = [];
      saveFavorites();
      updateFavoritesCount();
      renderFavorites();
      showToast("All favorites cleared");
    }
  });

  // Create container for favorite items
  const favItems = document.createElement("div");
  favItems.className = "favorites-items";
  favGrid.appendChild(favItems);

  // Add each favorite
  state.favorites.forEach((fav) => {
    if (!fav?.id || !fav?.urls?.small) return;

    const favItem = document.createElement("div");
    favItem.className = "favorite-item slide-up";
    favItem.dataset.imageId = fav.id;

    const formattedDate = fav.addedAt
      ? `Added: ${new Date(fav.addedAt).toLocaleDateString()} ${new Date(
          fav.addedAt
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "";

    favItem.innerHTML = `
      <img 
        src="${fav.urls.small}" 
        alt="${fav.alt_description || "Favorite image"}" 
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Available';this.alt='Image not available';"
      />
      <p>${truncateText(fav.alt_description || "Untitled Image", 40)}</p>
      <div class="favorite-actions">
        <button aria-label="View image details"><i class="fas fa-search-plus"></i></button>
        <button aria-label="Remove from favorites"><i class="fas fa-trash"></i></button>
      </div>
    `;

    if (formattedDate) favItem.title = formattedDate;

    // Add event listeners
    favItem.addEventListener("click", () => openModal(fav));

    favItem
      .querySelector(".favorite-actions button:last-child")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(fav);

        // Animate removal
        favItem.classList.add("removing");
        setTimeout(() => {
          favItem.remove();
          if (state.favorites.length === 0) renderFavorites();
        }, 300);
      });

    favItems.appendChild(favItem);
  });
}

// Sort Favorites
function sortFavorites(sortType) {
  state.favorites.sort((a, b) => {
    const dateA = a.addedAt ? new Date(a.addedAt) : new Date(0);
    const dateB = b.addedAt ? new Date(b.addedAt) : new Date(0);

    return sortType === "newest" ? dateB - dateA : dateA - dateB;
  });

  saveFavorites();
}

// Save Favorites
function saveFavorites() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.favorites));
  } catch (error) {
    console.error("Failed to save favorites:", error);

    if (error.name === "QuotaExceededError") {
      try {
        // Try with compressed data
        const compressed = state.favorites.map((f) => ({
          id: f.id,
          urls: { small: f.urls.small },
          alt_description: truncateText(f.alt_description, 30),
          addedAt: f.addedAt,
        }));

        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(compressed));
        showToast("Favorites saved with reduced quality due to storage limits");
      } catch (e) {
        // Last resort: keep only recent items
        const reduced = state.favorites.slice(0, 20);
        try {
          localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(reduced));
          state.favorites = reduced;
          showToast("Favorites reduced to latest 20 due to storage limits");
        } catch (finalError) {
          showToast("Could not save favorites. Storage full.");
        }
      }
    }
  }
}

// Load Favorites
function loadFavorites() {
  try {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!saved) {
      state.favorites = [];
      return;
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      // Filter out invalid items and ensure required properties
      state.favorites = parsed
        .filter((item) => item && item.id && item.urls && item.urls.small)
        .map((item) => ({
          id: item.id,
          urls: {
            small: item.urls.small,
            regular: item.urls.regular || item.urls.small,
            full: item.urls.full || item.urls.regular || item.urls.small,
          },
          alt_description: item.alt_description || "Untitled Image",
          description: item.description || "",
          addedAt: item.addedAt || new Date().toISOString(),
          user: item.user || { name: "Unknown", links: { html: "#" } },
        }));

      // Sort by date (newest first)
      state.favorites.sort((a, b) => {
        const dateA = a.addedAt ? new Date(a.addedAt) : new Date(0);
        const dateB = b.addedAt ? new Date(b.addedAt) : new Date(0);
        return dateB - dateA;
      });
    }

    updateFavoritesCount();
  } catch (error) {
    console.error("Failed to load favorites:", error);
    state.favorites = [];
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  }
}

// Update Favorites Count Badge
function updateFavoritesCount() {
  const count = state.favorites.length;
  const badge = $(".count-badge");

  if (!badge) return;

  if (count > 0 && !state.showFavorites) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

// Set Active Category
function setActiveCategory(category) {
  state.currentCategory = category;
  state.page = 1;

  // Update active class
  $$(".category-btn").forEach((btn) => {
    const isActive = btn.dataset.category === category;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive);
  });
}

// Toggle Dark/Light Theme
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");

  // Update icon
  const icon = $(".theme-toggle i");
  if (icon) {
    icon.className = `fas fa-${isDark ? "sun" : "moon"}`;
  }

  // Save preference
  localStorage.setItem("darkMode", isDark);
}

// Helper function to update UI elements
function updateUI(options = {}) {
  const {
    showMoreButton = null,
    loadingIndicator = null,
    favoritesContainer = null,
    statusMessage = null,
    welcomeMessage = false,
  } = options;

  if (showMoreButton !== null) {
    $("#show-more-button").style.display = showMoreButton ? "block" : "none";
  }

  if (loadingIndicator !== null) {
    $(".loading-indicator").style.display = loadingIndicator ? "flex" : "none";
  }

  if (favoritesContainer !== null) {
    $("#favorites-container").classList.toggle("hidden", !favoritesContainer);
  }

  if (statusMessage !== null) {
    $("#status-message").innerHTML = statusMessage;
  }

  if (welcomeMessage) {
    $("#status-message").innerHTML = `
      <div class="welcome-message">
        <i class="fas fa-images"></i>
        <h2>Welcome to Image Search</h2>
        <p>Search for any images or select a category to get started</p>
      </div>
    `;
  }
}

// Show Toast Notification
function showToast(message) {
  // Remove existing toast
  $(".toast")?.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// Add toast styles if not in CSS
if (!document.querySelector("#toast-style")) {
  const style = document.createElement("style");
  style.id = "toast-style";
  style.textContent = `
    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 1000;
      transition: transform 0.3s ease;
    }
    .toast.show {
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);
}
