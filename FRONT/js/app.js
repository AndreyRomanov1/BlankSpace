document.addEventListener("DOMContentLoaded", () => {
  loadSurveysFromStorage();


  const header= document.getElementById("header-container")
  header.innerHTML = `
    <header class="header">
      <div class="header__container">
        <h1 class="nameFile"></h1>
        <button id="submitBtn" class="done" disabled>Готово</button>
      </div>
    </header>
  `;

  loadLeftPanel();
  loadSurveyMenu();

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
