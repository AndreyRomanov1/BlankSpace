class GlobalState {
  constructor() {
    this.currentSurvey = null;
    this.surveys = [];
    this.baseApiUrl = null;
  }

  async setBaseApiUrl() {
    const resp = await fetch("config.json");
    const jsonResp = await resp.json();
    this.baseApiUrl = jsonResp.apiUrl;
  }

  getSurvey(id) {
    return this.surveys.filter((s) => s.id == id)[0];
  }

  setCurrentSurvey(id) {
    this.currentSurvey = id;
    saveSurveysToStorage();
  }

  getCurrentSurvey() {
    return this.getSurvey(this.currentSurvey);
  }

  addFile(survey) {
    this.surveys.push(survey);
    saveSurveysToStorage();
  }

  setAllSurveys(surveys) {
    this.surveys = [...surveys];
    saveSurveysToStorage();
  }

  resetSurveyData() {
    this.deleteSurvey(this.currentSurvey);
    saveSurveysToStorage();
  }

  deleteSurvey(surveyId) {
    const surveyWasCurrent = this.currentSurvey === surveyId;

    this.surveys = this.surveys.filter((survey) => survey.id != surveyId);
    if (surveyWasCurrent) {
      this.currentSurvey = null;
    }

    saveSurveysToStorage();
  }

  changeSurveyName(name, surveyId) {
    const survey = this.getSurvey(surveyId);
    if (survey) {
      survey.name = name;
    }
    saveSurveysToStorage();
  }
}

const globalState = new GlobalState();
loadSurveysFromStorage();

function loadSurveysFromStorage() {
  const data = localStorage.getItem("surveys");
  globalState.setAllSurveys(data ? JSON.parse(data) : []);
}

function saveSurveysToStorage() {
  localStorage.setItem("surveys", JSON.stringify(globalState.surveys));
}
