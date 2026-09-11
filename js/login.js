"use strict";

// Password visibility toggle

function togglePasswordBtn(show) {
  const visibility = document.querySelector(".toggle-password-btn");
  if (visibility) {
    visibility.style.display = show ? "block" : "none";
  }
}

function togglePasswordVisibility(id, eyeIconId) {
  const passwordInput = document.getElementById(id);
  const eyeIcon = document.getElementById(eyeIconId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.src = "../assets/img/visibility_off.png";
  } else {
    passwordInput.type = "password";
    eyeIcon.src = "../assets/img/visibility.png";
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
