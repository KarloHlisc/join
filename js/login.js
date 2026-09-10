"use strict";

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const toggleButton = document.getElementById("togglePassword");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleButton.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    toggleButton.textContent = "Show";
  }
}

function togglePasswordBtn(show) {
  const visibility = document.getElementById("toggleBtn");
  if (show) {
    visibility.style.display = "block";
  } else {
    visibility.style.display = "none";
  }
}
