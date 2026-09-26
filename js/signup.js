"use strict";

import { database } from "./config.js";
import {
  ref,
  runTransaction,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

// sign up Users
const existSignUpForm = document.getElementById("signup-form");
const errEL = document.getElementById("errorMessage");

function generateNextUserId(currentUsers) {
  const keys = Object.keys(currentUsers || {});
  if (keys.length === 0) return "userid_01";
  const numbers = keys.map((key) => {
    const match = key.match(/\d+/);
    return match ? parseInt(match, 10) : 0;
  });
  const nextNumber = Math.max(...numbers) + 1;
  return `userid_${String(nextNumber).padStart(2, "0")}`;
}
/* prettier-ignore */
const registerUser = async (e, n, p) => {
  const usersRef = ref(database, "users");
  return runTransaction(usersRef, (currentUsers) => {
    const users = currentUsers || {};
    const customId = generateNextUserId(users);
    users[customId] = {email: e,name: n,password: p,backgroundColor: getRandomColor(),phone: ""};
    return users;
  });
};

function getRandomColor() {
  let characters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += characters[getRandomNumber(0, 15)];
  }

  return color;
}

function getRandomNumber(low, high) {
  let r = Math.floor(Math.random() * (high - low + 1)) + low;
  return r;
}

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
