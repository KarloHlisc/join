"use strict";
import { database } from "../js/config.js";
import {
  remove,
  ref,
  get,
  update,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

import {
  getAddContactModule,
  userDetailTemplate,
  getEditContactModule,
} from "./template.js";

import {
  buildUser,
  checkEmail,
  getInitials,
  createEl,
  generateNextUserId,
} from "./utils.js";

import {
  validateContactFields,
  showContactErrors,
} from "./contacts/contacts_validate.js";

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
 * reads the current values from the contact form fields.
 * @returns {object} The form values.
 */
const readContactForm = () => {
  const val = (id) => document.getElementById(id).value.trim();
  return { name: val("name"), email: val("email"), phone: val("phone") };
};

/**
 * Registers a new contact in Firebase with a generated ID and random avatar color.
 * @param {string} e - The contact's email.
 * @param {string} n - The contact's name.
 * @param {string} p - The contact's phone number.
 * @returns {Promise<void>}
 */
const registerUser = (email, name, phone) => {
  return runTransaction(ref(database, "users"), (current) => {
    const users = current || {};
    users[generateNextUserId(users)] = buildUser(email, name, "", phone);
    return users;
  });
};

/**
 * Handles the "Add contact" form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @returns {Promise<void>}
 */
const handleFormSubmit = async (e) => {
  e.preventDefault();
  const values = readContactForm();
  if (!showContactErrors(validateContactFields(values))) return;
  if (await checkEmail(values.email))
    return showContactErrors({ email: "Email is already registered" });
  await registerUser(values.email, values.name, values.phone);
  closeAddContactModule();
  toggleShowSuccessModal("congrats");
};

/**
 * Handles the "Edit contact" form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @param {string} userId - The Firebase key of the contact being edited.
 * @returns {Promise<void>}
 */
async function handleEditSubmit(e, userId) {
  e.preventDefault();
  const values = readContactForm();
  if (!showContactErrors(validateContactFields(values))) return;
  const currentData = (await get(ref(database, `users/${userId}`))).val();
  const existing = await checkEmail(values.email);
  if (existing && existing.email !== currentData?.email)
    return showContactErrors({ email: "Email is already registered" });
  await saveEditedUser(userId, currentData, values);
}

/**
 * Saves the edited contact data to Firebase.
 * @param {string} userId - The Firebase key of the contact.
 * @param {object} currentData - The contact's existing data.
 * @param {function} val - A helper to read a form field's trimmed value.
 * @returns {Promise<void>}
 */
/* prettier-ignore */
async function saveEditedUser(userId, currentData, values) {
  const updated = { ...currentData, ...values };
  await runTransaction(ref(database, "users"), (curr) => {
    if (curr) curr[userId] = updated;
    return curr;
  });
  closeAddContactModule();
  toggleShowSuccessModal("edited");
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
 * Removes a contact from the assignedTo list of all tasks.
 * @param {string} userId - The Firebase key of the contact.
 * @returns {Promise<void>}
 */
async function removeUserFromTasks(userId) {
  const snap = await get(ref(database, "tasks"));
  if (!snap.exists()) return;
  const updates = {};
  Object.entries(snap.val()).forEach(([taskId, task]) => {
    if (task.assignedTo?.[userId])
      updates[`tasks/${taskId}/assignedTo/${userId}`] = null;
  });
  if (Object.keys(updates).length) await update(ref(database), updates);
}

/**
 * Deletes a contact and removes it from all tasks.
 * @param {string} userId - The Firebase key of the contact.
 * @returns {Promise<void>}
 */
async function deleteUser(userId) {
  try {
    await removeUserFromTasks(userId);
    await remove(ref(database, `users/${userId}`));
    document.getElementById("contact-details-container").innerHTML = "";
    closeAddContactModule();
    addContactButton();
    toggleShowSuccessModal("deleted");
  } catch (err) {
    console.error("Delete failed:", err);
  }
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
