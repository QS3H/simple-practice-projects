const btnEl = document.getElementById("btn");
const accessKey = "E419D2g6TYhKQ7looPP8sKDCbdiVfn5dzQweXaZcedc";
const errorMessage = document.getElementById("errorMessage");
const galleryEl = document.getElementById("gallery");

async function fetchImage() {
  const inputValue = document.getElementById("input").value;
  if (inputValue > 10 || inputValue < 1) {
    errorMessage.style.display = "block";
    errorMessage.innerText = "Please enter a number between 1 and 10";
    return;
  }
  imgs = "";
  try {
    btnEl.style.display = "none";
    const loading = `<img src="spinner.svg">`;
    galleryEl.innerHTML = loading;
    await fetch(
      `https://api.unsplash.com/photos?per_page=${inputValue}&page=${Math.round(
        Math.random() * 1000
      )}&client_id=${accessKey}`
    ).then((res) => {
      res.json().then((data) => {
        if (data) {
          data.forEach((item) => {
            imgs += `<img src=${item.urls.small} alt="image" />`;
            galleryEl.style.display = "block";
            galleryEl.innerHTML = imgs;
            btnEl.style.display = "block";
            errorMessage.style.display = "none";
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
    errorMessage.style.display = "block";
    errorMessage.innerText = "Something went wrong. Please try again later";
    btnEl.style.display = "block";
  }
}

btnEl.addEventListener("click", fetchImage);
