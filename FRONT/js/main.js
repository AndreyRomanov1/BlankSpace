function generateQuestionId(prefix, index) {
  const questionNumber = index + 1;
  return prefix ? `${prefix}.${questionNumber}` : `q${questionNumber}`;
}

function renderSurvey(survey) {
  const container = document.getElementById("survey-container");
  container.innerHTML = "";
  if (!survey.json || !survey.json.questions) {
    container.innerHTML = "<p style='color:red;'>Нет данных опроса.</p>";
    return;
  }
  renderQuestions(survey.json.questions, container, survey, "", "");

  const submitBtn = document.querySelector("#submitBtn");
  submitBtn.addEventListener("click", () => {
    finalizeCurrentSurvey();
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
      input.addEventListener("change", (event) => {
        survey.answers[questionId] = event.target.value;
        saveSurveysToStorage();
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
            saveSurveysToStorage();
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

function convertFlatAnswers(flatAnswers) {
  const nestedAnswers = {};

  Object.keys(flatAnswers).forEach((key) => {
    const value = flatAnswers[key];

    const keys = key.split(".");

    let current = nestedAnswers;

    for (let i = 0; i < keys.length - 1; i++) {
      const part = keys[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    current[keys[keys.length - 1]] = value;
  });
  return nestedAnswers;
}

function convertFlatAnswers(flatAnswers) {
  const nestedAnswers = {};
  Object.keys(flatAnswers).forEach((key) => {
    const value = flatAnswers[key];
    const keys = key.split(".");
    let current = nestedAnswers;
    for (let i = 0; i < keys.length - 1; i++) {
      const part = keys[i];

      if (!(part in current)) {
        current[part] = {};
      } else if (typeof current[part] !== "object" || current[part] === null) {
        current[part] = { _value: current[part] };
      }
      current = current[part];
    }
    const lastKey = keys[keys.length - 1];

    if (
      lastKey in current &&
      typeof current[lastKey] === "object" &&
      current[lastKey] !== null
    ) {
      current[lastKey]._value = value;
    } else {
      current[lastKey] = value;
    }
  });
  return nestedAnswers;
}

async function finalizeCurrentSurvey() {
  const survey = SURVEYS.find((s) => s.id === currentSurveyId);
  if (!survey) return;
  const incomplete = checkSurveyCompletionMain(survey);
  if (incomplete.length > 0) {
    alert("Ответьте на все вопросы main");
    return;
  }

  // alert("Ответы в выводе на консоль");

  const GUID = (await submitSurvey(survey.answers, survey.fileId)).fileId;

  console.log(GUID);

  const readableStream = (
    await fetch(`http://localhost:5159/api/FileStorage/${GUID}`)
  ).body;

  const file = URL.createObjectURL(await new Response(readableStream).blob());

  const link = document.createElement("a");
  link.href = file;
  link.download = currentSurveyName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function submitSurvey(frontendResults, fileId) {
  const backendData = createSurveyResult(frontendResults, fileId);

  try {
    const response = await fetch("http://localhost:5159/api/Survey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка при отправке опроса:", {
      error: error.message,
      requestPayload: backendData,
    });
    throw error;
  }
}

function createSurveyResult(flatAnswers, fileId) {
  const currentSurvey = SURVEYS.find((s) => s.id === currentSurveyId);

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

function checkSurveyCompletionMain(survey) {
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
