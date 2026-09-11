"use strict";

// Password visibility toggle
function handlePasswordInput(inputElement) {
  const toggleBtn = inputElement.parentElement.querySelector(
    ".toggle-password-btn",
  );
  if (toggleBtn) {
    toggleBtn.style.display = inputElement.value.length > 0 ? "block" : "none";
  }
}

function togglePasswordVisibility(id, eyeIconId) {
  const passwordInput = document.getElementById(id);
  const eyeIcon = document.getElementById(eyeIconId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.src = "../assets/img/visibility.png";
  } else {
    passwordInput.type = "password";
    eyeIcon.src = "../assets/img/visibility_off.png";
  }
}

function setupPasswordToggle() {
  const passwordFields = ["password", "confirm-password"];

  passwordFields.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", function () {
        handlePasswordInput(input);
      });
    }
  });
}
