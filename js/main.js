const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

const setScrolledNav = () => {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 16);
};

window.addEventListener("scroll", setScrolledNav, { passive: true });
setScrolledNav();

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

document.querySelectorAll("button, .btn-primary, .btn-secondary, .nav-links a").forEach((element) => {
  element.addEventListener("click", (event) => {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "click-ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;

    element.classList.add("is-clicked");
    element.appendChild(ripple);

    window.setTimeout(() => element.classList.remove("is-clicked"), 150);
    window.setTimeout(() => ripple.remove(), 560);
  });
});

const preorderOverlay = document.getElementById("preorderOverlay");
const closePreorderButtons = document.querySelectorAll("[data-close-preorder]");
const offerTrigger = document.querySelector("[data-offer-trigger]");
const popupColors = document.querySelectorAll(".popup-color");
const plannerPreview = document.getElementById("plannerPreview");
const preorderBtn = document.querySelector(".preorder-btn");
const preorderInput = document.querySelector(".preorder-input");
const preorderQuantity = document.getElementById("preorderQuantity");
const preorderMinus = document.querySelector("[data-preorder-minus]");
const preorderPlus = document.querySelector("[data-preorder-plus]");
const videoModal = document.getElementById("videoModal");
const videoModalTitle = document.getElementById("videoModalTitle");
const videoModalText = document.getElementById("videoModalText");
const videoPlayer = document.getElementById("videoPlayer");
const videoError = document.getElementById("videoError");
const videoDirectLink = document.getElementById("videoDirectLink");
videoPlayer?.addEventListener("error", () => {
  if (videoPlayer.hasAttribute("src") && videoError) videoError.hidden = false;
});
let videoTrigger = null;
const closeVideoButtons = document.querySelectorAll("[data-close-video]");
const newsletterForm = document.querySelector("[data-newsletter-form]");
const newsletterStatus = document.querySelector("[data-newsletter-status]");

let lockedScrollY = 0;

const lockPageScroll = () => {
  if (document.body.classList.contains("modal-open")) return;
  lockedScrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.classList.add("modal-open");
};

