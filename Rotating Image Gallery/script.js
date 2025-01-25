const containerEl = document.querySelector(".container");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let deg = 0;
let timeOut = 0;

prevBtn.addEventListener("click", () => {
  deg += 45;
  clearTimeout(timeOut);
  updateGallery();
});

nextBtn.addEventListener("click", () => {
  deg -= 45;
  clearTimeout(timeOut);
  updateGallery();
});

const updateGallery = () => {
  containerEl.style.transform = `perspective(1000px) rotateY(${deg}deg)`;
  timeOut = setTimeout(() => {
    deg -= 45;
    updateGallery();
  }, 3000);
};

updateGallery();
