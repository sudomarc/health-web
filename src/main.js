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

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    }
  });
}

document.querySelectorAll("[data-prefill-service]").forEach((link) => {
  link.addEventListener("click", () => {
    const service = link.getAttribute("data-prefill-service");
    if (serviceSelect && service) serviceSelect.value = service;
  });
});

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
