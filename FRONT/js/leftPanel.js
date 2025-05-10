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

    updatePanelState(false);
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