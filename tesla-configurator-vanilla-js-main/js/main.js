const topBar = document.getElementById("top-bar");
const exteriorColors = document.getElementById("exterior-buttons");
const interiorColors = document.getElementById("interior-buttons");
const exteriorImage = document.getElementById("exterior-image");
const interiorImage = document.getElementById("interior-image");

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
  "Solid Black": "./images/model-y-solid-black-grey.jpg",
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
}

// Add Event Listener for Top Bar On Scroll
window.addEventListener("scroll", () =>
  requestAnimationFrame(handleTopBarOnScroll)
);
exteriorColors.addEventListener("click", handleColorSelection);
interiorColors.addEventListener("click", handleColorSelection);
