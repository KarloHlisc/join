"use strict";

import { database } from "./js/config.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

import { getLayoutHtml, getLogoutModule, helpTemplate } from "./js/template.js";
import {
  getPolicyTemplate,
  getLegalTemplate,
} from "./js/legal_policy_templates.js";

/**
 * Checks whether a string is a syntactically valid email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the format is valid.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * renders the shared policy notice markup injected into policy-after-login-container .
 */
function renderPolicyPage() {
  const container = document.getElementById("policy-after-login-container");
  if (container) container.innerHTML = getPolicyTemplate();
}

/**
 * renders the shared legal notice markup injected into legal-after-login-container .
 */
function renderLegalPage() {
  const container = document.getElementById("legal-after-login-container");
  if (container) container.innerHTML = getLegalTemplate();
}

const existLoginForm = document.getElementById("login-form");
const errEL = document.getElementById("errorMessage");
let currentPage = "main-container";

/**
 * Adds an addeventlistener to the pages that doesnt allow access without a logged in user.
 */
window.addEventListener("pageshow", function (event) {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes("index.html");
  const isSignupPage = currentPath.includes("signup.html");
  const isLegalPage = currentPath.includes("legal_login.html");
  const isPolicyPage = currentPath.includes("policy_login.html");
  if (
    !isLoginPage &&
    !isSignupPage &&
    !isLegalPage &&
    !isPolicyPage &&
    !sessionStorage.getItem("loggedInUser")
  ) {
    window.location.replace("../index.html");
  }
});

/**
 * Finds a registered user matching the given email and password.
 * @param {string} email - The email to look up.
 * @param {string} password - The password to match.
 * @returns {Promise<object|undefined>} The matching user, or undefined.
 */
async function findUser(email, password) {
  const data = await get(child(ref(database), "users"));
  const users = data.exists() ? data.val() : {};
  return Object.values(users).find(
    (u) => u.email === email && u.password === password,
  );
}

/**
 * Stores the logged-in user in session storage and redirects to the summary page.
 * @param {object} user - The authenticated user object.
 * @returns {void}
 */
function loginSuccess(user) {
  sessionStorage.setItem("loggedInUser", JSON.stringify(user));
  window.location.href = "./html/summary.html";
}

/**
 * Validates that email and password fields are filled before login.
 * @param {string} email - The entered email.
 * @param {string} password - The entered password.
 * @returns {boolean} True if both fields are filled.
 */
/* prettier-ignore */
function validateLoginFields(email, password) {
  const inputs = document.querySelectorAll("#email, #password");
  inputs.forEach((input) => input.classList.remove("input-error"));
  if (email && password) return true;
  errEL.textContent = "Please fill in email and password.";
  inputs.forEach((input) => input.classList.add("input-error"));
  return false;
}

/**
 * Attempts to log in with the given credentials and redirects on success.
 * @param {string} email - The entered email.
 * @param {string} password - The entered password.
 * @returns {Promise<void>}
 */
async function attemptLogin(email, password) {
  const user = await findUser(email, password);
  if (!user)
    throw new Error("Check your email and password. Please try again.");
  loginSuccess(user);
}

/**
 * Displays a login error message and highlights the invalid fields.
 * @param {string} message - The error message to display.
 * @returns {void}
 */
function showLoginError(message) {
  errEL.textContent = message;
  document
    .querySelectorAll("#email, #password")
    .forEach((input) => input.classList.add("input-error"));
}

/**
 * Handles the login form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @returns {Promise<void>}
 */
async function handleLoginSubmit(e) {
  e.preventDefault();
  errEL.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!validateLoginFields(email, password)) return;
  try {
    await attemptLogin(email, password);
  } catch (err) {
    showLoginError(err.message);
  }
}

if (existLoginForm)
  existLoginForm.addEventListener("submit", handleLoginSubmit);

/**
 * Logs in with a fixed guest account for demo purposes.
 * @returns {Promise<void>}
 */
