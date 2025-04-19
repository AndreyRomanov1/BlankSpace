function loadLeftPanel() {
  const leftPanel = document.getElementById("left-panel");
  leftPanel.innerHTML = `
      <div class = "left-panel-header">
        <div class="text-opros">Сессии:</div>
        <button class="upload">+</button>
      </div>
      <div id="survey-list"></div>
    `;
  const surveyList = document.getElementById("survey-list");
  SURVEYS.forEach((survey) => {
    const item = document.createElement("div");
    item.className = "survey-item";
    item.dataset.surveyId = survey.id;
    item.innerHTML = `
        <span>${survey.name || "Новый опрос"}</span>
      `;
    item.addEventListener("click", () => {
      currentSurveyName = survey.name;
      changeSurveyHeaderName();
      loadSurvey(survey.id);
    });
    surveyList.appendChild(item);
  });
}

function updateLeftPanelActive(surveyId) {
  const items = document.querySelectorAll(".survey-item");
  items.forEach((item) => {
    if (item.dataset.surveyId === surveyId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function finalizeSurvey(surveyId) {
  const survey = SURVEYS.find((s) => s.id === surveyId);
  if (!survey) return;
  const incomplete = checkSurveyCompletion(survey);
  if (incomplete.length > 0) {
    alert("Ответьте на все вопросы left");
  } else {
    console.log("Опрос завершён. Итоговые ответы:", survey.answers);
  }
}

function generateQuestionId(prefix, index) {
  const questionNumber = index + 1;
  return prefix ? `${prefix}.${questionNumber}` : `q${questionNumber}`;
}

function checkSurveyCompletion(survey) {
  console.log("--- Starting Check ---");
  const missing = [];
  const answers = survey.answers || {};
  console.log("Current Answers:", JSON.stringify(answers));

  function checkQuestions(questions, prefix = "") {
    if (!questions || questions.length === 0) {
      return;
    }

    questions.forEach((q, index) => {
      const qId = generateQuestionId(prefix, index);
      const currentAnswer = answers[qId];

      console.log(
        `Checking QID: ${qId} | Answer: ${currentAnswer} | Type: ${q.questionType}`
      );

      if (!currentAnswer || currentAnswer === "") {
        console.warn(`MISSING or empty answer for QID: ${qId}`);
        missing.push(qId);
      }

      if (
        q.questionType === 0 &&
        currentAnswer &&
        q.subQuestionsByAnswer &&
        q.subQuestionsByAnswer[currentAnswer]
      ) {
        console.log(
          `Recursion into branch for QID: ${qId}, Answer: ${currentAnswer}`
        );
        checkQuestions(q.subQuestionsByAnswer[currentAnswer], qId);
      } else if (q.questionType === 0) {
        if (!currentAnswer) {
          console.log(
            `No recursion for QID: ${qId} because answer is missing.`
          );
        } else if (
          !q.subQuestionsByAnswer ||
          !q.subQuestionsByAnswer[currentAnswer]
        ) {
          console.log(
            `No recursion for QID: ${qId} because no subQuestions defined for answer: ${currentAnswer}`
          );
        }
      }
    });
  }

  checkQuestions(survey.json.questions, "");
  console.log("--- Check Finished ---");
  console.log("Final Missing IDs:", missing);
  return missing;
}
