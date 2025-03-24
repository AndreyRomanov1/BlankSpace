function main() {
  const uploadBtn = document.querySelector(".upload");
  console.log(uploadBtn);
  let fileContent = null;

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept =
    ".doc,.docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  fileInput.style.display = "none";

  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const buffer = await file.arrayBuffer();

        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        fileContent = result.value;

        console.log("Текст документа:", fileContent);
      } catch (error) {
        console.error("Ошибка чтения файла:", error);
      }
    }
  });

  document.body.appendChild(fileInput);
}

setTimeout(() => {
  main();
}, 1000);
