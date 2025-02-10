const strengthMeter = document.getElementById("strength-meter");
const passwordInput = document.getElementById("password-input");
const suggestions = document.getElementById("suggestions");

passwordInput.addEventListener("input", updateStrengthMeter);

updateStrengthMeter();

function updateStrengthMeter() {
  const weaknesses = checkPasswordStrength(passwordInput.value);

  let strength = 100;
  suggestions.innerHTML = "";

  weaknesses.forEach((weakness) => {
    if (weakness == null) return;
    strength -= weakness.deduction;
    const messageEl = document.createElement("div");
    messageEl.innerText = weakness.message;
    suggestions.appendChild(messageEl);
  });

  strengthMeter.style.setProperty("--strength", strength);
}

function checkPasswordStrength(password) {
  const weaknesses = [];

  weaknesses.push(checkLengthWeakness(password));
  weaknesses.push(lowerCaseWeakness(password));
  weaknesses.push(upperCaseWeakness(password));
  weaknesses.push(numberWeakness(password));
  weaknesses.push(specialCharactersWeakness(password));
  weaknesses.push(repeatCharactersWeakness(password));

  return weaknesses;
}

function checkLengthWeakness(password) {
  const length = password.length;

  if (length <= 5) {
    return {
      message: "Your password is too short",
      deduction: 40,
    };
  }

  if (length <= 10) {
    return {
      message: "Your password could be longer",
      deduction: 15,
    };
  }
}

function upperCaseWeakness(password) {
  return characterTypeWeakness(password, /[A-Z]/g, "uppercase characters");
}

function lowerCaseWeakness(password) {
  return characterTypeWeakness(password, /[a-z]/g, "lowercase characters");
}

function numberWeakness(password) {
  return characterTypeWeakness(password, /[0-9]/g, "numbers");
}

function specialCharactersWeakness(password) {
  return characterTypeWeakness(
    password,
    /[^0-9a-zA-Z\s]/g,
    "special characters"
  );
}

function repeatCharactersWeakness(password) {
  const matches = password.match(/(.)\1/g) || [];

  if (matches.length > 0) {
    return {
      message: "Your password has repeat characters",
      deduction: matches.length * 10,
    };
  }
}

function characterTypeWeakness(password, regex, type) {
  const matches = password.match(regex) || [];

  if (matches.length === 0) {
    return {
      message: `Your password has no ${type}`,
      deduction: 20,
    };
  }

  if (matches.length <= 2) {
    return {
      message: `Your password could use more ${type}`,
      deduction: 5,
    };
  }
}
