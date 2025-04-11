document.addEventListener("DOMContentLoaded", () => {
  loadSurveysFromStorage();

  loadComponent(
    "components/header.html",
    document.getElementById("header-container")
  );
  loadLeftPanel();

  if (currentSurveyId) {
    loadSurvey(currentSurveyId);
  }
});

async function loadComponent(url, container) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error("Ошибка загрузки компонента:", url, error);
  }
}

function loadSurvey(surveyId) {
  currentSurveyId = surveyId;
  const survey = SURVEYS.find((s) => s.id === surveyId);
  if (survey) {
    renderSurvey(survey);
    updateLeftPanelActive(surveyId);
  }
}
