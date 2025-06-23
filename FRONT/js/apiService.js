class ApiService {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append("formFile", file);

    const response = await fetch(`${globalState.baseApiUrl}/FileStorage`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ошибка загрузки шаблона: ${response.status}, ${errorText}`
      );
    }
    return (await response.text()).replace(/"/g, "").replace(/'/g, "");
  }

  async getSurveyStructure(fileId) {
    const response = await fetch(
      `${globalState.baseApiUrl}/Survey?fileId=${fileId}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(
        `Ошибка получения структуры опроса: ${JSON.stringify(errorJson)}`
      );
    }
    return await response.json();
  }

  async submitSurveyData(surveyResult) {
    const response = await fetch(`${globalState.baseApiUrl}/Survey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(surveyResult),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  }

  async downloadFinalFile(guid) {
    const response = await fetch(
      `${globalState.baseApiUrl}/FileStorage/${guid}`
    );
    if (!response.ok) {
      throw new Error(`Ошибка скачивания файла: ${response.status}`);
    }
    return await new Response(response.body).blob();
  }

  async synchronizeSurveysWithServer() {
    console.log("Запуск синхронизации сессий с сервером...");
    const surveysFromStorage = [...globalState.surveys];
    if (surveysFromStorage.length === 0) {
      console.log("Нет локальных сессий для синхронизации.");
      return;
    }

    if (!globalState.baseApiUrl) {
      console.error("API URL не установлен. Синхронизация отменена.");
      return;
    }

    const results = [];

    for (const survey of surveysFromStorage) {
      if (survey) {
        let item;
        try {
          const tryToGet = await this.getSurveyStructure(survey.fileId);
          item = {
            survey: survey,
            file: tryToGet,
          };
        } catch {
          item = {
            survey: survey,
            file: false,
          };
        }
        results.push(item);
      }
    }

    const validSurveys = [];
    results.forEach((result) => {
      console.log(result);
      if (!result.file) {
        console.log(
          `Сессия "${result.survey.name}" (ID: ${result.survey.fileId}) не найдена на сервере (статус: 404). Удаляется локально.`
        );
      } else {
        validSurveys.push(result.survey);
      }
    });

    globalState.setAllSurveys(validSurveys);

    const currentSurveyId = globalState.currentSurvey;
    if (
      currentSurveyId &&
      !validSurveys.some((s) => s.id === currentSurveyId)
    ) {
      console.log("Текущая активная сессия была удалена. Сбрасываем выбор.");
      globalState.setCurrentSurvey(null);
    }

    console.log(
      `Синхронизация завершена. Осталось ${validSurveys.length} валидных сессий.`
    );
  }
}

const apiService = new ApiService(globalState);
