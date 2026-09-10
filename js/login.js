"use strict";

// Password visibility toggle
function togglePasswordBtn(show) {
  const visibility = document.getElementById("toggleBtn");
  visibility.style.display = show ? "block" : "none";
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eye-icon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.src = "./assets/img/visibility.png";
  } else {
    passwordInput.type = "password";
    eyeIcon.src = "./assets/img/visibility_off.png";
  }
}

function setupPasswordToggle() {
  const passwordInput = document.getElementById("password");

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      togglePasswordBtn(passwordInput.value.length > 0);
    });
  }
}
