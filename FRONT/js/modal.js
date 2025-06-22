const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");

function openModal() {
  loadModalContent();
  modalOverlay.classList.remove("hidden");
  modalOverlay.addEventListener('click', handleOverlayClick);
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  modalOverlay.removeEventListener('click', handleOverlayClick);
}

function handleOverlayClick(e) {
  if (!modalContent.contains(e.target)) {
    closeModal();
  }
}

async function loadModalContent() {
  modalContent.innerHTML = `
    <div class="text_new_doc">Новый документ</div>
    <div class="load_container" id="dropZone">
      <img src="../images/loadDocument.png" alt="load document" class="img_load" />
      <p class="text_load">Перенесите сюда или кликните для выбора файла шаблона в формате .docx</p>
      <input type="file" id="fileInput"/>
    </div>
    
    <div class="modal__info info load_container">
      <div class="info__title">
        <p>Загружен документ:</p>
        <div class="info__title-doc"></div>
      </div>
      <div class="info__status"></div>
    </div>
    
    <div class="modal__btns">
      <button class="reset-btn modal__btn">Сбросить</button>
      <button class="create-btn modal__btn" disabled>Создать</button>
    </div>
  `;

  initModalEvents();
}

function initModalEvents() {
  const dropZone = document.querySelector("#dropZone");
  const fileInput = document.getElementById("fileInput");
  const createBtn = document.querySelector(".create-btn");
  const resetBtn = document.querySelector(".reset-btn");

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files);
    }
  });

  createBtn.addEventListener("click", () => {
    if (window.uploadedFile) {
      showSurvey();
    } else {
      alert("Выберите файл для загрузки");
    }
  });

  resetBtn.addEventListener("click", () => {
    updateModal("reset");
    createBtn.disabled = true;
  });
}

function showSurvey() {
  const newSurvey = {
    id: "survey-" + Date.now(),
    fileId: currentSurveyId,
    name: currentSurveyName,
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
      status.textContent = `Некорректный шаблон. ${error}`;
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
      updateModal("init", `${await surveyResponse.json()}`);
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
