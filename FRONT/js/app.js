document.addEventListener("DOMContentLoaded", () => {
  loadSurveysFromStorage();

  document.getElementById("header-container").innerHTML = `
    <header class="header">
      <div class="header__container">
        <h1 class="nameFile"></h1>
        <button id="submitBtn" class="done" disabled>Готово</button>
      </div>
    </header>
  `;

  loadLeftPanel();

  if (currentSurveyId) {
    loadSurvey(currentSurveyId);
  }
});


function loadSurvey(surveyId) {
  currentSurveyId = surveyId;
  const survey = SURVEYS.find((s) => s.id === surveyId);

  if (survey) {
    renderSurvey(survey);
    updateLeftPanelActive(surveyId);
  }
}
