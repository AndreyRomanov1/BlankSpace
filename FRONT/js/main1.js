function renderSurvey(survey) {
  const container = document.getElementById("survey-container");
  container.innerHTML = "";
  if (!survey.json || !survey.json.questions) {
    container.innerHTML = "<p style='color:red;'>Нет данных опроса.</p>";
    return;
  }

  renderQuestions(survey.json.questions, container, survey, "", "");
}

function removeSubAnswers(answers, question, parentQuestionId, selectedAnswer) {
  if (!question.subQuestionsByAnswer) return;

  for (const answerOption in question.subQuestionsByAnswer) {
    if (answerOption !== selectedAnswer) {
      const subQuestions = question.subQuestionsByAnswer[answerOption];
      removeAnswersRecursive(answers, subQuestions, parentQuestionId);
    }
  }
}

function removeAnswersRecursive(answers, questions, prefix) {
  if (!questions || questions.length === 0) return;

  questions.forEach((subQ, index) => {
    const subQId = generateQuestionId(prefix, index);

    delete answers[subQId];

    if (subQ.subQuestionsByAnswer) {
      for (const ansOpt in subQ.subQuestionsByAnswer) {
        removeAnswersRecursive(
          answers,
          subQ.subQuestionsByAnswer[ansOpt],
          subQId
        );
      }
    }
  });
}

function renderQuestions(questions, container, survey, level, prefix) {
  if (!questions || questions.length === 0) return;

  questions.forEach((question, index) => {
    const questionId = generateQuestionId(prefix, index);
    const questionNumberDisplay = (
      prefix ? `${prefix}.${index + 1}` : `${index + 1}`
    ).replace("q", "");

    const questionBlock = document.createElement("div");
    questionBlock.className = "question-block";
    questionBlock.dataset.questionId = questionId;

    const questionTitle = document.createElement("h3");
    questionTitle.textContent = `${questionNumberDisplay}. ${question.name}`;
    questionBlock.appendChild(questionTitle);

    const answerContainer = document.createElement("div");
    answerContainer.className = "answer-container";

    const subQuestionOuterContainer = document.createElement("div");
    subQuestionOuterContainer.className = "subquestion-outer-container";

    if (question.questionType === 1) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "answer-input";
      input.placeholder = `Введите ответ на вопрос ${questionNumberDisplay}`;
      input.name = questionId;
      input.value = survey.answers[questionId] || "";
      input.addEventListener("input", () => {
        survey.answers[questionId] = input.value;
        saveSurveysToStorage();
        updateSubmitButtonState();
        saveMetrik(questionId);
      });
      answerContainer.appendChild(input);
    } else if (question.questionType === 0) {
      const possibleAnswers = Object.keys(question.subQuestionsByAnswer || {});
      if (possibleAnswers.length > 0) {
        possibleAnswers.forEach((answerText) => {
          const answerDiv = document.createElement("div");
          answerDiv.className = "answer-option";

          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = questionId;
          radio.value = answerText;
          radio.id = `${questionId}-answer-${answerText.replace(/\s+/g, "-")}`;

          if (survey.answers[questionId] === answerText) {
            radio.checked = true;
          }

          radio.addEventListener("change", (event) => {
            survey.answers[questionId] = event.target.value;
            handleSubQuestions(
              question,
              event.target.value,
              questionBlock,
              survey,
              questionId
            );

            removeSubAnswers(
              survey.answers,
              question,
              questionId,
              event.target.value
            );

            handleSubQuestions(
              question,
              event.target.value,
              questionBlock,
              survey,
              questionId
            );
            saveSurveysToStorage();
            updateSubmitButtonState();
            saveMetrik(questionId);
          });

          const label = document.createElement("label");
          label.htmlFor = radio.id;
          label.textContent = answerText;
          answerDiv.appendChild(radio);
          answerDiv.appendChild(label);
          answerContainer.appendChild(answerDiv);

          const subContainer = document.createElement("div");
          subContainer.id = `sub-${questionId}-answer-${answerText.replace(
            /\s+/g,
            "-"
          )}`;
          subContainer.className = "subquestion-container";
          subContainer.style.display = "none";
          subQuestionOuterContainer.appendChild(subContainer);
        });

        if (survey.answers[questionId]) {
          setTimeout(() => {
            handleSubQuestions(
              question,
              survey.answers[questionId],
              questionBlock,
              survey,
              questionId
            );
          }, 0);
        }
      } else {
        answerContainer.innerHTML = "<i>Нет вариантов ответа.</i>";
      }
    } else {
      answerContainer.innerHTML = `<i>Неизвестный тип вопроса: ${question.questionType}</i>`;
    }

    questionBlock.appendChild(answerContainer);
    questionBlock.appendChild(subQuestionOuterContainer);
    container.appendChild(questionBlock);
  });
}

