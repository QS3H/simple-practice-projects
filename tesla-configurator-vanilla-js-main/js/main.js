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
const downPaymentEl = document.getElementById("down-payment");
const monthlyPaymentEl = document.getElementById("monthly-payment");

const basePrice = 52490;
let currentPrice = basePrice;

let selectedColor = "Stealth Grey";
let selectedInteriorColor = "Dark"; // Default interior color
let selectedOptions = {
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

// Add this after the initial variable declarations
function saveToLocalStorage() {
  const config = {
    selectedColor,
    selectedInteriorColor, // Add this line
    selectedOptions,
    accessories: Array.from(accessoriesCheckbox).map((checkbox) => ({
      name: checkbox.closest("label").querySelector("span").textContent.trim(),
      checked: checkbox.checked,
    })),
  };
  localStorage.setItem("teslaConfig", JSON.stringify(config));
}

function loadFromLocalStorage() {
  const savedConfig = localStorage.getItem("teslaConfig");
  if (!savedConfig) return;

  const config = JSON.parse(savedConfig);

  // Restore color selection
  selectedColor = config.selectedColor;
  const colorButton = Array.from(
    exteriorColors.querySelectorAll("button")
  ).find((btn) => btn.querySelector("img").alt === selectedColor);
  if (colorButton) {
    exteriorColors
      .querySelectorAll("button")
      .forEach((btn) => btn.classList.remove("btn-selected"));
    colorButton.classList.add("btn-selected");
  }

  // Restore interior color selection
  selectedInteriorColor = config.selectedInteriorColor;
  const interiorColorButton = Array.from(
    interiorColors.querySelectorAll("button")
  ).find((btn) => btn.querySelector("img").alt === selectedInteriorColor);
  if (interiorColorButton) {
    interiorColors
      .querySelectorAll("button")
      .forEach((btn) => btn.classList.remove("btn-selected"));
    interiorColorButton.classList.add("btn-selected");
    interiorImage.src = interiorImagesMapping[selectedInteriorColor];
  }

  // Restore options
  selectedOptions = config.selectedOptions;

  // Restore performance wheels selection
  if (selectedOptions["Performance Wheels"]) {
    const perfWheelBtn = Array.from(
      wheelButtons.querySelectorAll("button")
    ).find((btn) => btn.textContent.includes("Performance"));
    if (perfWheelBtn) {
      wheelButtons
        .querySelectorAll("button")
        .forEach((btn) => btn.classList.remove("bg-gray-700", "text-white"));
      perfWheelBtn.classList.add("bg-gray-700", "text-white");
    }
  }

  // Restore performance package selection
  if (selectedOptions["Performance Package"]) {
    performanceButton.classList.add("bg-gray-700", "text-white");
  }

  // Restore FSD selection
  fullSelfDrivingEl.checked = selectedOptions["Full Self-Driving"];

  // Restore accessories
  config.accessories.forEach((acc) => {
    const checkbox = Array.from(accessoriesCheckbox).find(
      (cb) =>
        cb.closest("label").querySelector("span").textContent.trim() ===
        acc.name
    );
    if (checkbox) {
      checkbox.checked = acc.checked;
    }
  });

  // Update UI
  updateExteriorImage();
  updateTotalPrice();
}

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

  updatePaymentBreakdown();
}

// Update payment breakdown based on current price
function updatePaymentBreakdown() {
  const downPayment = currentPrice * 0.1;
  const loanMonths = 60;
  const annualInterestRate = 0.03;
  const monthlyInterestRate = annualInterestRate / 12;

  const loanAmount = currentPrice - downPayment;

  // Calculate monthly payment using the loan amortization formula
  const monthlyPayment =
    (loanAmount *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanMonths))) /
    (Math.pow(1 + monthlyInterestRate, loanMonths) - 1);

  // Format the displays
  downPaymentEl.textContent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(downPayment);

  monthlyPaymentEl.textContent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monthlyPayment);
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
    saveToLocalStorage(); // Add this line
  }

  // Update Interior Image
  if (event.currentTarget === interiorColors) {
    const color = button.querySelector("img").alt;
    selectedInteriorColor = color; // Add this line
    interiorImage.src = interiorImagesMapping[color];
    saveToLocalStorage(); // Add this line
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

// Initial update total price
updateTotalPrice();

// Event Listeners
window.addEventListener("scroll", () =>
  requestAnimationFrame(handleTopBarOnScroll)
);
exteriorColors.addEventListener("click", handleColorSelection);
interiorColors.addEventListener("click", handleColorSelection);
wheelButtons.addEventListener("click", handleWheelSelection);
performanceButton.addEventListener("click", handlePerformancePackageSelection);
fullSelfDrivingEl.addEventListener("change", handleFullSelfDrivingSelection);

window.addEventListener("beforeunload", saveToLocalStorage);
window.addEventListener("load", loadFromLocalStorage);
