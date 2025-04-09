// DOM Elements
const container = document.querySelector(".seats-container");
const seats = document.querySelectorAll(".row .seat:not(.occupied)");
const count = document.getElementById("count");
const total = document.getElementById("total");
const movieSelect = document.getElementById("movie");
const movieContainer = document.querySelector(".movie-container");
const showcase = document.querySelector(".showcase");

// Get data from localStorage and populate UI
populateUI();

// Movie ticket price from selected option
let ticketPrice = +movieSelect.value;

// Save selected movie index and price
function setMovieData(movieIndex, moviePrice) {
  try {
    safeLocalStorageSetItem("selectedMovieIndex", movieIndex);
    safeLocalStorageSetItem("selectedMoviePrice", moviePrice);
  } catch (error) {
    console.error("Error saving movie data:", error);
  }
}

// Update total and count
function updateSelectedCount() {
  try {
    const selectedSeats = document.querySelectorAll(".row .seat.selected");

    // Copy selected seats into array and map to get seating positions
    const seatsIndex = [...selectedSeats].map((seat) =>
      [...seats].indexOf(seat)
    );

    // Save to localStorage
    safeLocalStorageSetItem("selectedSeats", JSON.stringify(seatsIndex));

    // Update counts
    const selectedSeatsCount = selectedSeats.length;

    // Check if elements exist before updating
    if (count && total) {
      count.innerText = selectedSeatsCount;
      total.innerText = (selectedSeatsCount * ticketPrice).toFixed(2); // Added decimal places
    }
  } catch (error) {
    console.error("Error updating seat count:", error);
  }
}

// Get data from localStorage and populate UI
function populateUI() {
  try {
    const selectedSeats =
      JSON.parse(safeLocalStorageGetItem("selectedSeats")) || [];
    const selectedMovieIndex = safeLocalStorageGetItem("selectedMovieIndex");

    if (selectedMovieIndex !== null && movieSelect) {
      movieSelect.selectedIndex = selectedMovieIndex;
      ticketPrice = +movieSelect.value;
    }

    seats.forEach((seat, index) => {
      if (selectedSeats.includes(index)) {
        seat.classList.add("selected");
      }
    });

    updateSelectedCount();
  } catch (error) {
    console.error("Error populating UI:", error);
  }
}

// Event Listeners
container.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("seat") &&
    !e.target.classList.contains("occupied")
  ) {
    e.target.classList.toggle("selected");
    updateSelectedCount();
  }
});

movieSelect.addEventListener("change", (e) => {
  ticketPrice = +e.target.value;
  setMovieData(e.target.selectedIndex, e.target.value);
  updateSelectedCount();
});

// Local Storage Helper Functions
function safeLocalStorageSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error("localStorage is not available:", e);
  }
}

function safeLocalStorageGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error("localStorage is not available:", e);
    return null;
  }
}

// Add seat hover animations
seats.forEach((seat) => {
  seat.addEventListener("mouseenter", () => {
    if (
      !seat.classList.contains("occupied") &&
      !seat.classList.contains("selected")
    ) {
      seat.style.transform = "scale(1.1)";
      seat.style.transition = "transform 0.3s ease";
    }
  });

  seat.addEventListener("mouseleave", () => {
    if (
      !seat.classList.contains("occupied") &&
      !seat.classList.contains("selected")
    ) {
      seat.style.transform = "scale(1)";
    }
  });
});

// Initialize
updateSelectedCount();
