"use strict";
import { database } from "../config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { createEl, getInitials } from "../utils.js";
import { openUserDropdown } from "./addtask_dropdown.js";

export const selectedUserIds = new Set();

/**
 * Builds the name and email text block for a user in the assign dropdown.
 * @param {object} user - The user's data.
 * @returns {HTMLElement} The text container element.
 */
function createTextContainer(user) {
  const container = createEl("div", "text-container");
  container.append(
    createEl("span", "user-name", user.name),
    createEl("span", "user-email", user.email),
  );
  return container;
}

/**
 * Renders the initials badges for all currently selected users.
 * @param {object[]} users - All available users.
 * @param {HTMLElement} container - The badge container to render into.
 * @returns {void}
 */
function renderAssignedIcons(users, container) {
  container.innerHTML = "";
  selectedUserIds.forEach((id) => {
    const user = users.find((u) => u.userId === id);
    if (!user) return;
    const badge = createEl("div", "user-badge", getInitials(user.name));
    badge.style.backgroundColor = user.backgroundColor || "#000000";
    container.append(badge);
  });
}

/**
 * Toggles a user's selection state in the assigned-to dropdown.
 * @param {object} user - The user being toggled.
 * @param {HTMLElement} button - The user's dropdown button.
 * @param {object[]} users - All available users.
 * @returns {void}
 */
function toggleUserSelection(user, button, users) {
  if (selectedUserIds.has(user.userId)) {
    selectedUserIds.delete(user.userId);
    button.classList.remove("selected");
  } else {
    selectedUserIds.add(user.userId);
    button.classList.add("selected");
  }
  const badgeContainer = document.getElementById("assignedUsersContainer");
  if (badgeContainer) renderAssignedIcons(users, badgeContainer);
}

/**
 * Creates and appends a selectable user button to the assign dropdown.
 * @param {object} user - The user's data.
 * @param {HTMLElement} container - The dropdown list container.
 * @param {object[]} users - All available users.
 * @returns {void}
 */
/* prettier-ignore */
function createAndAppendButton(user, container, users) {
  const button = createEl("button", "user-btn");
  button.type = "button";
  if (selectedUserIds.has(user.userId)) button.classList.add("selected");
  const icon = createEl("div", "user-icon", getInitials(user.name));
  icon.style.backgroundColor = user.backgroundColor || "#000000";
  button.append(icon,createTextContainer(user),createEl("div", "custom-checkbox"));
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleUserSelection(user, button, users);
});
  container.append(button);
}

/**
 * Loads all users from Firebase into the assigned-to dropdown.
 * @returns {Promise<void>}
 */
/* prettier-ignore */
export async function getUserList() {
  const data = await get(ref(database, "users"));
  const container = document.getElementById("dropdownList");
  if (!container || !data.exists()) return;
  container.innerHTML = container.querySelector("#add-btn-container")?.outerHTML || "";
  const rawData = data.val();
  const users = Object.keys(rawData).map((k) => ({ userId: k, ...rawData[k] })).sort((a, b) => a.name.localeCompare(b.name));
  users.forEach((user) => createAndAppendButton(user, container, users));
}

/**
 * Filters the user dropdown list based on the search input.
 * @returns {void}
 */
export function filterUserList() {
  openUserDropdown(getUserList);
  const filter =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  const buttons = document.querySelectorAll("#dropdownList .user-btn");
  buttons.forEach((btn) => {
    const name = btn.querySelector(".user-name")?.innerText.toLowerCase() || "";
    btn.style.display = name.includes(filter) ? "flex" : "none";
  });
}

/**
 * Builds the assigned users object for saving to Firebase.
 * @returns {object} The assigned users, keyed by user ID.
 */
export function getAssignedUsersObj() {
  const assignedUsers = {};
  selectedUserIds.forEach((id) => {
    assignedUsers[id] = true;
  });
  return assignedUsers;
}
