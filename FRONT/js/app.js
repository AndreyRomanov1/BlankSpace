document.addEventListener("DOMContentLoaded", async () => {
  await new Promise((resolve) =>
    setTimeout(() => {
      const preloader = document.getElementById("preloader");
      const appContainer = document.getElementById("app");
      preloader.style.display = "none";
      appContainer.classList.remove("hidden");
      resolve();
    }, 3000)
  );
  await globalState.setBaseApiUrl();
  await apiService.synchronizeSurveysWithServer();
  loadLeftPanel();
  loadSurveyMenu();

  const currentSurvey = globalState.getCurrentSurvey();
  if (currentSurvey) {
    loadSurvey();
  } else {
    clearSurveyPlace();
    changeSurveyHeaderName();
    updateSubmitButtonState();
  }
});

function loadSurvey() {
  const survey = globalState.getCurrentSurvey();
  if (survey) {
    renderSurvey(survey);
    updateLeftPanelActive(survey.id);
  }
}
