document.querySelectorAll(".faq-item").forEach((item) => {
  const button = item.querySelector(".faq-question");
  const icon = item.querySelector(".faq-icon");

  if (!button || !icon) return;

  button.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("active");
      faq.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
      const faqIcon = faq.querySelector(".faq-icon");
      if (faqIcon) faqIcon.textContent = "+";
    });

    if (!isActive) {
      item.classList.add("active");
      button.setAttribute("aria-expanded", "true");
      icon.textContent = "−";
    }
  });
});
