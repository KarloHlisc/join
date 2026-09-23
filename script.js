"use strict";

import { database } from "./js/config.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

import { getLayoutHtml, getLogoutModule, helpTemplate } from "./js/template.js";

const existLoginForm = document.getElementById("login-form");
const errEL = document.getElementById("errorMessage");
let currentPage = "main-container";

async function findUser(email, password) {
  const data = await get(child(ref(database), "users"));
  const users = data.exists() ? data.val() : {};
  return Object.values(users).find(
    (u) => u.email === email && u.password === password,
  );
}

function loginSuccess(user) {
  sessionStorage.setItem("loggedInUser", JSON.stringify(user));
  window.location.href = "./html/summary.html";
}

if (existLoginForm) {
  existLoginForm.addEventListener("submit", async (e) => {
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

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const ini = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  return ini.toUpperCase();
}

function userIcon() {
  const icon = document.querySelector(".user-icon");
  const stored = sessionStorage.getItem("loggedInUser");
  if (!icon || !stored) return;
  const user = JSON.parse(stored);
  if (!user.name) return;
  icon.innerText = getInitials(user.name);
  icon.style.backgroundColor = user.backgroundColor || "#000000";
}

function setActivePage() {
  const page = window.location.pathname.split("/").pop().replace(".html", "");
  document.getElementById(`nav-${page}`)?.classList.add("active-site");
}

function initLayout() {
  if (
    document.body &&
    !existLoginForm &&
    !document.body.classList.contains("no-sidebar")
  ) {
    document.body.insertAdjacentHTML("afterbegin", getLayoutHtml());
    setActivePage();
    userIcon();
  }
}

function openHelpPage() {
  const main = document.getElementById(currentPage);
  if (main) main.style.display = "none";
  const helpContainer = document.getElementById("help-container");
  if (helpContainer) helpContainer.innerHTML = helpTemplate();
  const helpBtn = document.getElementById("help-btn");
  if (helpBtn) helpBtn.style.display = "none";
}

function closeHelpPage() {
  const helpContainer = document.getElementById("help-container");
  if (helpContainer) helpContainer.innerHTML = "";
  const main = document.getElementById(currentPage);
  if (main) main.style.display = "block";
  const helpBtn = document.getElementById("help-btn");
  if (helpBtn) helpBtn.style.display = "inline-block";
}

function showLogoutModule() {
  const container = document.getElementById("logout-container");
  if (!container) return;
  container.innerHTML = getLogoutModule();
  container.classList.add("active");
}

function closeLogoutModule() {
  const container = document.getElementById("logout-container");
  if (!container) return;
  container.classList.remove("active");
  container.innerHTML = "";
}

function logoutFromAccount() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "../index.html";
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