const unlockPageScroll = () => {
  if (!document.body.classList.contains("modal-open")) return;
  document.body.classList.remove("modal-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, lockedScrollY);
};

window.futureMeScrollLock = {
  lock: lockPageScroll,
  unlock: unlockPageScroll
};

const openPreorder = () => {
  if (!preorderOverlay) return;
  preorderOverlay.classList.add("active");
  preorderOverlay.setAttribute("aria-hidden", "false");
  lockPageScroll();
  closePreorderButtons[0]?.focus({ preventScroll: true });
};

const closePreorder = () => {
  if (!preorderOverlay || !preorderOverlay.classList.contains("active")) return;
  preorderOverlay.classList.remove("active");
  preorderOverlay.setAttribute("aria-hidden", "true");
  unlockPageScroll();
  offerTrigger?.focus({ preventScroll: true });
};

offerTrigger?.addEventListener("click", openPreorder);
closePreorderButtons.forEach((button) => button.addEventListener("click", closePreorder));

preorderOverlay?.addEventListener("click", (event) => {
  if (event.target === preorderOverlay) closePreorder();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePreorder();
});

const openVideoModal = (card) => {
  const { videoTitle: title, videoText: text, videoSrc, videoPoster } = card.dataset;
  if (!videoSrc || !videoPlayer) return;
  videoTrigger = card;
  if (videoError) videoError.hidden = true;
  if (videoDirectLink) videoDirectLink.href = videoSrc;
  videoPlayer.src = videoSrc;
  videoPlayer.poster = videoPoster || "";
  videoPlayer.setAttribute("aria-label", title);
  if (!videoModal) return;
  if (videoModalTitle) videoModalTitle.textContent = title || "Future Me";
  if (videoModalText) videoModalText.textContent = text || "Kurzer Einblick in den Planner.";
  videoModal.classList.add("active");
  videoModal.setAttribute("aria-hidden", "false");
  lockPageScroll();
  closeVideoButtons[0]?.focus();
  videoPlayer.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
};

const closeVideoModal = () => {
  if (!videoModal || !videoModal.classList.contains("active")) return;
  videoPlayer?.pause();
  videoPlayer?.removeAttribute("src");
  videoPlayer?.load();
  videoModal.classList.remove("active");
  videoModal.setAttribute("aria-hidden", "true");
  unlockPageScroll();
  videoTrigger?.focus({ preventScroll: true });
};

document.querySelectorAll(".video-card").forEach((card) => {
  card.addEventListener("click", () => {
    openVideoModal(card);
  });
});

closeVideoButtons.forEach((button) => button.addEventListener("click", closeVideoModal));

videoModal?.addEventListener("click", (event) => {
  if (event.target === videoModal) closeVideoModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeVideoModal();
});

popupColors.forEach((button) => {
  button.addEventListener("click", () => {
    popupColors.forEach((color) => color.classList.remove("active-popup-color"));
    button.classList.add("active-popup-color");

    if (plannerPreview && button.dataset.image) {
      plannerPreview.src = button.dataset.image;
    }
  });
});

const clampPreorderQuantity = () => {
  if (!preorderQuantity) return 1;
  const value = Number.parseInt(preorderQuantity.value, 10);
  const next = Number.isFinite(value) ? Math.min(99, Math.max(1, value)) : 1;
  preorderQuantity.value = String(next);
  return next;
};

preorderMinus?.addEventListener("click", () => {
  if (!preorderQuantity) return;
  preorderQuantity.value = String(clampPreorderQuantity() - 1);
  clampPreorderQuantity();
});

preorderPlus?.addEventListener("click", () => {
  if (!preorderQuantity) return;
  preorderQuantity.value = String(clampPreorderQuantity() + 1);
  clampPreorderQuantity();
});

preorderQuantity?.addEventListener("input", clampPreorderQuantity);

preorderBtn?.addEventListener("click", async () => {
  const email = preorderInput?.value.trim() || "";

  if (!email || !preorderInput.checkValidity()) {
    preorderInput?.focus();
    preorderInput?.setAttribute("aria-invalid", "true");
    return;
  }

  preorderInput?.removeAttribute("aria-invalid");
  const activeColor = document.querySelector(".active-popup-color");
  const color = activeColor?.dataset.color || "Red";
  const quantity = clampPreorderQuantity();
  const originalText = preorderBtn.textContent;

  preorderBtn.textContent = "Wird gesendet...";
  preorderBtn.disabled = true;

  try {
    const activeColor = document.querySelector(".active-popup-color");
    const response = await fetch("/api/preorders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        color,
        image: activeColor?.dataset.image || "",
        product: "Future Me Planner",
        quantity,
        source: "main-popup"
      })
    });
    if (!response.ok) throw new Error("Request failed");

    preorderBtn.textContent = "Gesendet ✓";
    preorderInput.value = "";
  } catch {
    preorderBtn.textContent = "Bitte später erneut";
  } finally {
    setTimeout(() => {
      preorderBtn.disabled = false;
      preorderBtn.textContent = originalText || "Jetzt vorbestellen";
    }, 2200);
  }
});

newsletterForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const input = newsletterForm.querySelector("input[type='email']");
  const email = input?.value.trim() || "";

  if (!email || !email.includes("@")) {
    if (newsletterStatus) newsletterStatus.textContent = "Bitte gib eine gültige E-Mail ein.";
    input?.focus();
    return;
  }

  const submit = newsletterForm.querySelector("button");
  const originalText = submit?.textContent;

  if (submit) {
    submit.disabled = true;
    submit.textContent = "...";
  }

  fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      source: "homepage-newsletter"
    })
  })
    .then((response) => {
      if (!response.ok) throw new Error("Request failed");
      if (newsletterStatus) newsletterStatus.textContent = "Danke! Du bist eingetragen.";
      input.value = "";
    })
    .catch(() => {
      if (newsletterStatus) newsletterStatus.textContent = "Bitte später erneut versuchen.";
    })
    .finally(() => {
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalText || "→";
      }
    });
});

videoModal?.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const close = closeVideoButtons[0];
  if (event.shiftKey && document.activeElement === close) {
    event.preventDefault();
    videoPlayer.focus();
  } else if (!event.shiftKey && document.activeElement === videoPlayer) {
    event.preventDefault();
    close.focus();
  }
});
