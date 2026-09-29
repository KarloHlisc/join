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

/**
 * Opens the "Add contact" modal and wires up its form submit handler.
 * @returns {void}
 */
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

/**
 * Loads a contact's data and opens the "Edit contact" modal pre-filled with it.
 * @param {string} userId - The Firebase key of the contact to edit.
 * @returns {Promise<void>}
 */
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

/**
 * Closes and clears the add/edit contact modal.
 * @returns {void}
 */
function closeAddContactModule() {
  const container = document.getElementById("add-contact-container");
  if (!container) return;
  container.classList.remove("active");
  container.innerHTML = "";
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
 * Creates a DOM element with a class and optional text content.
 * @param {string} type - The tag name to create.
 * @param {string} className - The CSS class to apply.
 * @param {string} [text] - Optional text content.
 * @returns {HTMLElement} The created element.
 */
function createEl(type, className, text = "") {
  const el = document.createElement(type);
  el.classList.add(className);
  if (text) el.innerText = text;
  return el;
}

/**
 * Renders an alphabet section header when a new starting letter is reached.
 * @param {string} name - The contact's name.
 * @param {string} lastLetter - The last rendered section letter.
 * @param {HTMLElement} container - The list container to append the header to.
 * @returns {string} The current section letter.
 */
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

/**
 * Builds the name and email text block for a contact list entry.
 * @param {object} user - The contact's data.
 * @returns {HTMLElement} The text container element.
 */
function createTextContainer(user) {
  const container = createEl("div", "text-container");
  const nameSpan = createEl("span", "user-name", user.name);
  const emailSpan = createEl("span", "user-email", user.email);
  container.append(nameSpan, emailSpan);
  return container;
}

/**
 * Renders the detail view for the selected contact.
 * @param {object} user - The contact's data.
 * @returns {void}
 */
function showDetails(user) {
  const container = document.getElementById("contact-details-container");
  const initials = getInitials(user.name);
  if (container) container.innerHTML = userDetailTemplate(user, initials);
}

/**
 * Creates and appends a contact list button to the given container.
 * @param {object} user - The contact's data.
 * @param {HTMLElement} container - The list container.
 * @returns {void}
 */
function createAndAppendButton(user, container) {
  const button = createEl("button", "user-btn");
  const icon = createEl("div", "user-icon", getInitials(user.name));
  icon.style.backgroundColor = user.backgroundColor || "#000000";
  const textContainer = createTextContainer(user);
  button.append(icon, textContainer);
  button.addEventListener("click", () => showDetails(user));
  container.append(button);
}

/**
 * Loads all contacts from Firebase and renders them as a sorted list.
 * @returns {Promise<void>}
 */
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

/**
 * Renders the "Add new contact" button at the top of the contact list.
 * @returns {HTMLElement|undefined} The list container element.
 */
function addContactButton() {
  const container = document.getElementById("list-container");
  if (!container) return container;
  container.innerHTML = `<div id="add-btn-container"><button id="add-new-contact" onclick="showAddContactModule()">Add new contact<img src="../assets/icons/person_add.svg" alt="add-icon" /></button></div>`;
  return container;
}

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
 * Registers a new contact in Firebase with a generated ID and random avatar color.
 * @param {string} e - The contact's email.
 * @param {string} n - The contact's name.
 * @param {string} p - The contact's phone number.
 * @returns {Promise<void>}
 */
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

/**
 * Generates a random hex color for the contact's avatar background.
 * @returns {string} A hex color string.
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
 * Handles the "Add contact" form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @returns {Promise<void>}
 */
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
    toggleShowSuccessModal("congrats");
  } catch (err) { if (errorDisplay) errorDisplay.textContent = err.message; }
};

/**
 * Handles the "Edit contact" form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @param {string} userId - The Firebase key of the contact being edited.
 * @returns {Promise<void>}
 */
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

/**
 * Saves the edited contact data to Firebase.
 * @param {string} userId - The Firebase key of the contact.
 * @param {object} currentData - The contact's existing data.
 * @param {function} val - A helper to read a form field's trimmed value.
 * @returns {Promise<void>}
 */
/* prettier-ignore */
async function saveEditedUser(userId, currentData, val) {
  const updated = {...currentData,name: val("name"),email: val("email"),phone: val("phone"),};
  await runTransaction(ref(database, "users"), (curr) => {
    if (curr) curr[userId] = updated;
    return curr;
  });
  closeAddContactModule();
  toggleShowSuccessModal("edited")
}

/**
 * Shows a success modal and refreshes the contact list.
 * @param {string} id - The modal ID prefix ("congrats", "edited", or "deleted").
 * @returns {void}
 */
function toggleShowSuccessModal(id) {
  const modal = document.getElementById(`${id}-modal`);
  if (!modal) return;
  modal.classList.add("active");
  getUserList();
  setTimeout(() => {
    modal.classList.remove("active");
  }, 1000);
}

/**
 * Deletes a contact from Firebase and updates the UI.
 * @param {string} userId - The Firebase key of the contact to delete.
 * @returns {Promise<void>}
 */
function deleteUser(userId) {
  return remove(ref(database, `users/${userId}`))
    .then(() => {
      const details = document.getElementById("contact-details-container");
      if (details) details.innerHTML = "";
      closeAddContactModule();
      addContactButton();
      toggleShowSuccessModal("deleted");
    })
    .catch((err) => console.error("Fehler:", err));
}

/**
 * Initializes the contacts page.
 * @returns {void}
 */
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
