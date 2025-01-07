const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

function addTask() {
  if (inputBox.value === "") {
    alert("You must write something!");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);
  }
  inputBox.value = "";
  saveDataOnClose();
}

listContainer.addEventListener(
  "click",
  function (element) {
    if (element.target.tagName === "LI") {
      element.target.classList.toggle("checked");
      saveDataOnClose();
    } else if (element.target.tagName === "SPAN") {
      element.target.parentElement.remove();
      saveDataOnClose();
    }
  },
  false
);

function saveDataOnClose() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showSavedData() {
  listContainer.innerHTML = localStorage.getItem("data");
}
showSavedData();
