const sliderTrack = document.querySelector(".slider-track");
const slides = [...document.querySelectorAll(".slider-image")];
const nextBtn = document.querySelector(".right-arrow");
const prevBtn = document.querySelector(".left-arrow");
const thumbs = [...document.querySelectorAll(".thumb")];
const colorButtons = [...document.querySelectorAll(".color-btn")];
let currentSlide = 0;

const updateSlider = () => {
  if (!sliderTrack || !slides.length) return;
  sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  const currentColor = currentSlide % 2 === 0 ? "Red" : "Blue";

  thumbs.forEach((thumb, index) => thumb.classList.toggle("active-thumb", index === currentSlide));
  colorButtons.forEach((button) => {
    button.classList.toggle("active-color", button.dataset.color === currentColor);
  });
};

nextBtn?.addEventListener("click", () => {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlider();
});

prevBtn?.addEventListener("click", () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
});

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    currentSlide = Number(thumb.dataset.index || 0);
    updateSlider();
  });
});

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentSlide = Number(button.dataset.slide || 0);
    updateSlider();
  });
});

let touchStartX = 0;

sliderTrack?.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0].clientX;
}, { passive: true });

sliderTrack?.addEventListener("touchend", (event) => {
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 42 || !slides.length) return;
  currentSlide = delta < 0
    ? (currentSlide + 1) % slides.length
    : (currentSlide - 1 + slides.length) % slides.length;
  updateSlider();
}, { passive: true });

const minusBtn = document.getElementById("minusBtn");
const plusBtn = document.getElementById("plusBtn");
const quantityValue = document.getElementById("quantityValue");
const priceValue = document.getElementById("priceValue");
let quantity = 1;
const singlePrice = 19.99;

const updatePrice = () => {
  if (quantityValue) quantityValue.textContent = String(quantity);
  if (priceValue) priceValue.textContent = (singlePrice * quantity).toFixed(2).replace(".", ",");
};

plusBtn?.addEventListener("click", () => {
  quantity += 1;
  updatePrice();
});

minusBtn?.addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  updatePrice();
});

updatePrice();

const preorderModal = document.getElementById("preorderModal");
const closePreorderModal = document.getElementById("closePreorderModal");
const buyBtn = document.querySelector(".buy-btn");
const preorderSubmit = document.getElementById("preorderSubmit");
const preorderEmail = document.getElementById("preorderEmail");
const shopPreorderQuantity = document.getElementById("shopPreorderQuantity");
const shopPreorderMinus = document.getElementById("shopPreorderMinus");
const shopPreorderPlus = document.getElementById("shopPreorderPlus");
const shopPopupColors = [...document.querySelectorAll("#preorderModal .popup-color")];
const shopPlannerPreview = document.getElementById("shopPlannerPreview");

const lockShopScroll = () => {
  if (window.futureMeScrollLock) {
    window.futureMeScrollLock.lock();
    return;
  }
  document.body.classList.add("modal-open");
};

const unlockShopScroll = () => {
  if (window.futureMeScrollLock) {
    window.futureMeScrollLock.unlock();
    return;
  }
  document.body.classList.remove("modal-open");
};

const openShopModal = () => {
  if (!preorderModal) return;
  preorderModal.classList.add("show-preorder-modal");
  preorderModal.setAttribute("aria-hidden", "false");
  lockShopScroll();
  preorderEmail?.focus();
};

const closeShopModal = () => {
  if (!preorderModal) return;
  preorderModal.classList.remove("show-preorder-modal");
  preorderModal.setAttribute("aria-hidden", "true");
  unlockShopScroll();
};

buyBtn?.addEventListener("click", openShopModal);
closePreorderModal?.addEventListener("click", closeShopModal);

preorderModal?.addEventListener("click", (event) => {
  if (event.target === preorderModal) closeShopModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeShopModal();
});

const clampShopPreorderQuantity = () => {
  if (!shopPreorderQuantity) return quantity;
  const value = Number.parseInt(shopPreorderQuantity.value, 10);
  const next = Number.isFinite(value) ? Math.min(99, Math.max(1, value)) : 1;
  shopPreorderQuantity.value = String(next);
  return next;
};

shopPreorderMinus?.addEventListener("click", () => {
  if (!shopPreorderQuantity) return;
  shopPreorderQuantity.value = String(clampShopPreorderQuantity() - 1);
  clampShopPreorderQuantity();
});

shopPreorderPlus?.addEventListener("click", () => {
  if (!shopPreorderQuantity) return;
  shopPreorderQuantity.value = String(clampShopPreorderQuantity() + 1);
  clampShopPreorderQuantity();
});

shopPreorderQuantity?.addEventListener("input", clampShopPreorderQuantity);

shopPopupColors.forEach((button) => {
  button.addEventListener("click", () => {
    shopPopupColors.forEach((color) => color.classList.remove("active-popup-color"));
    button.classList.add("active-popup-color");
    if (shopPlannerPreview && button.dataset.image) {
      shopPlannerPreview.src = button.dataset.image;
    }
  });
});

preorderSubmit?.addEventListener("click", async () => {
  const email = preorderEmail?.value.trim() || "";

  if (!email || !email.includes("@")) {
    preorderEmail?.focus();
    preorderEmail?.setAttribute("aria-invalid", "true");
    return;
  }

  preorderEmail?.removeAttribute("aria-invalid");
  const activePopupColor = document.querySelector("#preorderModal .active-popup-color");
  const activeColor = activePopupColor || document.querySelector(".active-color");
  const color = activeColor?.dataset.color || "Red";
  const image = activePopupColor?.dataset.image || (color === "Blue" ? "images/gallery/product-blue-1-enhanced.jpg" : "images/gallery/product-red-1-enhanced.jpg");
  const preorderQuantity = clampShopPreorderQuantity();
  const originalText = preorderSubmit.textContent;

  preorderSubmit.textContent = "Wird gesendet...";
  preorderSubmit.disabled = true;

  try {
    await fetch("/api/preorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        color,
        image,
        quantity: preorderQuantity,
        product: "Future Me Planner",
        source: "shop-popup"
      })
    });

    preorderSubmit.textContent = "Vorbestellung gesichert ✓";
    preorderEmail.value = "";
  } catch {
    preorderSubmit.textContent = "Bitte später erneut";
  } finally {
    setTimeout(() => {
      preorderSubmit.disabled = false;
      preorderSubmit.textContent = originalText || "Vorbestellung sichern";
    }, 2400);
  }
});

const insideMain = document.querySelector("[data-inside-main]");
const insideThumbs = [...document.querySelectorAll("[data-inside-thumb]")];
const insidePrev = document.querySelector(".inside-prev");
const insideNext = document.querySelector(".inside-next");
let activeInsideIndex = 0;

const setInsideImage = (index) => {
  if (!insideMain || !insideThumbs.length) return;
  activeInsideIndex = (index + insideThumbs.length) % insideThumbs.length;
  const activeThumb = insideThumbs[activeInsideIndex];
  insideMain.src = activeThumb.dataset.src || insideMain.src;
  insideMain.alt = activeThumb.dataset.alt || insideMain.alt;
  insideThumbs.forEach((thumb, thumbIndex) => {
    thumb.classList.toggle("active-inside-thumb", thumbIndex === activeInsideIndex);
  });
};

insideThumbs.forEach((thumb, index) => {
  thumb.addEventListener("click", () => setInsideImage(index));
});

insidePrev?.addEventListener("click", () => {
  setInsideImage(activeInsideIndex - 1);
});

insideNext?.addEventListener("click", () => {
  setInsideImage(activeInsideIndex + 1);
});
