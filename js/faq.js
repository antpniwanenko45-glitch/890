// =========================
// FAQ ACCORDION
// =========================

const faqCards = document.querySelectorAll(".faq-card");

faqCards.forEach((card) => {

  const top = card.querySelector(".faq-top");

  top.addEventListener("click", () => {

    const openedCard =
      document.querySelector(".faq-card.active");

    if(openedCard && openedCard !== card){

      openedCard.classList.remove("active");

    }

    card.classList.toggle("active");

  });

});
