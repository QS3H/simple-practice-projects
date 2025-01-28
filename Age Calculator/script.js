const userInput = document.getElementById("date");
userInput.max = new Date().toISOString().split("T")[0];
const result = document.getElementById("result");

function calculateAge() {
  const birthDate = new Date(userInput.value);
  const today = new Date();

  let year3 = today.getFullYear() - birthDate.getFullYear();
  let month3 = today.getMonth() - birthDate.getMonth();
  let day3 = today.getDate() - birthDate.getDate();

  if (day3 < 0) {
    month3--;
    day3 += getDaysInMonth(today.getFullYear(), today.getMonth());
  }

  if (month3 < 0) {
    year3--;
    month3 += 12;
  }

  result.innerHTML = `You are <span>${year3}</span> years, <span>${month3}</span> months and <span>${day3}</span> days old`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
