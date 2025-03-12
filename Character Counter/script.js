const textAreaElement = document.getElementById("textarea");
const totalCharactersElement = document.getElementById("total-characters");
const remainingCharacterElement = document.getElementById(
  "remaining-characters"
);

textAreaElement.addEventListener("keyup", () => {
  const totalCharacters = textAreaElement.value.length;
  const remainingCharacters = 120 - totalCharacters;
  totalCharactersElement.textContent = totalCharacters;
  remainingCharacterElement.textContent = remainingCharacters;
});
