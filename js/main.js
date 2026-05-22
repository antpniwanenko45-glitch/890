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

  if(videoOverlay){

    videoOverlay.classList.remove("active");

  }

  if(luxuryVideo){

    luxuryVideo.pause();

    luxuryVideo.currentTime = 0;

  }

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

// =========================
// PREORDER SUBMIT
// =========================

const preorderBtn =
document.querySelector(
  ".preorder-btn"
);

const preorderInput =
document.querySelector(
  ".preorder-input"
);

preorderBtn.addEventListener(
  "click",
  async () => {

    const email =
      preorderInput.value.trim();

    if(!email){

      alert(
        "Bitte E-Mail eingeben"
      );

      return;

    }

    const activeColor =
      document.querySelector(
        ".active-popup-color"
      );

    let color = "Black";

    if(activeColor){

      const image =
        activeColor.dataset.image;

      if(image.includes("red")){

        color = "Red";

      }

      else if(
        image.includes("blue")
      ){

        color = "Blue";

      }

    }

    preorderBtn.textContent =
      "Wird gesendet...";

    try{

      await fetch(
        "https://script.google.com/macros/s/AKfycby1kDhcqp03fEye89Lv-Jkl4Fbi1vNENrqfrvg9lazhyKc_fCkzeJLSu_GJl7mOobNr/exec",
        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            email,
            color,
            source:"main-popup"

          })

        }
      );

      preorderBtn.textContent =
        "Gesendet ✓";

      preorderBtn.style.background =
        "#1d7a43";

      preorderInput.value = "";

    }

    catch(error){

      preorderBtn.textContent =
        "Fehler";

    }

  }
);
