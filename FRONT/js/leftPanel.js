function setupUploadButtons() {
  const uploadButtons = document.querySelectorAll(".upload");

  uploadButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal();
    });
  });
}

function createSurveyTitile(survey) {
  const span = document.createElement("span");
  span.textContent = `${survey.name || "Новый опрос"}`;
  return span;
}

function createSurveyMenu(survey) {
  const menu = document.createElement("div");
  const menuIcon = document.createElement("img");
  menuIcon.src = "../images/surveyMenuImg.svg";
  menu.append(menuIcon);

  const menuList = document.querySelector(".survey-item__menu-list");

  menu.addEventListener("click", () => {
    menuList.style.left = `${menu.getBoundingClientRect().x}px`;
    menuList.style.top = `${menu.getBoundingClientRect().y}px`;
    menuList.dataset.surveyId = survey.id;
    menuList.classList.toggle("hide");
  });
  menu.classList.add("survey-item__menu");
  menuList.classList.add("hide");

  return menu;
}

function loadSurveyMenu() {
  const menuList = document.querySelector(".survey-item__menu-list");
  const menuListItems = document.querySelectorAll(".survey-item__menu-list li");
  const renameSurvey = menuListItems[0];
  const deleteSurvey = menuListItems[1];

  document.addEventListener("keydown", function (event) {
    const currentSurvey = document.querySelector(
      `.survey-item[data-survey-id='${menuList.dataset.surveyId}']`
    );
    if (!currentSurvey) return;
    const surveyTitle = currentSurvey.querySelector("span");
    if (event.key === "Enter") {
      if (surveyTitle.contentEditable) {
        surveyTitle.contentEditable = false;
        for (let survey of SURVEYS) {
          if (survey.id == menuList.dataset.surveyId) {
            survey.name = surveyTitle.textContent;
            currentSurveyName = surveyTitle.textContent;
          }
        }
        changeSurveyHeaderName();
      }
    }
  });


  renameSurvey.addEventListener("click", () => {
    const currentSurvey = document.querySelector(
      `.survey-item[data-survey-id='${menuList.dataset.surveyId}']`
    );
    const surveyTitle = currentSurvey.querySelector("span");
    surveyTitle.contentEditable = true;
    surveyTitle.focus();
    menuList.classList.toggle("hide");
  });

  deleteSurvey.addEventListener("click", () => {
    SURVEYS = SURVEYS.filter(
      (survey) => survey.id != menuList.dataset.surveyId
    );
    currentSurveyId = null;
    currentSurveyName = "";
    surveyData = null;
    FILE = null;

    saveSurveysToStorage();
    loadLeftPanel();
    clearSurveyPlace();
    changeSurveyHeaderName();
    updateSubmitButtonState();

    menuList.classList.toggle("hide");
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
    const toggleIcon = toggleBtn.querySelector(".toggle-icon");

    const updatePanelState = (isCollapsed) => {
      const menuList = document.querySelector(".survey-item__menu-list");
      if (isCollapsed) {
        menuList.classList.add("hide");
      }
      toggleIcon.src = isCollapsed
        ? "../images/toggleRightIcon.png"
        : "../images/toggleLeftIcon.png";

      document.body.classList.toggle("left-panel-collapsed", isCollapsed);

      updateHeaderPosition(isCollapsed);
      updateSurveyPosition(isCollapsed);

      if (window.innerWidth <= 768) {
        if (isCollapsed) leftPanel.style.border = "none";
        else leftPanel.style.borderRight = "4px solid white";
      }

      const debounce = (func, delay) => {
        let timeoutId;
        return function (...args) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
      };

      window.addEventListener(
        "resize",
        debounce(() => {
          const isCollapsed = document.body.classList.contains(
            "left-panel-collapsed"
          );
          updatePanelState(isCollapsed);
        }, 1000)
      );
    };

    const updateHeaderPosition = (isCollapsed) => {
      const header = document.querySelector(".header");
      if (header) {
        if (window.innerWidth <= 768) {
          header.style.left = isCollapsed ? "125px" : "200px";
          header.style.width = isCollapsed
            ? "calc(100% - 125px)"
            : "calc(100% - 200px)";
        } else {
          header.style.left = isCollapsed ? "75px" : "300px";
          header.style.width = isCollapsed
            ? "calc(100% - 75px)"
            : "calc(100% - 300px)";
        }
      }
    };

    const updateSurveyPosition = (isCollapsed) => {
      const surveyContainer = document.querySelector("#survey-container");
      if (surveyContainer) {
        if (window.innerWidth <= 768) {
          surveyContainer.style.margin = "80px 15px 15px 0px";
        } else {
          surveyContainer.style.margin = isCollapsed
            ? "80px 15px 15px 75px"
            : "80px 15px 15px 300px";
        }
      }
    };

    toggleBtn.addEventListener("click", () => {
      const currentState = document.body.classList.contains(
        "left-panel-collapsed"
      );
      updatePanelState(!currentState);
    });

    updatePanelState(false);
  }

  setupUploadButtons();

  const surveyList = document.getElementById("survey-list");
  SURVEYS.forEach((survey) => {
    const surveyElem = document.createElement("div");
    surveyElem.className = "survey-item";
    surveyElem.dataset.surveyId = survey.id;
    const surveyTitle = createSurveyTitile(survey);
    const surveyMenu = createSurveyMenu(survey);
    surveyElem.append(surveyTitle);
    surveyElem.append(surveyMenu);
    surveyElem.addEventListener("click", () => {
      console.log(survey.name);
      currentSurveyName = survey.name;
      changeSurveyHeaderName();
      loadSurvey(survey.id);
    });
    surveyList.appendChild(surveyElem);
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
