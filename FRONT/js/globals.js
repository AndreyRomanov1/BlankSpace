let SURVEYS = [];
let currentSurveyId = null;
let currentSurveyName = "";
var surveyData = null;
var FILE = null;
var baseApiUrl;
fetch("config.json")
  .then((r) => r.json())
  .then((r) => {
    baseApiUrl = r.apiUrl;
  });

localStorage.setItem("surveys", JSON.stringify(SURVEYS));

function loadSurveysFromStorage() {
  const data = localStorage.getItem("surveys");
  SURVEYS = data ? JSON.parse(data) : [];
}

function saveSurveysToStorage() {
  localStorage.setItem("surveys", JSON.stringify(SURVEYS));
}

function clearSurveyPlace() {
  const container = document.getElementById("survey-container");
  container.innerHTML = "";
}

function changeSurveyHeaderName() {
  const surveNameHolder = document.querySelector(".nameFile");
  if (currentSurveyName.length > 5) {
    surveNameHolder.textContent = `${currentSurveyName.slice(0, 5)}...`;
  } else {
    surveNameHolder.textContent = currentSurveyName;
  }
}
