const checkBtnEl = document.getElementById("check-btn");
const inputTextEl = document.getElementById("text-input");
const resultEl = document.getElementById("result");
const alertEl = document.getElementById("alert-box");

checkBtnEl.addEventListener("click", () => {
  let inputText = inputTextEl.value;
  if (inputText === "") {
    alertEl.textContent = "Please input a value";
    alert("Please input a value");
  } else if (inputText.length === 1) {
    resultEl.textContent = `${inputText} is a palindrome`;
  } else {
    checkPalindrome(inputText);
  }
});

const checkPalindrome = (inputText) => {
  let newText = inputText.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  let textLength = newText.length;
  let halfLength = Math.floor(textLength / 2);
  let result = resultEl;

  for (let i = 0; i < halfLength; i++) {
    if (newText[i] !== newText[textLength - 1 - i]) {
      result.textContent = `${inputText} is not a palindrome`;
      return;
    }
    result.textContent = `${inputText} is a palindrome`;
  }
};
