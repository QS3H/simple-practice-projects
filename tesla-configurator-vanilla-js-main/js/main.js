const topBar = document.getElementById("top-bar");
const exteriorColors = document.getElementById("exterior-buttons");
const interiorColors = document.getElementById("interior-buttons");
const exteriorImage = document.getElementById("exterior-image");
const interiorImage = document.getElementById("interior-image");
const wheelButtons = document.getElementById("wheel-buttons");
const performanceButton = document.getElementById("performance-btn");

let selectedColor = "Stealth Grey";
const selectedOptions = {
  "Performance Wheels": false,
  "Performance Package": false,
  "Full Self-Driving": false,
};

// Handle Top Bar On Scroll
function handleTopBarOnScroll() {
  const atTop = window.scrollY === 0;
  topBar.classList.toggle("visible-bar", atTop);
  topBar.classList.toggle("hidden-bar", !atTop);
}

// Image Mapping
const exteriorImagesMapping = {
  "Stealth Grey": "./images/model-y-stealth-grey.jpg",
  "Pearl White": "./images/model-y-pearl-white.jpg",
  "Deep Blue": "./images/model-y-deep-blue-metallic.jpg",
  "Solid Black": "./images/model-y-solid-black.jpg",
  "Ultra Red": "./images/model-y-ultra-red.jpg",
  "Quick silver": "./images/model-y-quicksilver.jpg",
};

const interiorImagesMapping = {
  Dark: "./images/model-y-interior-dark.jpg",
  Light: "./images/model-y-interior-light.jpg",
};

// Handle Color Selection
function handleColorSelection(event) {
  let button;

  if (event.target.tagName === "IMG") {
    button = event.target.closest("button");
  } else if (event.target.tagName === "BUTTON") {
    button = event.target;
  }

  if (button) {
    const buttons = event.currentTarget.querySelectorAll("button");
    buttons.forEach((btn) => btn.classList.remove("btn-selected"));
    button.classList.add("btn-selected");
  }

  // Update Exterior Image
  if (event.currentTarget === exteriorColors) {
    selectedColor = button.querySelector("img").alt;
    updateExteriorImage();
  }

  // Update Interior Image
  if (event.currentTarget === interiorColors) {
    const color = button.querySelector("img").alt;
    interiorImage.src = interiorImagesMapping[color];
  }
}

// Update exterior image based on color and wheels
function updateExteriorImage() {
  const performanceWheels = selectedOptions["Performance Wheels"]
    ? "-performance"
    : "";
  const colorKey =
    selectedColor in exteriorImagesMapping ? selectedColor : "Stealth Grey";
  exteriorImage.src = exteriorImagesMapping[colorKey].replace(
    ".jpg",
    `${performanceWheels}.jpg`
  );
}

// Handle Wheel Selection
function handleWheelSelection(event) {
  if (event.target.tagName === "BUTTON") {
    const buttons = document.querySelectorAll("#wheel-buttons button");
    buttons.forEach((btn) => btn.classList.remove("bg-gray-700", "text-white"));

    // Add styles to the selected button
    event.target.classList.add("bg-gray-700", "text-white");

    // Keep selected wheels on exterior color change
    selectedOptions["Performance Wheels"] =
      event.target.textContent.includes("Performance");

    updateExteriorImage();
  }
}

// Performance Package Selection
function handlePerformancePackageSelection(event) {
  performanceButton.classList.toggle("bg-gray-700");
  performanceButton.classList.toggle("text-white");
}

// Event Listeners
window.addEventListener("scroll", () =>
  requestAnimationFrame(handleTopBarOnScroll)
);
exteriorColors.addEventListener("click", handleColorSelection);
interiorColors.addEventListener("click", handleColorSelection);
wheelButtons.addEventListener("click", handleWheelSelection);
performanceButton.addEventListener("click", handlePerformancePackageSelection);
