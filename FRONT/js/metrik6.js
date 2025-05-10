function saveMetrik(id) {
  let currentMetrik = JSON.parse(localStorage.getItem("metrik"));
  if (!currentMetrik) {
    currentMetrik = {};
  }
  if (typeof currentMetrik[id] == "number") {
    currentMetrik[id] += 1;
  } else {
    currentMetrik[id] = 0;
  }
  console.log(`Метрика: ${getMetrikValue(currentMetrik)}`);
  localStorage.setItem("metrik", JSON.stringify(currentMetrik));
}

function getMetrikValue(metrikJson) {
  var result = 0;
  for (value of Object.values(metrikJson)) {
    result += value;
  }

  return result;
}