async function logInAsGuest() {
  if (existLoginForm) {
    errEL.textContent = "";
    try {
      document.getElementById("email").value = "guest@test.com";
      document.getElementById("password").value = "Test123!";
      const user = await findUser("guest@test.com", "Test123!");
      if (!user) throw new Error("Account not found.");
      loginSuccess(user);
    } catch (err) {
      errEL.textContent = err.message;
    }
  }
}

/**
 * Toggles a password input between hidden and visible text.
 * @param {string} id - The ID of the password input.
 * @param {string} eyeIconId - The ID of the toggle icon.
 * @returns {void}
 */
function togglePasswordVisibility(id, eyeIconId) {
  const input = document.getElementById(id);
  const icon = document.getElementById(eyeIconId);
  if (!input || !icon) return;
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  icon.src = isPassword
    ? icon.src.replace(".png", "_off.png")
    : icon.src.replace("_off.png", ".png");
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
        ?.querySelector(".toggle-password-btn");
      if (btn)
        btn.style.display = input.value.length > 0 ? "inline-block" : "none";
    });
  });
}

/**
 * Extracts the initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The uppercase initials.
 */
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const ini = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  return ini.toUpperCase();
}

/**
 * Renders the logged-in user's initials and color on the header avatar.
 * @returns {void}
 */
function userIcon() {
  const icon = document.querySelector(".user-icon");
  const stored = sessionStorage.getItem("loggedInUser");
  if (!icon || !stored) return;
  const user = JSON.parse(stored);
  if (!user.name) return;
  icon.innerText = getInitials(user.name);
  icon.style.backgroundColor = user.backgroundColor || "#000000";
}

/**
 * Highlights the sidebar navigation button for the current page.
 * @returns {void}
 */
function setActivePage() {
  const page = window.location.pathname.split("/").pop().replace(".html", "");
  document.getElementById(`nav-${page}`)?.classList.add("active-site");
}

/**
 * Renders the logged-in layout on pages that require it.
 * @returns {void}
 */
function initLayout() {
  if (
    document.body &&
    !existLoginForm &&
    !document.body.classList.contains("no-sidebar")
  ) {
    document.body.insertAdjacentHTML("afterbegin", getLayoutHtml());
    renderPolicyPage();
    renderLegalPage();
    setActivePage();
    userIcon();
  }
}

/**
 * Opens the static help page and hides the main content.
 * @returns {void}
 */
function openHelpPage() {
  const main = document.getElementById(currentPage);
  if (main) main.style.display = "none";
  const helpContainer = document.getElementById("help-container");
  if (helpContainer) helpContainer.innerHTML = helpTemplate();
  const helpBtn = document.getElementById("help-btn");
  if (helpBtn) helpBtn.style.display = "none";
}

/**
 * Closes the help page and restores the main content.
 * @returns {void}
 */
function closeHelpPage() {
  const helpContainer = document.getElementById("help-container");
  if (helpContainer) helpContainer.innerHTML = "";
  const main = document.getElementById(currentPage);
  if (main) main.style.display = "block";
  const helpBtn = document.getElementById("help-btn");
  if (helpBtn) helpBtn.style.display = "inline-block";
}

/**
 * Opens the logout dropdown module.
 * @returns {void}
 */
function showLogoutModule() {
  const container = document.getElementById("logout-container");
  if (!container) return;
  container.innerHTML = getLogoutModule();
  container.classList.add("active");
}

/**
 * Closes the logout dropdown module.
 * @returns {void}
 */
function closeLogoutModule() {
  const container = document.getElementById("logout-container");
  if (!container) return;
  container.classList.remove("active");
  container.innerHTML = "";
}

/**
 * Clears the session and redirects to the login page.
 * @returns {void}
 */
function logoutFromAccount() {
  sessionStorage.removeItem("loggedInUser");
  window.location.replace("../index.html");
}

window.logInAsGuest = logInAsGuest;
window.togglePasswordVisibility = togglePasswordVisibility;
window.showLogoutModule = showLogoutModule;
window.closeLogoutModule = closeLogoutModule;
window.logoutFromAccount = logoutFromAccount;
window.openHelpPage = openHelpPage;
window.closeHelpPage = closeHelpPage;

document.addEventListener("DOMContentLoaded", () => {
  initLayout();
  setupPasswordToggle();
});
