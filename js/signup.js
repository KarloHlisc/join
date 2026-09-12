"use strict";

import { database } from "./config.js";
import {
  ref,
  push,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

// sign up Users
const existSignUpForm = document.getElementById("signup-form");
const errEL = document.getElementById("errorMessage");

const registerUser = async (e, n, p) => {
  const data = await get(child(ref(database), "users"));
  const currentUsers = data.exists() ? data.val() : {};
  const nextNumber = Object.keys(currentUsers).length + 1;
  const customId = `userid_${String(nextNumber).padStart(2, "0")}`;
  return set(ref(database, `users/${customId}`), {
    email: e,
    name: n,
    password: p,
  });
};

const checkEmail = async (email) => {
  const data = await get(child(ref(database), "users"));
  const users = data.exists() ? data.val() : {};
  return Object.values(users).find((u) => u.email === email);
};

/* prettier-ignore */
if (existSignUpForm) {
  existSignUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEL.textContent = "";
    try {
      const val = (id) => document.getElementById(id).value.trim();
      if (await checkEmail(val("email"))) throw new Error("Email is already registered");
      if (val("password") !== val("confirm-password")) throw new Error("Your passwords don't match. Please try again");
      await registerUser(val("email"), val("name"), val("password"));
      showSuccessModal();
    } catch (err) {errEL.textContent = err.message;}
  });
}

function showSuccessModal() {
  const modal = document.getElementById("congrats-modal");
  const overlay = document.getElementById("modal-overlay");
  modal.classList.add("active");
  overlay.classList.add("active");
  setTimeout(() => {
    modal.classList.remove("active");
    overlay.classList.remove("active");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 400);
  }, 2500);
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

window.togglePasswordVisibility = togglePasswordVisibility;
setupPasswordToggle();
