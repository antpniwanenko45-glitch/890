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

const heroImage =
document.querySelector(".hero-image");

window.addEventListener("scroll", () => {

  const scroll = window.scrollY;

  if(heroImage){

    heroImage.style.transform =
      `translateY(${scroll * 0.05}px)`;

  }

});

// =========================
// LUXURY VIDEO EXPERIENCE
// =========================

const videoCards =
document.querySelectorAll(".video-card");

const videoOverlay =
document.querySelector(".video-overlay");

const luxuryVideo =
document.getElementById("luxuryVideo");

const videoClose =
document.querySelector(".video-close");

const videoThumbs =
document.querySelectorAll(".video-thumb");


// OPEN

videoCards.forEach((card, index) => {

  card.addEventListener("click", () => {

    const videoSrc =
    card.dataset.video;

    luxuryVideo.src = videoSrc;

    videoOverlay.classList.add("active");

    luxuryVideo.play();

    updateActiveThumb(index);

  });

});


// CLOSE

if(videoClose){

  videoClose.addEventListener("click", () => {

    closeLuxuryVideo();

  });

}


// CLICK OUTSIDE

if(videoOverlay){

  videoOverlay.addEventListener("click", (e) => {

    if(e.target === videoOverlay){

      closeLuxuryVideo();

    }

  });

}


// THUMB SWITCH

videoThumbs.forEach((thumb, index) => {

  thumb.addEventListener("click", () => {

    luxuryVideo.src =
    thumb.dataset.video;

    luxuryVideo.play();

    updateActiveThumb(index);

  });

});


// FUNCTIONS

function closeLuxuryVideo(){

  videoOverlay.classList.remove("active");

  luxuryVideo.pause();

  luxuryVideo.currentTime = 0;

}


function updateActiveThumb(index){

  videoThumbs.forEach((thumb) => {

    thumb.classList.remove("active-thumb");

  });

  videoThumbs[index]
  .classList.add("active-thumb");

}

// =========================
// PREORDER POPUP
// =========================

const preorderOverlay =
document.getElementById("preorderOverlay");

const closePreorder =
document.getElementById("closePreorder");

const popupColors =
document.querySelectorAll(".popup-color");

const plannerPreview =
document.getElementById("plannerPreview");


// OPEN AFTER DELAY

window.addEventListener("load", () => {

  setTimeout(() => {

    preorderOverlay.classList.add("active");

  }, 1200);

});


// CLOSE

closePreorder.addEventListener("click", () => {

  preorderOverlay.classList.remove("active");

});


// CLICK OUTSIDE

preorderOverlay.addEventListener("click", (e) => {

  if(e.target === preorderOverlay){

    preorderOverlay.classList.remove("active");

  }

});


// CHANGE IMAGE

popupColors.forEach((button) => {

  button.addEventListener("click", () => {

    const image =
    button.dataset.image;

    plannerPreview.src = image;

    popupColors.forEach((btn) => {

      btn.classList.remove(
        "active-popup-color"
      );

    });

    button.classList.add(
      "active-popup-color"
    );

  });

});

// =========================
// STICKY OFFER BUTTON
// =========================

const offerTrigger =
document.getElementById("offerTrigger");

if(offerTrigger){

  offerTrigger.addEventListener("click", () => {

    preorderOverlay.classList.add("active");

  });

}
