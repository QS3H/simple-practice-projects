// Age Calculator - Optimized, Upgraded & Animated
const userInput = document.getElementById("date");
const result = document.getElementById("result");
const form = document.getElementById("age-form");
const copyBtn = document.getElementById("copy-btn");
const themeToggle = document.getElementById("theme-toggle");
const resetBtn = document.getElementById("reset-btn");

// Set max date to today
userInput.max = new Date().toISOString().split("T")[0];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function calculateAge(birthDateStr) {
  if (!birthDateStr) return { error: "Please enter your birth date." };
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  if (birthDate > today) return { error: "Birth date cannot be in the future." };
  let year = today.getFullYear() - birthDate.getFullYear();
  let month = today.getMonth() - birthDate.getMonth();
  let day = today.getDate() - birthDate.getDate();
  if (day < 0) {
    month--;
    day += getDaysInMonth(today.getFullYear(), today.getMonth() - 1);
  }
  if (month < 0) {
    year--;
    month += 12;
  }
  return { year, month, day };
}

function showResult(ageObj) {
  if (ageObj.error) {
    result.innerHTML = `<span style='color:#e57373;'>${ageObj.error}</span>`;
    result.classList.remove("visible");
    copyBtn.style.display = "none";
    return;
  }
  result.innerHTML = `You are <span>${ageObj.year}</span> years, <span>${ageObj.month}</span> months and <span>${ageObj.day}</span> days old.`;
  result.classList.add("visible");
  // Animate each span
  setTimeout(() => {
    document.querySelectorAll('#result span').forEach((el, idx) => {
      el.style.animationDelay = (0.2 + idx * 0.15) + 's';
      el.style.animationName = 'bounceIn';
    });
  }, 10);
  copyBtn.style.display = "block";
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const ageObj = calculateAge(userInput.value);
  showResult(ageObj);
});

userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    form.requestSubmit();
  }
});

resetBtn.addEventListener("click", function () {
  form.reset();
  result.textContent = "";
  result.classList.remove("visible");
  copyBtn.style.display = "none";
});

copyBtn.addEventListener("click", function () {
  if (result.textContent) {
    navigator.clipboard.writeText(result.textContent);
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "Copy Result";
      copyBtn.classList.remove("copied");
    }, 1200);
  }
});

// Dark mode toggle
function setTheme(mode) {
  document.body.setAttribute("data-theme", mode);
  themeToggle.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
  themeToggle.textContent = mode === "dark" ? "☀️" : "🌙";
  localStorage.setItem("agecalc-theme", mode);
  // Animate theme icon
  themeToggle.style.transition = 'transform 0.5s cubic-bezier(.68,-0.55,.27,1.55)';
  themeToggle.style.transform = 'rotate(360deg) scale(1.2)';
  setTimeout(() => themeToggle.style.transform = '', 500);
}

themeToggle.addEventListener("click", function () {
  const isDark = document.body.getAttribute("data-theme") === "dark";
  setTheme(isDark ? "light" : "dark");
});

// On load, set theme from localStorage
(function () {
  const saved = localStorage.getItem("agecalc-theme");
  setTheme(saved === "dark" ? "dark" : "light");
})();

// Animate calculator entrance on load
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.calculator').style.animationPlayState = 'running';
});
