const randomQuoteApi = "https://qapi.vercel.app/api/random";
const quoteElement = document.getElementById("quote");
const quoteInput = document.getElementById("input");
const timerElement = document.getElementById("timer");

quoteElement.addEventListener("input", () => {});

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
  } catch (error) {
    console.error("Error fetching quote:", error);
    quoteElement.innerText = "Failed to load quote. Please try again.";
  }
}

renderQuote();
