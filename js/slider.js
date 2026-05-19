// =========================
// VIDEO SLIDER
// =========================

const slider = document.querySelector(".video-grid");

let isDown = false;
let startX;
let scrollLeft;

if(slider){

  slider.addEventListener("mousedown", (e) => {

    isDown = true;

    slider.classList.add("active");

    startX = e.pageX - slider.offsetLeft;

    scrollLeft = slider.scrollLeft;

  });

  slider.addEventListener("mouseleave", () => {

    isDown = false;

    slider.classList.remove("active");

  });

  slider.addEventListener("mouseup", () => {

    isDown = false;

    slider.classList.remove("active");

  });

  slider.addEventListener("mousemove", (e) => {

    if(!isDown) return;

    e.preventDefault();

    const x = e.pageX - slider.offsetLeft;

    const walk = (x - startX) * 1.5;

    slider.scrollLeft = scrollLeft - walk;

  });

}


// =========================
// AUTO HOVER ANIMATION
// =========================

const cards = document.querySelectorAll(".video-card");

cards.forEach((card, index) => {

  setTimeout(() => {

    card.classList.add("card-loaded");

  }, index * 150);

});


// =========================
// VIDEO PLAY ICON EFFECT
// =========================

cards.forEach((card) => {

  card.addEventListener("mouseenter", () => {

    const playBtn = card.querySelector(".play-btn");

    playBtn.style.transform =
      "translate(-50%, -50%) scale(1.15)";

  });

  card.addEventListener("mouseleave", () => {

    const playBtn = card.querySelector(".play-btn");

    playBtn.style.transform =
      "translate(-50%, -50%) scale(1)";

  });

});
