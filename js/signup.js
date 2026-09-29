"use strict";

import { database } from "./config.js";
import {
  ref,
  runTransaction,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { isValidEmail } from "../script.js";

// sign up Users
const existSignUpForm = document.getElementById("signup-form");
const errEL = document.getElementById("errorMessage");

/**
 * Generates the next sequential user ID based on existing user keys.
 * @param {object} currentUsers - The current users object from Firebase.
 * @returns {string} The next user ID, e.g. "userid_03".
 */
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

/**
 * Registers a new user in Firebase with a generated ID and random avatar color.
 * @param {string} e - The user's email.
 * @param {string} n - The user's name.
 * @param {string} p - The user's password.
 * @returns {Promise<void>}
 */
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

/**
 * Generates a random hex color for the user's avatar background.
 * @returns {string} A hex color string, e.g. "#3FA1B2".
 */
function getRandomColor() {
  let characters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += characters[getRandomNumber(0, 15)];
  }

  return color;
}

/**
 * Generates a random integer between two bounds, inclusive.
 * @param {number} low - The lower bound.
 * @param {number} high - The upper bound.
 * @returns {number} A random integer.
 */
function getRandomNumber(low, high) {
  let r = Math.floor(Math.random() * (high - low + 1)) + low;
  return r;
}

/**
 * Checks whether an email address is already registered.
 * @param {string} email - The email to check.
 * @returns {Promise<object|undefined>} The matching user, or undefined.
 */
const checkEmail = async (email) => {
  const data = await get(child(ref(database), "users"));
  const users = data.exists() ? data.val() : {};
  return Object.values(users).find((u) => u.email === email);
};

/**
 * Reads the current values from the signup form fields.
 * @returns {{name: string, email: string, password: string, confirmPassword: string, checkbox: HTMLInputElement}}
 */
/* prettier-ignore */
function getSignupFormValues() {
  const val = (id) => document.getElementById(id).value.trim();
  return {
    name: val("name"), email: val("email"),
    password: val("password"), confirmPassword: val("confirm-password"),
    checkbox: document.getElementById("checkbox"),
  };
}

/**
 * Validates the signup form fields.
 * @param {object} fields - The form field values from getSignupFormValues.
 * @returns {string|null} An error message, or null if valid.
 */
/* prettier-ignore */
function validateSignupFields({name,email,password,confirmPassword,checkbox,}) {
  if (!name) return "Name is required.";
  if (!isValidEmail(email)) return "Please enter a valid email address.";
  if (!password) return "Password is required.";
  if (password !== confirmPassword)
    return "Your passwords don't match. Please try again.";
  if (!checkbox.checked) return "You must accept the privacy policy.";
  return null;
}

/**
 * Registers a new user after checking for a duplicate email.
 * @param {object} data - The validated signup data.
 * @returns {Promise<void>}
 */
async function submitSignup({ name, email, password }) {
  if (await checkEmail(email)) throw new Error("Email is already registered");
  await registerUser(email, name, password);
  showSuccessModal();
}

/**
 * Handles the signup form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @returns {Promise<void>}
 */
async function handleSignupSubmit(e) {
  e.preventDefault();
  errEL.textContent = "";
  const data = getSignupFormValues();
  const errorMsg = validateSignupFields(data);
  if (errorMsg) {
    errEL.textContent = errorMsg;
    return;
  }
  try {
    await submitSignup(data);
  } catch (err) {
    errEL.textContent = err.message;
  }
}

if (existSignUpForm)
  existSignUpForm.addEventListener("submit", handleSignupSubmit);

/**
 * Shows a success modal and leads to the index/ login site
 */
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

/**
 * Toggles a password input between hidden and visible text.
 * @param {string} id - The ID of the password input.
 * @param {string} eyeIconId - The ID of the toggle icon.
 * @returns {void}
 */
/* prettier-ignore */
function togglePasswordVisibility(id,eyeIconId,input = document.getElementById(id),icon = document.getElementById(eyeIconId)) {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.src = isPassword ? icon.src.replace(".png", "_off.png") : icon.src.replace("_off.png", ".png");
}

/**
 * Shows the password-visibility toggle button once a password field has input.
 * @returns {void}
 */
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
