let SURVEYS = [];
let currentSurveyId = null;
let currentSurveyName = "";
localStorage.setItem("surveys", JSON.stringify(SURVEYS));

function loadSurveysFromStorage() {
  const data = localStorage.getItem("surveys");
  SURVEYS = data ? JSON.parse(data) : [];
}

function saveSurveysToStorage() {
  localStorage.setItem("surveys", JSON.stringify(SURVEYS));
}

function changeSurveyHeaderName() {
  const surveNameHolder = document.querySelector(".nameFile");
  if (currentSurveyName.length != 0) {
    surveNameHolder.textContent = currentSurveyName;
  }
}
