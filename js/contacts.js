"use strict";
import { database } from "../js/config.js";
import {
  remove,
  ref,
  get,
  child,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import {
  getAddContactModule,
  userDetailTemplate,
  getEditContactModule,
} from "./template.js";

function showAddContactModule() {
  const container = document.getElementById("add-contact-container");
  if (!container) return;
  container.innerHTML = getAddContactModule();
  document
    .getElementById("add-contact-form")
    ?.addEventListener("submit", handleFormSubmit);
  setTimeout(() => {
    container.classList.add("active");
  }, 20);
}

async function showEditContactModule(userId) {
  const data = await get(ref(database, `users/${userId}`));
  if (!data.exists()) return;
  const user = { userId, ...data.val() };
  const initials = getInitials(user.name);
  const container = document.getElementById("add-contact-container");
  if (!container) return;
  container.innerHTML = getEditContactModule(user, initials);
  document
    .getElementById("add-contact-form")
    ?.addEventListener("submit", (e) => handleEditSubmit(e, userId));
  setTimeout(() => container.classList.add("active"), 20);
}

function closeAddContactModule() {
  const container = document.getElementById("add-contact-container");
  if (!container) return;
  container.classList.remove("active");
  container.innerHTML = "";
}

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const ini = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  return ini.toUpperCase();
}

function createEl(type, className, text = "") {
  const el = document.createElement(type);
  el.classList.add(className);
  if (text) el.innerText = text;
  return el;
}

function checkAndRenderHeader(name, lastLetter, container) {
  const currentLetter = name.charAt(0).toUpperCase();
  if (currentLetter !== lastLetter) {
    const header = document.createElement("span");
    header.classList.add("current-letter");
    header.innerText = currentLetter;
    container.append(header);
    return currentLetter;
  }
  return lastLetter;
}

function createTextContainer(user) {
  const container = createEl("div", "text-container");
  const nameSpan = createEl("span", "user-name", user.name);
  const emailSpan = createEl("span", "user-email", user.email);
  container.append(nameSpan, emailSpan);
  return container;
}

function showDetails(user) {
  const container = document.getElementById("contact-details-container");
  const initials = getInitials(user.name);
  if (container) container.innerHTML = userDetailTemplate(user, initials);
}

function createAndAppendButton(user, container) {
  const button = createEl("button", "user-btn");
  const icon = createEl("div", "user-icon", getInitials(user.name));
  icon.style.backgroundColor = user.backgroundColor || "#000000";
  const textContainer = createTextContainer(user);
  button.append(icon, textContainer);
  button.addEventListener("click", () => showDetails(user));
  container.append(button);
}

/* prettier-ignore */
async function getUserList() {
  const data = await get(ref(database, "users"));
  const container = document.getElementById("list-container");
  if (!container || !data.exists()) return;
  const btnHtml =container.querySelector("#add-btn-container")?.outerHTML || "";
  container.innerHTML = btnHtml;
  const rawData = data.val();
  const users = Object.keys(rawData).map((k) => ({ userId: k, ...rawData[k] }));
  users.sort((a, b) => a.name.localeCompare(b.name));
  let lastLetter = "";
  users.forEach((user) => { lastLetter = checkAndRenderHeader(user.name, lastLetter, container);
    createAndAppendButton(user, container);
  });
}

function addContactButton() {
  const container = document.getElementById("list-container");
  if (!container) return container;
  container.innerHTML = `<div id="add-btn-container"><button id="add-new-contact" onclick="showAddContactModule()">Add new contact<img src="../assets/icons/person_add.svg" alt="add-icon" /></button></div>`;
  return container;
}

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
    users[customId] = {email: e,name: n,password: "",backgroundColor: getRandomColor(),phone: p};
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
const handleFormSubmit = async (e) => {
  e.preventDefault();
  const errorDisplay = document.getElementById("errorMessage");
  if (errorDisplay) errorDisplay.textContent = "";
  try {
    const val = (id) => document.getElementById(id).value.trim();
    if (await checkEmail(val("email"))) throw new Error("Email is already registered");
    await registerUser(val("email"), val("name"), val("phone"));
    closeAddContactModule()
    showSuccessModal();
  } catch (err) { if (errorDisplay) errorDisplay.textContent = err.message; }
};

async function handleEditSubmit(e, userId) {
  e.preventDefault();
  const val = (id) => document.getElementById(id).value.trim();
  const errorDisplay = document.getElementById("errorMessage");
  if (errorDisplay) errorDisplay.textContent = "";
  const existingUser = await checkEmail(val("email"));
  const currentData = (await get(ref(database, `users/${userId}`))).val();
  if (existingUser && existingUser.email !== currentData?.email) {
    if (errorDisplay) errorDisplay.textContent = "Email is already registered";
    return;
  }
  await saveEditedUser(userId, currentData, val);
}

/* prettier-ignore */
async function saveEditedUser(userId, currentData, val) {
  const updated = {...currentData,name: val("name"),email: val("email"),phone: val("phone"),};
  await runTransaction(ref(database, "users"), (curr) => {
    if (curr) curr[userId] = updated;
    return curr;
  });
  closeAddContactModule();
}

function showSuccessModal() {
  const modal = document.getElementById("congrats-modal");
  if (!modal) return;
  modal.classList.add("active");
  setTimeout(() => {
    modal.classList.remove("active");
    getUserList();
  }, 2500);
}

function deleteUser(userId) {
  return remove(ref(database, `users/${userId}`))
    .then(() => {
      const details = document.getElementById("contact-details-container");
      if (details) details.innerHTML = "";
      closeAddContactModule();
      addContactButton();
      getUserList();
    })
    .catch((err) => console.error("Fehler:", err));
}

function init() {
  addContactButton();
  getUserList();
}

window.showEditContactModule = showEditContactModule;
window.deleteUser = deleteUser;
window.showDetails = showDetails;
window.init = init;
window.addContactButton = addContactButton;
window.getUserList = getUserList;
window.showAddContactModule = showAddContactModule;
window.closeAddContactModule = closeAddContactModule;

document.addEventListener("DOMContentLoaded", init);
