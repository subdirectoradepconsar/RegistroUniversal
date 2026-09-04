const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx36YGmJroYmD9dcD3ooVFadMPHViMq_ZrWJQ2jGlRQpIrYa844V75ALPLlrHG_EIqw/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("attendance-form");
  const formContainer = document.getElementById("form-container");
  const successContainer = document.getElementById("success-container");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = document.getElementById("btn-text");
  const btnSpinner = document.getElementById("btn-spinner");
  const submitError = document.getElementById("submit-error");

  const fields = {
    organizacion: document.getElementById("organizacion"),
    nombre: document.getElementById("nombre"),
    correo: document.getElementById("correo"),
    anioNacimiento: document.getElementById("anioNacimiento"),
    genero: document.getElementById("genero")
  };

  document.querySelectorAll(".email-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const domain = chip.dataset.domain;
      const username = fields.correo.value.trim().split("@")[0];
      fields.correo.value = username ? username + domain : domain;
      clearFieldError("correo");
      fields.correo.focus();
    });
  });

  Object.entries(fields).forEach(([name, input]) => {
    input.addEventListener("input", () => clearFieldError(name));
    input.addEventListener("change", () => clearFieldError(name));
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitError.classList.add("hidden");
    if (!validateForm()) return;

    const organizacion = fields.organizacion.value;
    const nombre = fields.nombre.value.trim();
    const correo = fields.correo.value.trim();
    const anioNacimiento = fields.anioNacimiento.value;
    const genero = fields.genero.value;

    const payload = {
      organizacion,
      nombre,
      correo,
      anioNacimiento,
      genero
    };

    setLoading(true);
    try {
      await sendRegistration(payload);
      showSuccess(payload);
    } catch (error) {
      console.error("No se pudo enviar el registro:", error);
      submitError.classList.remove("hidden");
    } finally {
      setLoading(false);
    }
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    form.reset();
    clearAllErrors();
    successContainer.classList.add("hidden", "opacity-0", "scale-95");
    successContainer.classList.remove("opacity-100", "scale-100");
    formContainer.classList.remove("hidden", "opacity-0", "scale-95");
    formContainer.classList.add("opacity-100", "scale-100");
    fields.organizacion.focus();
  });

  function validateForm() {
    clearAllErrors();
    const checks = {
      organizacion: Boolean(fields.organizacion.value),
      nombre: Boolean(fields.nombre.value.trim()),
      correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.correo.value.trim()),
      anioNacimiento: Number(fields.anioNacimiento.value) >= 1920 && Number(fields.anioNacimiento.value) <= 2026,
      genero: Boolean(fields.genero.value)
    };
    Object.entries(checks).forEach(([name, valid]) => { if (!valid) showFieldError(name); });
    const firstInvalid = Object.keys(checks).find((name) => !checks[name]);
    if (firstInvalid && fields[firstInvalid]) fields[firstInvalid].focus();
    return !firstInvalid;
  }

  function showFieldError(name) {
    document.getElementById(`${name}-error`)?.classList.remove("hidden");
    fields[name]?.closest(".glass-input")?.classList.add("has-error");
  }

  function clearFieldError(name) {
    document.getElementById(`${name}-error`)?.classList.add("hidden");
    fields[name]?.closest(".glass-input")?.classList.remove("has-error");
  }

  function clearAllErrors() {
    ["organizacion", "nombre", "correo", "anioNacimiento", "genero"].forEach(clearFieldError);
    submitError.classList.add("hidden");
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.classList.toggle("hidden", isLoading);
    btnSpinner.classList.toggle("hidden", !isLoading);
  }

  async function sendRegistration(payload) {
    if (typeof google !== "undefined" && google.script?.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .doPost(payload);
      });
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  }

  function showSuccess(payload) {
    document.getElementById("summary-name").textContent = payload.nombre;
    document.getElementById("summary-email").textContent = payload.correo;
    document.getElementById("summary-gender").textContent = payload.genero;
    document.getElementById("summary-birthyear").textContent = payload.anioNacimiento;
    document.getElementById("summary-time").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    formContainer.classList.add("hidden", "opacity-0", "scale-95");
    successContainer.classList.remove("hidden", "opacity-0", "scale-95");
    successContainer.classList.add("opacity-100", "scale-100");
  }
});
