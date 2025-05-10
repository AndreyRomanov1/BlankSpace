function setupUploadButtons() {
  const uploadButtons = document.querySelectorAll(".upload");

  uploadButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal();
    });
  });
}

function loadLeftPanel() {
  const leftPanel = document.getElementById("left-panel");
  leftPanel.innerHTML = `
      <div class = "left-panel-header">
        <div class="panel-toggle">
            <img src="../images/toggleLeftIcon.png" alt="Toggle" class="left-panel-icon toggle-icon">
        </div>
        <div class="text-opros">Сессии</div>
        <button class="upload">
            <img src="../images/newFileIcon.png" alt="Upload file" class="left-panel-icon">
        </button>
      </div>
      <div class="collapsed-upload-container">
        <button class="upload collapsed-upload">
            <img src="../images/newFileIcon.png" alt="Upload file" class="left-panel-icon">
        </button>
      </div>
      <div id="survey-list"></div>
    `;
  const toggleBtn = document.querySelector(".panel-toggle");
  if (toggleBtn) {
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');

    const updatePanelState = (isCollapsed) => {
      toggleIcon.src = isCollapsed
          ? "../images/toggleRightIcon.png"
          : "../images/toggleLeftIcon.png";

      document.body.classList.toggle("left-panel-collapsed", isCollapsed);

      localStorage.setItem('leftPanelCollapsed', isCollapsed);

      updateHeaderPosition(isCollapsed);
    };

    const updateHeaderPosition = (isCollapsed) => {
      const header = document.querySelector('.header');
      if (header) {
        header.style.left = isCollapsed ? '75px' : '300px';
        header.style.width = isCollapsed ? 'calc(100% - 75px)' : 'calc(100% - 300px)';
        header.style.transition = 'all 0.3s ease';
      }
    };

    toggleBtn.addEventListener("click", () => {
      const currentState = document.body.classList.contains("left-panel-collapsed");
      updatePanelState(!currentState);
    });

    const savedState = localStorage.getItem('leftPanelCollapsed');
    const initiallyCollapsed = savedState === 'true' || (savedState === null && false);
    updatePanelState(initiallyCollapsed);
  }

  setupUploadButtons();

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
