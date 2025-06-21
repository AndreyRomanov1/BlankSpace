function setupUploadButtons() {
  document.querySelectorAll(".upload").forEach(button => {
    button.addEventListener("click", e => {
      e.stopPropagation();
      openModal();
    });
  });
}

function createSurveyTitle(survey) {
  const span = document.createElement("span");
  span.textContent = survey.name || "Новый опрос";
  return span;
}

function createSurveyMenu(survey) {
  const menu = document.createElement("div");
  menu.className = "survey-item__menu";

  const icon = document.createElement("img");
  icon.src = "../images/surveyMenuImg.svg";
  icon.alt = "Меню опроса";

  menu.appendChild(icon);

  const menuList = document.querySelector(".survey-item__menu-list");

  menu.addEventListener("click", (e) => {
    e.stopPropagation();

    const rect = menu.getBoundingClientRect();
    menuList.style.left = `${rect.x}px`;
    menuList.style.top = `${rect.y}px`;
    menuList.dataset.surveyId = survey.id;
    menuList.classList.toggle("hide");
  });

  menuList.classList.add("hide");

  return menu;
}

function renderLeftPanelUI(container) {
  container.innerHTML = `
    <div class="left-panel-header">
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
}

function setupPanelToggle(toggleBtn) {
  const toggleIcon = toggleBtn.querySelector(".toggle-icon");

  const updateHeaderPosition = (isCollapsed) => {
    const header = document.querySelector(".header");
    const widthStyle = isCollapsed ? "75px" : "300px";
    const mobileWidthStyle = isCollapsed ? "125px" : "200px";

    if (header) {
      if (window.innerWidth <= 768) {
        header.style.left = mobileWidthStyle;
        header.style.width = `calc(100% - ${mobileWidthStyle})`;
      } else {
        header.style.left = widthStyle;
        header.style.width = `calc(100% - ${widthStyle})`;
      }
    }
  };

  const updateSurveyPosition = (isCollapsed) => {
    const surveyContainer = document.querySelector("#survey-container");
    if (surveyContainer) {
      surveyContainer.style.margin = window.innerWidth <= 768
          ? "80px 15px 15px 0"
          : isCollapsed
              ? "80px 15px 15px 75px"
              : "80px 15px 15px 300px";
    }
  };

  const updatePanelState = (isCollapsed) => {
    toggleIcon.src = isCollapsed
        ? "../images/toggleRightIcon.png"
        : "../images/toggleLeftIcon.png";

    document.body.classList.toggle("left-panel-collapsed", isCollapsed);
    updateHeaderPosition(isCollapsed);
    updateSurveyPosition(isCollapsed);

    const menuList = document.querySelector(".survey-item__menu-list");
    if (menuList && isCollapsed) menuList.classList.add("hide");

    if (window.innerWidth <= 768) {
      const leftPanel = document.getElementById("left-panel");
      if (leftPanel)
        leftPanel.style.border = isCollapsed ? "none" : "4px solid white";
    }
  };

  toggleBtn.addEventListener("click", () => {
    const currentState = document.body.classList.contains("left-panel-collapsed");
    updatePanelState(!currentState);
  });

  // Инициализация
  updatePanelState(false);

  // Адаптация под изменение размеров экрана
  window.addEventListener("resize", debounce(() => {
    const isCollapsed = document.body.classList.contains("left-panel-collapsed");
    updatePanelState(isCollapsed);
  }, 300));
}

function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

function loadSurveyList() {
  const surveyList = document.getElementById("survey-list");
  surveyList.innerHTML = "";

  SURVEYS.forEach((survey) => {
    const item = document.createElement("div");
    item.className = "survey-item";
    item.dataset.surveyId = survey.id;

    const title = createSurveyTitle(survey);
    const menu = createSurveyMenu(survey);

    item.append(title, menu);

    item.addEventListener("click", () => {
      currentSurveyName = survey.name;
      changeSurveyHeaderName();
      loadSurvey(survey.id);
    });

    surveyList.appendChild(item);
  });
}

function loadLeftPanel() {
  const leftPanel = document.getElementById("left-panel");
  if (!leftPanel) return;

  renderLeftPanelUI(leftPanel);

  const toggleBtn = document.querySelector(".panel-toggle");
  if (toggleBtn) {
    setupPanelToggle(toggleBtn);
  }

  setupUploadButtons();
  loadSurveyList();
}

function updateLeftPanelActive(surveyId) {
  document.querySelectorAll(".survey-item").forEach(item => {
    item.classList.toggle("active", item.dataset.surveyId === surveyId);
  });
}
