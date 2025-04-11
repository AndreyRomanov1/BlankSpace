function openModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  loadModalContent();
  modalOverlay.classList.remove("hidden");
}

function closeModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  modalOverlay.classList.add("hidden");
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
  loadContainer.addEventListener("click", () => {
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
      uploadFile(window.uploadedFile);
    } else {
      alert("Выберите файл для загрузки");
    }
  });
}

function handleFiles(files) {
  const file = files[0];
  if (file) {
    window.uploadedFile = file;
    alert(`Файл "${file.name}" успешно выбран!`);
  }
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("formFile", file);

  try {
    const uploadResponse = await fetch(
      "http://localhost:5159/api/FileStorage",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `HTTP error! status: ${uploadResponse.status}, ${errorText}`
      );
    }

    let fileId = await uploadResponse.text();
    fileId = fileId.replace(/"/g, "").replace(/'/g, "");

    const surveyResponse = await fetch(
      `http://localhost:5159/api/Survey?fileId=${fileId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!surveyResponse.ok) {
      throw new Error(`Failed to get survey: ${surveyResponse.statusText}`);
    }

    const surveyData = await surveyResponse.json();

    const newSurvey = {
      id: "survey-" + Date.now(),
      fileId: fileId,
      name: file.name,
      json: surveyData,
      answers: {},
      originalFile: file,
    };

    SURVEYS.push(newSurvey);
    saveSurveysToStorage();

    loadLeftPanel();
    loadSurvey(newSurvey.id);
    currentSurveyName = newSurvey.name;
    changeSurveyHeaderName();

    alert("Файл успешно загружен и опрос создан.");
    closeModal();
  } catch (error) {
    console.error("Upload error:", error);
    alert(`Ошибка загрузки: ${error.message}`);
  }
}
