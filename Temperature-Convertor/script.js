const celsiusEl = document.getElementById("celsius");
const fahrenheitEl = document.getElementById("fahrenheit");
const kelvinEl = document.getElementById("kelvin");

const calcTemp = (event) => {
  const currentValue = +event.target.value;
  const eventName = event.target.name;

  switch (eventName) {
    case "celsius":
      kelvinEl.value = (currentValue + 273.32).toFixed(2);
      fahrenheitEl.value = (currentValue * 1.8 + 32).toFixed(2);
      break;
    case "fahrenheit":
      celsiusEl.value = ((currentValue - 32) / 1.8).toFixed(2);
      kelvinEl.value = ((currentValue + -32) / 1.8 + 273.32).toFixed(2);
      break;
    case "kelvin":
      celsiusEl.value = (currentValue - 273.32).toFixed(2);
      fahrenheitEl.value = ((currentValue - 273.32) * 1.8 + 32).toFixed(2);
    default:
      break;
  }
};
