function openModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  loadModalContent();
  modalOverlay.classList.remove("hidden");

  // Добавляем обработчик клика по оверлею
  modalOverlay.addEventListener('click', handleOverlayClick);
}

function closeModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  modalOverlay.classList.add("hidden");

  // Удаляем обработчик при закрытии
  modalOverlay.removeEventListener('click', handleOverlayClick);
}

// Новая функция для обработки клика по оверлею
function handleOverlayClick(e) {
  const modalContent = document.getElementById("modal-content");

  // Проверяем, был ли клик вне модального контента
  if (!modalContent.contains(e.target)) {
    closeModal();
  }
}

async function loadModalContent() {
  const modalContent = document.getElementById("modal-content");
  try {
    const response = await fetch("components/modal.html");
    const html = await response.text();
    modalContent.innerHTML = html;
    initModalEvents();
  } catch (error) {
    console.error("Ошибка загрузки модального окна:", error);
  }
}

function initModalEvents() {
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Остальной код initModalEvents остается без изменений
  const loadContainer = document.querySelector(".load_container");
  const fileInput = document.getElementById("fileInput");

  loadContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    loadContainer.classList.add("drag-over");
  });

  loadContainer.addEventListener("dragleave", () => {
    loadContainer.classList.remove("drag-over");
  });

  loadContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    loadContainer.classList.remove("drag-over");
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  });

  loadContainer.addEventListener("click", (e) => {
    e.stopPropagation(); // Предотвращаем закрытие при клике внутри контейнера
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      handleFiles(fileInput.files);
    }
  });

  const createBtn = document.querySelector(".create-btn");
  createBtn.addEventListener("click", () => {
    if (window.uploadedFile) {
      showSurvey();
    } else {
      alert("Выберите файл для загрузки");
    }
  });
  createBtn.disabled = true;

  const resetBtn = document.querySelector(".reset-btn");
  resetBtn.addEventListener("click", () => {
    updateModal("reset");
    createBtn.disabled = true;
  });
}

function showSurvey() {
  const newSurvey = {
    id: "survey-" + Date.now(),
    fileId: currentSurveyId,
    name: currentSurveyName.slice(0, -5),
    json: surveyData,
    answers: {},
    originalFile: FILE,
  };
  SURVEYS.push(newSurvey);
  saveSurveysToStorage();

  loadLeftPanel();
  loadSurvey(newSurvey.id);
  changeSurveyHeaderName();
  closeModal();
}

function updateModal(type, error = null) {
  const dropZone = document.querySelector("#dropZone");
  const modalInfo = document.querySelector(".info");
  const docTitle = document.querySelector(".info__title-doc");
  const status = document.querySelector(".info__status");
  const createBtn = document.querySelector(".create-btn");
  if (type === "reset") {
    dropZone.style.display = "block";
    modalInfo.style.display = "none";
    currentSurveyId = null;
    currentSurveyName = "";
    surveyData = null;
    FILE = null;

    const fileInput = document.getElementById("fileInput");
    fileInput.value = "";
  } else {
    dropZone.style.display = "none";
    modalInfo.style.display = "flex";
    docTitle.textContent = currentSurveyName;
    if (error) {
      status.textContent = "Некорректный шаблон";
      status.classList.add("invalid-template");
      createBtn.disabled = true;
    } else {
      status.textContent = "Шаблон корректен";
      status.classList.remove("invalid-template");
      createBtn.disabled = false;
    }
  }
}

function handleFiles(files) {
  const file = files[0];
  if (file) {
    window.uploadedFile = file;
    uploadFile(file);
  }
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("formFile", file);

  try {
    const uploadResponse = await fetch(`${baseApiUrl}/FileStorage`, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `HTTP error! status: ${uploadResponse.status}, ${errorText}`
      );
    }

    let fileId = await uploadResponse.text();
    fileId = fileId.replace(/"/g, "").replace(/'/g, "");

    const surveyResponse = await fetch(
      `${baseApiUrl}/Survey?fileId=${fileId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!surveyResponse.ok) {
      updateModal("init", `Failed to get survey: ${surveyResponse.statusText}`);
      return;
    }

    surveyData = await surveyResponse.json();
    currentSurveyId = fileId;
    currentSurveyName = file.name;
    FILE = file;

    updateModal("init");
  } catch (error) {
    console.error("Upload error:", error);
    alert(`Ошибка загрузки: ${error.message}`);
  }
}
