function generateQuestionId(prefix, index) {
  const questionNumber = index + 1;
  return prefix ? `${prefix}.${questionNumber}` : `q${questionNumber}`;
}

function changeSurveyHeaderName() {
  const surveNameHolder = document.querySelector(".nameFile");
  const currentSurvey = globalState.getCurrentSurvey();
  if (!currentSurvey) {
    surveNameHolder.textContent = "";
    surveNameHolder.title = "Выберите опрос для просмотра";
    return;
  }
  const name = currentSurvey.name.replace(/\.[^/.]+$/, "");
  surveNameHolder.title = name;
  if (name.length > 5) {
    surveNameHolder.textContent = `${name.slice(0, 15)}...`;
  } else {
    surveNameHolder.textContent = name;
  }
}

function clearSurveyPlace() {
  const container = document.getElementById("survey-container");
  container.innerHTML = "";
}
