const randomQuoteApi = "https://qapi.vercel.app/api/random";
const quoteElement = document.getElementById("quote");
const quoteInput = document.getElementById("input");
const timerElement = document.getElementById("timer");

quoteInput.addEventListener("input", () => {
  const quoteArray = quoteElement.querySelectorAll("span");
  const quoteValue = quoteInput.value.split("");
  let correct = true;

  quoteArray.forEach((charSpan, index) => {
    const character = quoteValue[index];
    if (character === undefined) {
      charSpan.classList.remove("correct");
      charSpan.classList.remove("incorrect");
      correct = false;
    } else if (character === charSpan.innerText) {
      charSpan.classList.add("correct");
      charSpan.classList.remove("incorrect");
    } else {
      charSpan.classList.remove("correct");
      charSpan.classList.add("incorrect");
      correct = false;
    }
  });

  if (correct) renderQuote();
});

function getRandomQuote() {
  return fetch(randomQuoteApi)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data.quote) {
        throw new Error("Invalid data format");
      }
      return data.quote;
    });
}

async function renderQuote() {
  try {
    const quote = await getRandomQuote();
    if (typeof quote !== "string") {
      throw new Error("Quote is not a string");
    }
    quoteElement.innerHTML = "";

    quote.split("").forEach((char) => {
      const charSpan = document.createElement("span");
      charSpan.innerText = char;
      quoteElement.appendChild(charSpan);
    });
    quoteInput.value = null;
    timer();
  } catch (error) {
    console.error("Error fetching quote:", error);
    quoteElement.innerText = "Failed to load quote. Please try again.";
  }
}

let startTime;
function timer() {
  timerElement.innerText = 0;
  startTime = new Date();

  setInterval(() => {
    timerElement.innerText = getTime();
  }, 1000);
}

function getTime() {
  return Math.floor((new Date() - startTime) / 1000);
}

renderQuote();
