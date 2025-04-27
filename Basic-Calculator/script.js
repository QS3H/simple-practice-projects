const buttonsEl = document.querySelectorAll("button");
const inputFieldEl = document.getElementById("result");

for (let i = 0; i < buttonsEl.length; i++) {
  buttonsEl[i].addEventListener("click", (e) => {
    const buttonValue = buttonsEl[i].textContent;
    // Ripple animation
    buttonsEl[i].classList.remove("ripple");
    void buttonsEl[i].offsetWidth; // force reflow for animation restart
    buttonsEl[i].classList.add("ripple");
    setTimeout(() => buttonsEl[i].classList.remove("ripple"), 450);
    if (buttonValue === "C") {
      clearResult();
    } else if (buttonValue === "=") {
      calculateResult();
    } else {
      appendValue(buttonValue);
    }
  });
}

function clearResult() {
  inputFieldEl.value = "";
}

function calculateResult() {
  try {
    inputFieldEl.value = eval(inputFieldEl.value);
    animateResult();
  } catch {
    inputFieldEl.value = "Error";
    animateResult();
  }
}

function appendValue(buttonValue) {
  if (inputFieldEl.value === "Error") inputFieldEl.value = "";
  inputFieldEl.value += buttonValue;
}

function animateResult() {
  inputFieldEl.classList.remove("animated");
  void inputFieldEl.offsetWidth;
  inputFieldEl.classList.add("animated");
  setTimeout(() => inputFieldEl.classList.remove("animated"), 400);
}

// Animate calculator entrance on load
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.animated-card').style.animationPlayState = 'running';
});
