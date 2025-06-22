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
  span.textContent = `${survey.name.replace(/\.[^/.]+$/, "") || "Новый опрос"}`;
  return span;
}

function createSurveyMenu(survey) {
  const menu = document.createElement("div");
  const menuIcon = document.createElement("img");
  menuIcon.src = "../images/surveyMenuImg.svg";
  const staticIcon = document.createElement("img");
  staticIcon.src = "../images/surveyMenuImg.svg";
  staticIcon.setAttribute("alt", "меню опроса");
  staticIcon.classList.add("survey-menu-icon", "static-icon");

  const animatedIcon = document.createElement("object");
  animatedIcon.type = "image/svg+xml";
  animatedIcon.data = "../images/animatedMenu.svg";
  animatedIcon.classList.add("survey-menu-icon", "animated-icon");
  animatedIcon.setAttribute("role", "img");
  animatedIcon.setAttribute("aria-label", "анимированное меню");

  menu.append(staticIcon);
  menu.append(animatedIcon);

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

  document.addEventListener("click", (event) => {
    const clickedOnMenuIcon = event.target.closest(".survey-item__menu");

    const clickedOnMenuList = event.target.closest(".survey-item__menu-list");
    if (!clickedOnMenuIcon && !clickedOnMenuList) {
      menuList.classList.add("hide");
    }
  });

  document.addEventListener("keydown", function (event) {
    const currentSurvey = document.querySelector(
      `.survey-item[data-survey-id='${menuList.dataset.surveyId}']`
    );
    if (!currentSurvey) return;
    const surveyTitle = currentSurvey.querySelector("span");
    if (event.key === "Enter") {
      if (surveyTitle.contentEditable) {
        surveyTitle.contentEditable = false;

        globalState.changeSurveyName(
          surveyTitle.textContent,
          menuList.dataset.surveyId
        );
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
    menuList.classList.add("hide");
    globalState.deleteSurvey(menuList.dataset.surveyId);
    loadLeftPanel();
    clearSurveyPlace();
    changeSurveyHeaderName();
    updateSubmitButtonState();
  });
}

function loadLeftPanel() {
  const leftPanel = document.getElementById("left-panel");
  leftPanel.innerHTML = `
      <header class = "left-panel-header">
        <button class="panel-toggle">
            <img src="../images/toggleLeftIcon.png" alt="Toggle" class="left-panel-icon toggle-icon">
        </button>
        <h2 class="text-opros">Сессии</h2>
        <button class="upload">
            <img src="../images/newFileIcon.png" alt="Upload file" class="left-panel-icon">
        </button>
      </header>
      <div class="collapsed-upload-container">
        <button class="upload collapsed-upload">
            <img src="../images/newFileIcon.png" alt="Upload file" class="left-panel-icon">
        </button>
      </div>
      <ul id="survey-list"></>
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
  globalState.surveys.forEach((survey) => {
    const surveyElem = document.createElement("div");
    surveyElem.className = "survey-item";
    surveyElem.dataset.surveyId = survey.id;
    const surveyTitle = createSurveyTitile(survey);
    const surveyMenu = createSurveyMenu(survey);
    surveyElem.append(surveyTitle);
    surveyElem.append(surveyMenu);
    surveyElem.addEventListener("click", () => {
      globalState.setCurrentSurvey(survey.id);
      changeSurveyHeaderName();
      loadSurvey();
      updateSubmitButtonState();
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
