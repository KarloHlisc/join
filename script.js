"use strict";

import { database } from "./js/config.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

import { getLogoutModule } from "./js/template.js";

import { isValidEmail, getInitials } from "./js/utils.js";

const existLoginForm = document.getElementById("login-form");
const errEL = document.getElementById("errorMessage");

const publicPages = ["signup.html", "legal_login.html", "policy_login.html"];

/**
 * Checks whether a page may be opened without login.
 * @param {string} path - The current pathname.
 * @returns {boolean} True if the page is public.
 */
function isPublicPage(path) {
  return !path.includes("/html/") || publicPages.some((p) => path.includes(p));
}

/**
 * Redirects to the login page when no user is logged in.
 * @returns {void}
 */
function protectPage() {
  if (isPublicPage(window.location.pathname)) return;
  if (!sessionStorage.getItem("loggedInUser"))
    window.location.replace("../index.html");
}

window.addEventListener("pageshow", protectPage);

/**
 * Finds a registered user matching the given email and password.
 * @param {string} email - The email to look up.
 * @param {string} password - The password to match.
 * @returns {Promise<object|undefined>} The matching user, or undefined.
 */
async function findUser(email, password) {
  const data = await get(child(ref(database), "users"));
  const users = data.exists() ? data.val() : {};
  const entry = Object.entries(users).find(
    ([, u]) => u.email === email && u.password === password,
  );
  return entry ? { userId: entry[0], ...entry[1] } : undefined;
}

/**
 * Stores the logged-in user in session storage and redirects to the summary page.
 * @param {object} user - The authenticated user object.
 * @returns {void}
 */
function loginSuccess(user) {
  const { password, ...safeUser } = user;
  sessionStorage.setItem("loggedInUser", JSON.stringify(safeUser));
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
  if (email && password && isValidEmail(email)) return true;
  errEL.textContent = email && !isValidEmail(email)
    ? "Please enter a valid email address."
    : "Please fill in email and password.";
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
  setLoginLoading(true);
  try {
    await attemptLogin(email, password);
  } catch (err) {
    showLoginError(err.message);
    setLoginLoading(false);
  }
}

if (existLoginForm)
  existLoginForm.addEventListener("submit", handleLoginSubmit);

/**
 * Disables or enables the login buttons while a request is running.
 * @param {boolean} isLoading - True while the request runs.
 * @returns {void}
 */
function setLoginLoading(isLoading) {
  document.getElementById("login-button").disabled = isLoading;
  document.getElementById("guest-button").disabled = isLoading;
}

/**
 * Logs in with a fixed guest account for demo purposes.
 * @returns {Promise<void>}
 */
async function logInAsGuest() {
  if (!existLoginForm) return;
  errEL.textContent = "";
  setLoginLoading(true);
  try {
    document.getElementById("email").value = "guest@test.com";
    document.getElementById("password").value = "Test123!";
    const user = await findUser("guest@test.com", "Test123!");
    if (!user) throw new Error("Account not found.");
    loginSuccess(user);
  } catch (err) {
    errEL.textContent = err.message;
    setLoginLoading(false);
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
 * Marks the active sidebar button and renders the user avatar.
 * @returns {void}
 */
function initLayout() {
  if (
    document.body &&
    !existLoginForm &&
    !document.body.classList.contains("no-sidebar")
  ) {
    setActivePage();
    userIcon();
  }
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

/**
 * Moves the preloader logo to the header logo position.
 * @param {HTMLElement} logo - The moving logo.
 * @param {HTMLElement} head - The header logo.
 * @param {HTMLElement} wrap - The logo wrapper.
 * @returns {void}
 */
function moveLogoToHeader(logo, head, wrap) {
  const t = head.getBoundingClientRect();
  const x = t.left + t.width / 2 - window.innerWidth / 2;
  const y = t.top + t.height / 2 - window.innerHeight / 2;
  wrap.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  logo.style.width = `${t.width}px`;
  logo.style.height = `${t.height}px`;
}

/**
 * Fades out and removes the preloader.
 * @param {HTMLElement|null} pre - The preloader element.
 * @param {HTMLElement|null} head - The header logo.
 * @returns {void}
 */
function finishPreloader(pre, head) {
  if (!pre) return;
  setTimeout(() => pre.classList.add("fade-out"), 500);
  setTimeout(() => {
    if (head) head.style.opacity = "1";
    pre.remove();
  }, 800);
}

window.addEventListener("load", () => {
  const logo = document.getElementById("moving-logo");
  const pre = document.getElementById("preloader");
  const head = document.querySelector(".header-logo");
  const wrap = document.querySelector(".logo-wrapper");
  if (logo && head && wrap) moveLogoToHeader(logo, head, wrap);
  finishPreloader(pre, head);
});

window.logInAsGuest = logInAsGuest;
window.togglePasswordVisibility = togglePasswordVisibility;
window.showLogoutModule = showLogoutModule;
window.closeLogoutModule = closeLogoutModule;
window.logoutFromAccount = logoutFromAccount;

document.addEventListener("DOMContentLoaded", () => {
  initLayout();
  setupPasswordToggle();
});
