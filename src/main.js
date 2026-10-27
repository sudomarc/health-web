import { createDemoAppointment } from "./appointment-demo.mjs";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation-principale");
const requestForm = document.querySelector("#demo-form");
const serviceSelect = document.querySelector("#service");
const dateInput = document.querySelector("#preferred-date");
const statusMessage = document.querySelector("#form-status");
const yearOutput = document.querySelector("#current-year");

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

if (yearOutput) {
  yearOutput.textContent = String(new Date().getFullYear());
}
if (dateInput) {
  dateInput.min = formatLocalDate(new Date());
}

/* ------------------------------------------------------------------ */
/* Menu mobile                                                        */
/* ------------------------------------------------------------------ */
if (menuToggle && navigation) {
  function setMenuOpen(open) {
    menuToggle.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isExpanded);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Préremplissage d'un service depuis une carte                       */
/* ------------------------------------------------------------------ */
document.querySelectorAll("[data-prefill-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const service = link.getAttribute("data-prefill-service");
    if (serviceSelect && service) serviceSelect.value = service;
  });
});

/* ------------------------------------------------------------------ */
/* Formulaire de simulation (100 % local, aucun envoi)                */
/* ------------------------------------------------------------------ */
if (requestForm && serviceSelect && dateInput && statusMessage) {
  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    statusMessage.hidden = true;
    statusMessage.textContent = "";

    try {
      const result = createDemoAppointment({
        service: serviceSelect.value,
        preferredDate: dateInput.value,
        period: requestForm.querySelector("#period").value
      });
      statusMessage.textContent = result.message;
      statusMessage.hidden = false;
      statusMessage.focus();
    } catch (error) {
      statusMessage.textContent = error instanceof Error
        ? error.message
        : "La simulation n'a pas pu être préparée. Vérifiez les champs.";
      statusMessage.hidden = false;
      statusMessage.focus();
    }
  });
}

/* ------------------------------------------------------------------ */
/* Accordéon FAQ                                                      */
/* ------------------------------------------------------------------ */
document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    const answerId = button.getAttribute("aria-controls");
    const answer = answerId ? document.getElementById(answerId) : null;
    button.setAttribute("aria-expanded", String(!expanded));
    if (answer) answer.hidden = expanded;
  });
});

/* ------------------------------------------------------------------ */
/* Filtre des spécialités par lettre                                  */
/* ------------------------------------------------------------------ */
const filterButtons = document.querySelectorAll(".filter-chip");
const serviceItems = document.querySelectorAll("#service-grid .service-item");
const filterStatus = document.querySelector("#filter-status");

if (filterButtons.length && serviceItems.length) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";

      filterButtons.forEach((other) => {
        const active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });

      let visible = 0;
      serviceItems.forEach((item) => {
        const letter = item.getAttribute("data-letter");
        const show = filter === "all" || letter === filter;
        item.hidden = !show;
        if (show) visible += 1;
      });

      if (filterStatus) {
        filterStatus.textContent =
          visible + (visible > 1 ? " spécialités affichées" : " spécialité affichée");
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/* Visionneuse d'images (galerie)                                     */
/* ------------------------------------------------------------------ */
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
let galleryPosition = 0;
let lastGalleryTrigger = null;

function showGalleryImage(index) {
  if (!lightbox || !galleryItems.length) return;
  const total = galleryItems.length;
  galleryPosition = ((index % total) + total) % total;
  const item = galleryItems[galleryPosition];
  const image = item.querySelector("img");
  const label = item.querySelector(".gallery-label");
  if (lightboxImage && image) {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || "";
  }
  if (lightboxCaption && label) {
    lightboxCaption.textContent = label.textContent || "";
  }
}

function openLightbox(index, trigger) {
  if (!lightbox) return;
  lastGalleryTrigger = trigger || null;
  showGalleryImage(index);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  const close = lightbox.querySelector(".lightbox-close");
  if (close) close.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.style.overflow = "";
  if (lastGalleryTrigger) lastGalleryTrigger.focus();
}

galleryItems.forEach((item, index) => {
  item.addEventListener("click", () => openLightbox(index, item));
});

if (lightbox) {
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");

  if (closeButton) closeButton.addEventListener("click", closeLightbox);
  if (previousButton) {
    previousButton.addEventListener("click", () => showGalleryImage(galleryPosition - 1));
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => showGalleryImage(galleryPosition + 1));
  }
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showGalleryImage(galleryPosition - 1);
    if (event.key === "ArrowRight") showGalleryImage(galleryPosition + 1);
  });
}

/* ------------------------------------------------------------------ */
/* Apparition au défilement (respecte prefers-reduced-motion)          */
/* ------------------------------------------------------------------ */
const reduceMotion = typeof window.matchMedia === "function"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealElements = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const delay = element.getAttribute("data-reveal-delay");
        if (delay) element.style.setProperty("--reveal-delay", delay + " * 90ms");
        element.classList.add("is-visible");
        observer.unobserve(element);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  revealElements.forEach((element) => observer.observe(element));
}
