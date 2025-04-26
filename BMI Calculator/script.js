// --- Advanced BMI Calculator ---
const btnEl = document.getElementById("btn");
const inputEl = document.getElementById("bmi-result");
const weightConditionEl = document.getElementById("weight-condition");
const bmiValueEl = document.getElementById("bmi-value");
const bmiProgressBar = document.getElementById("bmi-progress-bar");
const infoIcon = document.getElementById("info-icon");
const bmiInfoPopup = document.getElementById("bmi-info-popup");
const errorMessage = document.getElementById("error-message");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");
const unitRadios = document.getElementsByName("unit");
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");

// Helper: Get selected unit
function getSelectedUnit() {
  return Array.from(unitRadios).find(r => r.checked).value;
}

// Helper: Show error
function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 2000);
}

// Helper: Save and load history
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  historyList.innerHTML = "";
  history.slice(-10).reverse().forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.value} (${item.category})</span> <span style='font-size:0.9em;color:#888;'>${item.date}</span>`;
    historyList.appendChild(li);
  });
}
function saveToHistory(bmi, category) {
  const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  history.push({ value: bmi, category, date: new Date().toLocaleString() });
  localStorage.setItem("bmiHistory", JSON.stringify(history));
  loadHistory();
}
function clearHistory() {
  localStorage.removeItem("bmiHistory");
  loadHistory();
}

// Calculate BMI
function calculateBMI() {
  let height = parseFloat(heightInput.value);
  let weight = parseFloat(weightInput.value);
  const unit = getSelectedUnit();
  if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
    showError("Please enter valid height and weight.");
    inputEl.value = "";
    weightConditionEl.innerText = "";
    bmiValueEl.textContent = "";
    bmiProgressBar.style.width = "0%";
    return;
  }
  // Convert imperial to metric if needed
  if (unit === "imperial") {
    height = height * 2.54; // inches to cm
    weight = weight * 0.453592; // lb to kg
  }
  const heightM = height / 100;
  const bmiValue = weight / (heightM * heightM);
  const bmiFixed = bmiValue.toFixed(1);
  inputEl.value = bmiFixed;
  bmiValueEl.textContent = bmiFixed;
  // Animate progress bar (BMI 0-40 mapped to 0-100%)
  let percent = Math.min((bmiValue / 40) * 100, 100);
  bmiProgressBar.style.width = percent + "%";
  // Set category
  let category = "";
  if (bmiValue < 18.5) category = "Underweight";
  else if (bmiValue < 25) category = "Normal";
  else if (bmiValue < 30) category = "Overweight";
  else category = "Obesity";
  weightConditionEl.innerText = category;
  saveToHistory(bmiFixed, category);
}

btnEl.addEventListener("click", calculateBMI);

// Info popup
infoIcon.addEventListener("click", () => {
  bmiInfoPopup.classList.toggle("show");
});
document.addEventListener("click", (e) => {
  if (!bmiInfoPopup.contains(e.target) && e.target !== infoIcon) {
    bmiInfoPopup.classList.remove("show");
  }
});

// Clear history
clearHistoryBtn.addEventListener("click", clearHistory);

// Load history on page load
function showHistoryPanel() {
  historyPanel.classList.add("show");
}
window.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  setTimeout(showHistoryPanel, 200); // slight delay for entrance effect
});

// Change placeholders based on unit
unitRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (getSelectedUnit() === "imperial") {
      heightInput.placeholder = "Enter Height in inches";
      weightInput.placeholder = "Enter Weight in lbs";
    } else {
      heightInput.placeholder = "Enter Height in cm";
      weightInput.placeholder = "Enter Weight in kg";
    }
  });
});
