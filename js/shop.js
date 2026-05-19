// =========================
// IMAGE SWITCHER
// =========================

const mainImage =
document.getElementById("mainProductImage");

const thumbnails =
document.querySelectorAll(".thumb");

thumbnails.forEach((thumb) => {

  thumb.addEventListener("click", () => {

    mainImage.src = thumb.src;

    thumbnails.forEach((t) => {

      t.classList.remove("active-thumb");

    });

    thumb.classList.add("active-thumb");

  });

});


// =========================
// COLOR SWITCHER
// =========================

const colorButtons =
document.querySelectorAll(".color-btn");

colorButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const image =
      button.dataset.image;

    mainImage.src = image;

    colorButtons.forEach((btn) => {

      btn.classList.remove("active-color");

    });

    button.classList.add("active-color");

  });

});


// =========================
// QUANTITY
// =========================

const minusBtn =
document.getElementById("minusBtn");

const plusBtn =
document.getElementById("plusBtn");

const quantityValue =
document.getElementById("quantityValue");

let quantity = 1;

plusBtn.addEventListener("click", () => {

  quantity++;

  quantityValue.textContent = quantity;

});

minusBtn.addEventListener("click", () => {

  if(quantity > 1){

    quantity--;

    quantityValue.textContent = quantity;

  }

});


// =========================
// BUY BUTTON
// =========================

const buyBtn =
document.querySelector(".buy-btn");

buyBtn.addEventListener("click", () => {

  buyBtn.innerHTML =
    "Zum Warenkorb hinzugefügt ✓";

  buyBtn.style.background =
    "#c8a46b";

});
