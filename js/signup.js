"use strict";

import { database } from "./config.js";
import {
  ref,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import {
  isValidEmail,
  generateNextUserId,
  getRandomColor,
  checkEmail,
  bindBlurValidation,
  showFieldError,
} from "./utils.js";

// sign up Users
const existSignUpForm = document.getElementById("signup-form");
const errEL = document.getElementById("errorMessage");

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

const signupChecks = {
  name: (v) => (v.length >= 3 ? "" : "Please enter at least 3 characters."),
  email: (v) => (isValidEmail(v) ? "" : "Please enter a valid email address."),
  password: (v) => (v.length >= 6 ? "" : "Please use at least 6 characters."),
  "confirm-password": (v) =>
    v === document.getElementById("password").value.trim()
      ? ""
      : "Your passwords don't match.",
};

const signupErrorIds = {
  name: "nameError",
  email: "emailError",
  password: "passwordError",
  "confirm-password": "confirmError",
};

/**
 * Validates all signup fields and shows every error.
 * @returns {boolean} True if all fields are valid.
 */
function validateSignupFields() {
  const results = Object.keys(signupChecks).map((id) => {
    const input = document.getElementById(id);
    const message = signupChecks[id](input.value.trim());
    return showFieldError(input, message, signupErrorIds[id]);
  });
  return results.every(Boolean);
}

/**
 * Registers blur validation for all signup fields.
 * @returns {void}
 */
function setupBlurValidation() {
  Object.keys(signupChecks).forEach((id) =>
    bindBlurValidation(id, signupChecks[id], signupErrorIds[id]),
  );
  document.getElementById("password")?.addEventListener("input", () => {
    const confirm = document.getElementById("confirm-password");
    const message = signupChecks["confirm-password"](confirm.value.trim());
    if (confirm.value) showFieldError(confirm, message, "confirmError");
  });
}

/**
 * Registers a new user after checking for a duplicate email.
 * @param {object} data - The validated signup data.
 * @returns {Promise<void>}
 */
async function submitSignup({ name, email, password }) {
  document.getElementById("signup-button").disabled = true;
  try {
    if (await checkEmail(email)) throw new Error("Email is already registered");
    await registerUser(email, name, password);
    showSuccessModal();
  } catch (err) {
    updateSignupButton();
    throw err;
  }
}

/**
 * Handles the signup form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @returns {Promise<void>}
 */
async function handleSignupSubmit(e) {
  e.preventDefault();
  errEL.textContent = "";
  if (!validateSignupFields()) return;
  if (!document.getElementById("checkbox").checked) {
    errEL.textContent = "You must accept the privacy policy.";
    return;
  }
  try {
    await submitSignup(getSignupFormValues());
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
 * Enables the sign up button only if all fields are filled and privacy is accepted.
 * @returns {void}
 */
function updateSignupButton() {
  const v = getSignupFormValues();
  const filled = v.name && v.email && v.password && v.confirmPassword;
  document.getElementById("signup-button").disabled = !(
    filled && v.checkbox.checked
  );
}

/**
 * Registers input listeners that keep the sign up button state current.
 * @returns {void}
 */
function setupSignupButtonState() {
  if (!existSignUpForm) return;
  existSignUpForm.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updateSignupButton);
    input.addEventListener("change", updateSignupButton);
  });
  updateSignupButton();
}

setupBlurValidation();
setupSignupButtonState();
