document.addEventListener("header-loaded", () => {
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", finalizeCurrentSurvey);
    updateSubmitButtonState();
  }
});
