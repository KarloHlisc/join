"use strict";

import { database } from "./js/config.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const existLoginForm = document.getElementById("login-form");
const errEL = document.getElementById("errorMessage");

//Log in as User that is already signed up
async function findUser(email, password) {
  const data = await get(child(ref(database), "users"));
  const users = data.exists() ? data.val() : {};
  return Object.values(users).find(
    (u) => u.email === email && u.password === password,
  );
}

function loginSuccess(user) {
  sessionStorage.setItem("logedInUser", JSON.stringify(user));
  window.location.href = "./html/summary.html";
}

/* prettier-ignore */
if (existLoginForm) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      errEL.textContent = "";
      try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const user = await findUser(email, password);
        if (!user)
          throw new Error("Check your email and password. Please try again.");
        loginSuccess(user);
      } catch (err) {
        errEL.textContent = err.message;
      }
    });
}

//Log in as Guest

async function logInAsGuest() {
  if (existLoginForm) {
    errEL.textContent = "";
    try {
      const email = (document.getElementById("email").value = "guest@test.com");
      const password = (document.getElementById("password").value = "Test123!");
      const user = await findUser(email, password);
      if (!user) throw new Error("Account not found.");
      loginSuccess(user);
    } catch (err) {
      errEL.textContent = err.message;
    }
  }
}

// Password visibility toggle

/* prettier-ignore */
function togglePasswordVisibility(id,eyeIconId,input = document.getElementById(id),icon = document.getElementById(eyeIconId)) {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.src = isPassword ? icon.src.replace(".png", "_off.png") : icon.src.replace("_off.png", ".png");
}

function setupPasswordToggle() {
  document.querySelectorAll("#password, #confirm-password").forEach((input) => {
    input.addEventListener("input", () => {
      const btn = input
        .closest(".input-wrapper")
        .querySelector(".toggle-password-btn");
      btn.style.display = input.value.length > 0 ? "inline-block" : "none";
    });
  });
}

window.logInAsGuest = logInAsGuest;
window.togglePasswordVisibility = togglePasswordVisibility;
setupPasswordToggle();
