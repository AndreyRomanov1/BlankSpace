document.addEventListener("modal-loaded", async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  openModal();
  try {
    initModalEvents();
  } catch (error) {
    console.error("Ошибка загрузки модального окна:", error);
  }
});

function openModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  modalOverlay.classList.remove("hidden");

  const dropZone = document.querySelector("#dropZone");
  const modalInfo = document.querySelector(".info");
  const createBtn = document.querySelector(".create-btn");
  const fileInput = document.getElementById("fileInput");

  if (dropZone) dropZone.style.display = "block";
  if (modalInfo) modalInfo.style.display = "none";
  if (createBtn) createBtn.disabled = true;
  if (fileInput) fileInput.value = "";
  modalOverlay.addEventListener("click", handleOverlayClick);
}

function closeModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  modalOverlay.classList.add("hidden");
  modalOverlay.removeEventListener("click", handleOverlayClick);
}

function handleOverlayClick(e) {
  const modalContent = document.getElementById("modal-content");
  if (!modalContent.contains(e.target)) closeModal();
}

function initModalEvents() {
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

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
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });

  loadContainer.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) handleFiles(fileInput.files);
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
  loadLeftPanel();
  loadSurvey();
  changeSurveyHeaderName();
  closeModal();
}

function updateModal(type, error = null) {
  const dropZone = document.querySelector("#dropZone");
  const modalInfo = document.querySelector(".info");
  const docTitle = document.querySelector(".info__title-doc");
  const infoTitle = document.querySelector(".info__title");
  const status = document.querySelector(".info__status");
  const createBtn = document.querySelector(".create-btn");
  if (type === "reset") {
    dropZone.style.display = "block";
    modalInfo.style.display = "none";

    globalState.resetSurveyData();

    const fileInput = document.getElementById("fileInput");
    fileInput.value = "";
  } else {
    if (error) {
      infoTitle.textContent = "Ошибка загрузки:";
      infoTitle.append(docTitle);
      status.textContent = `Некорректный шаблон. ${error}`;
      status.classList.add("invalid-template");
      createBtn.disabled = true;
    } else {
      infoTitle.textContent = "Документ загружен:";
      infoTitle.append(docTitle);
      docTitle.textContent = globalState.getCurrentSurvey().name;
      status.textContent = "Шаблон корректен";
      status.classList.remove("invalid-template");
      createBtn.disabled = false;
    }
    dropZone.style.display = "none";
    modalInfo.style.display = "flex";
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
  try {
    let fileId = await apiService.uploadFile(file);

    const surveyResponse = await apiService.getSurveyStructure(fileId);

    const newSurvey = {
      id: "survey-" + Date.now(),
      fileId: fileId,
      name: file.name,
      json: surveyResponse,
      answers: {},
      originalFile: file,
    };
    globalState.addFile(newSurvey);
    globalState.setCurrentSurvey(newSurvey.id);

    updateModal("init");
  } catch (error) {
    console.error("Upload error:", error);
    updateModal("error", error.message);
  }
}
