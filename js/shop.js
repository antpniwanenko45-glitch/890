// =========================
// SLIDER
// =========================

const track =
document.querySelector(".slider-track");

const slides =
document.querySelectorAll(".slider-image");

const nextBtn =
document.querySelector(".right-arrow");

const prevBtn =
document.querySelector(".left-arrow");

const thumbs =
document.querySelectorAll(".thumb");

const colorButtons =
document.querySelectorAll(".color-btn");

let currentSlide = 0;


// =========================
// UPDATE SLIDER
// =========================

function updateSlider(){

  track.style.transform =
    `translateX(-${currentSlide * 100}%)`;

  thumbs.forEach((thumb) => {

    thumb.classList.remove("active-thumb");

  });

  if(thumbs[currentSlide]){

    thumbs[currentSlide].classList.add("active-thumb");

  }

}


// =========================
// NEXT
// =========================

nextBtn.addEventListener("click", () => {

  currentSlide++;

  if(currentSlide >= slides.length){

    currentSlide = 0;

  }

  updateSlider();

});


// =========================
// PREV
// =========================

prevBtn.addEventListener("click", () => {

  currentSlide--;

  if(currentSlide < 0){

    currentSlide = slides.length - 1;

  }

  updateSlider();

});


// =========================
// THUMBNAILS
// =========================

thumbs.forEach((thumb) => {

  thumb.addEventListener("click", () => {

    currentSlide =
      parseInt(thumb.dataset.index);

    updateSlider();

  });

});


// =========================
// COLOR SWITCH
// =========================

colorButtons.forEach((button) => {

  button.addEventListener("click", () => {

    currentSlide =
      parseInt(button.dataset.slide);

    updateSlider();

    colorButtons.forEach((btn) => {

      btn.classList.remove("active-color");

    });

    button.classList.add("active-color");

  });

});


// =========================
// AUTO SLIDE
// =========================

setInterval(() => {

  currentSlide++;

  if(currentSlide >= slides.length){

    currentSlide = 0;

  }

  updateSlider();

}, 5000);


// =========================
// QUANTITY + PRICE
// =========================

const minusBtn =
document.getElementById("minusBtn");

const plusBtn =
document.getElementById("plusBtn");

const quantityValue =
document.getElementById("quantityValue");

const priceValue =
document.getElementById("priceValue");

let quantity = 1;

const singlePrice = 39.90;


// =========================
// UPDATE PRICE
// =========================

function updatePrice(){

  const total =
    (singlePrice * quantity)
    .toFixed(2)
    .replace(".", ",");

  priceValue.textContent = total;

  quantityValue.textContent = quantity;

}


// =========================
// PLUS
// =========================

plusBtn.addEventListener("click", () => {

  quantity++;

  updatePrice();

});


// =========================
// MINUS
// =========================

minusBtn.addEventListener("click", () => {

  if(quantity > 1){

    quantity--;

    updatePrice();

  }

});


updatePrice();

// =========================
// STRIPE CHECKOUT
// =========================

const buyBtn =
document.querySelector(".buy-btn");

buyBtn.addEventListener("click", () => {

  window.location.href =
    "https://buy.stripe.com/test";

});
