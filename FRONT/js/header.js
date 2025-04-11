document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const uploadBtn = document.querySelector(".upload");
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        openModal();
      });
    }
  }, 500);
});
