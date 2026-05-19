// =========================
// NAVBAR SCROLL EFFECT
// =========================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

  if (window.scrollY > 40) {

    navbar.classList.add("navbar-scrolled");

  } else {

    navbar.classList.remove("navbar-scrolled");

  }

});


// =========================
// SMOOTH APPEAR ANIMATION
// =========================

const revealElements = document.querySelectorAll(
  ".hero, .video-section, .vorteile, .quote, .faq"
);

const revealOnScroll = () => {

  const triggerBottom = window.innerHeight * 0.85;

  revealElements.forEach((element) => {

    const boxTop = element.getBoundingClientRect().top;

    if (boxTop < triggerBottom) {

      element.classList.add("show");

    }

  });

};

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();


// =========================
// BUTTON RIPPLE EFFECT
// =========================

const buttons = document.querySelectorAll(
  ".btn-primary, .btn-nav"
);

buttons.forEach((button) => {

  button.addEventListener("mouseenter", () => {

    button.classList.add("btn-hover");

  });

  button.addEventListener("mouseleave", () => {

    button.classList.remove("btn-hover");

  });

});


// =========================
// PARALLAX HERO IMAGE
// =========================

const heroImage = document.querySelector(".hero-image img");

window.addEventListener("scroll", () => {

  const scroll = window.scrollY;

  if(heroImage){

    heroImage.style.transform =
      `translateY(${scroll * 0.05}px)`;

  }

});
