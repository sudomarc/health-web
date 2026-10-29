import { createDemoAppointment } from "./appointment-demo.mjs";

/* Marque le document comme piloté par JavaScript : les éléments .reveal
   sont masqués initialement et révélés au défilement. Si ce marquage
   n'est pas appliqué (échec du chargement JS), le CSS de base garde le
   contenu visible : pas d'écran blanc. */
document.documentElement.classList.add("js-ready");

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
        if (delay) element.style.setProperty("--reveal-delay", "calc(" + delay + " * 90ms)");
        element.classList.add("is-visible");
        observer.unobserve(element);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  revealElements.forEach((element) => observer.observe(element));
}

/* ------------------------------------------------------------------ */
/* Diaporama du héros : changement automatique par fondu enchaîné     */
/* - Une image reste visible environ 2 000 ms.                        */
/* - La suivante apparaît par fondu enchaîné (opacité, ~700 ms).      */
/* - Aucun déplacement horizontal ni vertical, aucun zoom.            */
/* - Une seule minuterie, jamais dupliquée.                           */
/* - Respecte prefers-reduced-motion (animation désactivée).          */
/* ------------------------------------------------------------------ */
(function () {
  const DISPLAY_MS = 2000;
  const FADE_MS = 700;

  const media = document.querySelector(".hero-media");
  if (!media) return;
  const slides = Array.from(media.querySelectorAll("img.hero-slide"));
  if (slides.length < 2) return;

  const reduceMotion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false, addEventListener: function () {} };
  let currentIndex = 0;
  let timer = null;
  let started = false;
  const failed = new Set();

  /* Précharge toutes les images du diaporama pour éviter les flashs blancs. */
  slides.forEach((slide) => {
    const probe = new Image();
    probe.src = slide.src;
    probe.onload = function () { slide.classList.add("hero-slide--loaded"); };
    probe.onerror = function () {
      failed.add(slide);
      slide.classList.add("hero-slide--failed");
    };
  });

  function show(index) {
    index = ((index % slides.length) + slides.length) % slides.length;
    const previous = slides[currentIndex];
    currentIndex = index;
    if (previous) previous.classList.remove("is-current");
    slides[currentIndex].classList.add("is-current");
  }

  function nextSlide() {
    let index = currentIndex + 1;
    for (let attempts = 0; attempts < slides.length; attempts += 1) {
      const candidate = slides[index % slides.length];
      if (!failed.has(candidate)) {
        show(index);
        return;
      }
      index += 1;
    }
    /* Toutes les images ont échoué : on affiche l'image de secours. */
    const fallback = document.createElement("img");
    fallback.src = "./assets/img/hero-clinician.jpg";
    fallback.alt = "Image de secours du diaporama héros — photographie d'illustration";
    fallback.width = 1400;
    fallback.height = 933;
    fallback.decoding = "async";
    fallback.className = "hero-slide is-current";
    media.appendChild(fallback);
    slides.push(fallback);
    show(slides.length - 1);
  }

  function schedule() {
    if (timer !== null || reduceMotion.matches) return;
    timer = setTimeout(function tick() {
      timer = null;
      nextSlide();
      schedule();
    }, DISPLAY_MS + FADE_MS);
  }

  function start() {
    if (started) return;
    started = true;
    show(0);
    if (!reduceMotion.matches) schedule();
  }

  reduceMotion.addEventListener("change", () => {
    clearTimeout(timer);
    timer = null;
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-current", index === 0);
    });
    if (!reduceMotion.matches) schedule();
  });

  start();
})();
