let turn = "X";
let title = document.querySelector(".title");
let sqrs = [];

function main(num1, num2, num3) {
  title.innerText = `Player ${sqrs[num1]} Wins!`;
  document.getElementById("item" + num1).style.background = "green";
  document.getElementById("item" + num2).style.background = "green";
  document.getElementById("item" + num3).style.background = "green";
  setInterval(() => {
    title.innerHTML += ".";
  }, 1000);
  setTimeout(() => {
    location.reload();
  }, 4000);
}

function checkWin() {
  for (let i = 1; i <= 9; i++) {
    sqrs[i] = document.getElementById("item" + i).innerText;
  }

  if (sqrs[1] === sqrs[2] && sqrs[2] === sqrs[3] && sqrs[1] !== "") {
    main(1, 2, 3);
  } else if (sqrs[4] === sqrs[5] && sqrs[5] === sqrs[6] && sqrs[4] !== "") {
    main(4, 5, 6);
  } else if (sqrs[7] === sqrs[8] && sqrs[8] === sqrs[9] && sqrs[7] !== "") {
    main(7, 8, 9);
  } else if (sqrs[1] === sqrs[4] && sqrs[4] === sqrs[7] && sqrs[1] !== "") {
    main(1, 4, 7);
  } else if (sqrs[2] === sqrs[5] && sqrs[5] === sqrs[8] && sqrs[2] !== "") {
    main(2, 5, 8);
  } else if (sqrs[3] === sqrs[6] && sqrs[6] === sqrs[9] && sqrs[3] !== "") {
    main(3, 6, 9);
  } else if (sqrs[1] === sqrs[5] && sqrs[5] === sqrs[9] && sqrs[1] !== "") {
    main(1, 5, 9);
  } else if (sqrs[3] === sqrs[5] && sqrs[5] === sqrs[7] && sqrs[3] !== "") {
    main(3, 5, 7);
  }
}

function performLogic(tileId) {
  let element = document.getElementById(tileId);
  if (turn === "X" && element.innerText === "") {
    element.innerText = "X";
    turn = "O";
    title.innerText = "Player O's Turn";
  } else if (turn === "O" && element.innerText === "") {
    element.innerText = "O";
    turn = "X";
    title.innerText = "Player X's Turn";
  }
  checkWin();
}
