const topBar = document.getElementById("top-bar");
const exteriorColors = document.getElementById("exterior-buttons");
const interiorColors = document.getElementById("interior-buttons");
const exteriorImage = document.getElementById("exterior-image");
const interiorImage = document.getElementById("interior-image");
const wheelButtons = document.getElementById("wheel-buttons");
const performanceButton = document.getElementById("performance-btn");
const totalPriceEl = document.getElementById("total-price");
const fullSelfDrivingEl = document.getElementById("full-self-driving-checkbox");
const accessoriesCheckbox = document.querySelectorAll(
  ".accessory-form-checkbox"
);

const basePrice = 52490;
let currentPrice = basePrice;

let selectedColor = "Stealth Grey";
const selectedOptions = {
  "Performance Wheels": false,
  "Performance Package": false,
  "Full Self-Driving": false,
};

const pricing = {
  "Performance Wheels": 2500,
  "Performance Package": 5000,
  "Full Self-Driving": 8500,
  Accessories: {
    "Center Console Trays": 35,
    Sunshade: 105,
    "All-Weather Interior Liners": 225,
  },
};

// Update Total Price
function updateTotalPrice() {
  // Reset current price
  currentPrice = basePrice;

  // Add selected options to current price
  for (const option in selectedOptions) {
    if (selectedOptions[option]) {
      currentPrice += pricing[option];
    }
  }

  // Add accessories to current price
  accessoriesCheckbox.forEach((checkbox) => {
    const accessoryLabel = checkbox
      .closest("label")
      .querySelector("span")
      .textContent.trim();

    const accessoryPrice = pricing.Accessories[accessoryLabel];
    if (checkbox.checked) {
      currentPrice += accessoryPrice;
    }
  });

  // Update the total price in UI
  totalPriceEl.textContent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(currentPrice);
}

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
  const newImageSrc = exteriorImagesMapping[colorKey].replace(
    ".jpg",
    `${performanceWheels}.jpg`
  );

  exteriorImage.src = newImageSrc;

  // Add error handling for image loading
  const img = new Image();
  img.onerror = () => {
    console.error(`Failed to load image: ${newImageSrc}`);
    exteriorImage.src = exteriorImagesMapping[colorKey]; // Fallback to non-performance image
  };
  img.onload = () => {
    exteriorImage.src = newImageSrc;
  };
  img.src = newImageSrc;
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

    updateTotalPrice();
  }
}

// Performance Package Selection
function handlePerformancePackageSelection(event) {
  const isSelected = performanceButton.classList.toggle("bg-gray-700");
  performanceButton.classList.toggle("text-white");

  // Toggle selected option
  selectedOptions["Performance Package"] = isSelected;

  updateTotalPrice();
}

// Full Self-Driving Selection
function handleFullSelfDrivingSelection(event) {
  selectedOptions["Full Self-Driving"] = fullSelfDrivingEl.checked;
  updateTotalPrice();
}

// Accessory Selection
accessoriesCheckbox.forEach((checkbox) => {
  checkbox.addEventListener("change", () => updateTotalPrice());
});

// Event Listeners
window.addEventListener("scroll", () =>
  requestAnimationFrame(handleTopBarOnScroll)
);
exteriorColors.addEventListener("click", handleColorSelection);
interiorColors.addEventListener("click", handleColorSelection);
wheelButtons.addEventListener("click", handleWheelSelection);
performanceButton.addEventListener("click", handlePerformancePackageSelection);
fullSelfDrivingEl.addEventListener("change", handleFullSelfDrivingSelection);