function handleSubQuestions(
  question,
  answer,
  parentQuestionBlock,
  survey,
  questionId
) {
  const subQuestionOuterContainer = parentQuestionBlock.querySelector(
    ".subquestion-outer-container"
  );
  if (!subQuestionOuterContainer) return;

  const subContainers = subQuestionOuterContainer.querySelectorAll(
    ".subquestion-container"
  );
  subContainers.forEach((container) => {
    container.style.display = "none";
    container.innerHTML = "";
  });

  const oldSeparator = parentQuestionBlock.querySelector(
    "hr.subquestion-separator"
  );
  if (oldSeparator) oldSeparator.remove();

  const subQuestionsData =
    question.subQuestionsByAnswer && question.subQuestionsByAnswer[answer]
      ? question.subQuestionsByAnswer[answer]
      : null;

  if (subQuestionsData && subQuestionsData.length > 0) {
    const targetSubContainerId = `sub-${questionId}-answer-${answer.replace(
      /\s+/g,
      "-"
    )}`;
    const targetSubContainer = document.getElementById(targetSubContainerId);

    if (targetSubContainer) {
      const separator = document.createElement("hr");
      separator.className = "subquestion-separator";
      parentQuestionBlock.insertBefore(separator, subQuestionOuterContainer);

      const nextPrefix = questionId;
      renderQuestions(
        subQuestionsData,
        targetSubContainer,
        survey,
        0,
        nextPrefix
      );
      targetSubContainer.style.display = "block";
    }
  }
}

async function finalizeCurrentSurvey() {
  const survey = globalState.getCurrentSurvey();
  if (!survey) return;
  const incomplete = checkSurveyCompletion(survey);
  if (incomplete.length > 0) {
    alert("Ответьте на все вопросы main");
    return;
  }

  const GUID = (await submitSurvey(survey.answers, survey.fileId)).fileId;

  const file = await apiService.downloadFinalFile(GUID);

  if (window.showSaveFilePicker) {
    try {
      const opts = {
        suggestedName: globalState.getCurrentSurvey().name,
        types: [
          {
            description: "Документ",
            accept: {
              "application/octet-stream": [".docx", ".doc", ".txt"],
            },
          },
        ],
      };

      const fileHandle = await window.showSaveFilePicker(opts);
      const writable = await fileHandle.createWritable();

      await writable.write(file);

      await writable.close();

      console.log("Файл сохранён пользователем.");
    } catch (err) {}
  } else {
    const fileURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = globalState.getCurrentSurvey().name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(
      "Ваш браузер не поддерживает showSaveFilePicker. Выполнена обычная загрузка."
    );
  }
}

async function submitSurvey(frontendResults, fileId) {
  const backendData = createSurveyResult(frontendResults, fileId);

  try {
    return await apiService.submitSurveyData(backendData);
  } catch (error) {
    console.error("Ошибка при отправке опроса:", {
      error: error.message,
      requestPayload: backendData,
    });
    throw error;
  }
}

function createSurveyResult(flatAnswers, fileId) {
  const currentSurvey = globalState.getCurrentSurvey();

  if (!currentSurvey || !currentSurvey.json || !currentSurvey.json.questions) {
    console.error("Не удалось найти текущий опрос или его структуру вопросов.");
    return null;
  }

  const originalQuestions = currentSurvey.json.questions;

  const mapQuestionTypeToString = (typeNumber) => {
    if (typeNumber === 0) return 0;
    if (typeNumber === 1) return 1;
    console.warn("Обнаружен неизвестный числовой тип вопроса:", typeNumber);

    return null;
  };

  function processQuestionsRecursive(questions, prefix, isPathActive) {
    if (!questions || questions.length === 0) {
      return [];
    }

    return questions.map((question, index) => {
      const questionId = generateQuestionId(prefix, index);
      const userAnswerForThisLevel = flatAnswers[questionId];
      const finalAnswer = isPathActive ? userAnswerForThisLevel || null : null;

      const backendQuestionType = mapQuestionTypeToString(
        question.questionType
      );

      const processedQuestion = {
        questionType: backendQuestionType,

        name: question.name,
        subQuestionsByAnswer: {},
        questionAnswer: finalAnswer,
      };

      if (
        question.questionType === 0 &&
        question.subQuestionsByAnswer &&
        Object.keys(question.subQuestionsByAnswer).length > 0
      ) {
        processedQuestion.subQuestionsByAnswer = {};
        for (const answerOption in question.subQuestionsByAnswer) {
          const originalSubQuestions =
            question.subQuestionsByAnswer[answerOption] || [];
          const isSubPathNowActive =
            isPathActive && userAnswerForThisLevel === answerOption;

          processedQuestion.subQuestionsByAnswer[answerOption] =
            processQuestionsRecursive(
              originalSubQuestions,
              questionId,
              isSubPathNowActive
            );
        }
      } else if (question.subQuestionsByAnswer) {
        processedQuestion.subQuestionsByAnswer = {
          ...question.subQuestionsByAnswer,
        };
      }

      return processedQuestion;
    });
  }

  const answeredQuestions = processQuestionsRecursive(
    originalQuestions,
    "",
    true
  );

  return {
    fileId: fileId,
    answeredQuestions: answeredQuestions,
  };
}

function checkSurveyCompletion(survey) {
  const missing = [];
  const answers = survey.answers || {};

  function checkQuestions(questions, prefix = "") {
    if (!questions || questions.length === 0) {
      return;
    }

    questions.forEach((q, index) => {
      const qId = generateQuestionId(prefix, index);

      if (!answers[qId] || answers[qId] === "") {
        missing.push(qId);
      }

      if (
        q.questionType === 0 &&
        answers[qId] &&
        q.subQuestionsByAnswer &&
        q.subQuestionsByAnswer[answers[qId]]
      ) {
        checkQuestions(q.subQuestionsByAnswer[answers[qId]], qId);
      }
    });
  }

  checkQuestions(survey.json.questions, "");

  return missing;
}

function updateSubmitButtonState() {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  const survey = globalState.getCurrentSurvey();
  if (!survey) {
    submitBtn.disabled = true;
    return;
  }

  const missingQuestions = checkSurveyCompletion(survey);
  submitBtn.disabled = missingQuestions.length > 0;
}
