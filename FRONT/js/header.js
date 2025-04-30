document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const submitBtn = document.querySelector("#submitBtn");
    submitBtn.addEventListener("click", () => {
      finalizeCurrentSurvey();
    });
  }, 500);
});
