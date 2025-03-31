function createFileInput() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept =
    ".doc,.docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  fileInput.style.display = "none";
  fileInput.onclick = () => {
    fileInput.value = null;
  };
  return fileInput;
}

function headerMain() {
  const uploadBtn = document.querySelector(".upload");
  const fileInput = createFileInput();

  uploadBtn.addEventListener("click", () => {
    console.log("Кнопка Upload нажата, открываю выбор файла...");
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    console.log("Файл выбран:", file ? file.name : "Нет файла");

    if (file) {
      const formData = new FormData();
      formData.append("file", file, file.name);

      console.log("Отправка файла на сервер...");
      try {
        const response = await fetch(
          "http://localhost:5159/api/Survey/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        console.log("Получен ответ от сервера:", response);

        if (response.ok) {
          console.log("Статус OK, пытаюсь прочитать тело как JSON...");
          try {
            const result = await response.json();
            console.log("Успешно прочитано JSON:", result);
            DATA = result;
            userAnswers = {};
            const surveyContainer =
              document.getElementById("questionsContainer");
            const submitBtn = document.getElementById("submitBtn");
            if (surveyContainer) surveyContainer.innerHTML = "";
            if (submitBtn) submitBtn.style.display = "none";
            alert(
              "Файл успешно загружен и обработан. Нажмите 'Show' для отображения опроса."
            );
          } catch (jsonError) {
            console.error("Ошибка парсинга JSON:", jsonError);
            alert("Сервер вернул ответ, который не является корректным JSON.");
            DATA = null;
          }
        } else {
          console.error(
            `Ошибка от сервера: ${response.status} ${response.statusText}`
          );
          const errorText = await response.text();
          console.error("Текст ошибки от сервера:", errorText);
          alert(
            `Ошибка обработки файла на сервере: ${
              errorText || response.statusText
            }`
          );
          DATA = null;
        }
      } catch (error) {
        console.error("Ошибка сети или выполнения fetch:", error);
        alert(`Не удалось отправить файл. Ошибка: ${error}`);
        DATA = null;
      }
    } else {
      console.log("Файл не выбран.");
    }
  });

  document.body.appendChild(fileInput);
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    headerMain();
  }, 500);
});
