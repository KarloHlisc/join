"use strict";
import { database } from "../js/config.js";
import {
  remove,
  ref,
  get,
  child,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

import { taskFormTemplate } from "./template.js";

const selectedUserIds = new Set();

export function renderTaskForm() {
  const target = document.getElementById("main-container");
  if (!target) return;
  target.innerHTML = taskFormTemplate;
}

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0]
  ).toUpperCase();
}

function createEl(type, className, text = "") {
  const el = document.createElement(type);
  el.classList.add(className);
  if (text) el.innerText = text;
  return el;
}

function createTextContainer(user) {
  const container = createEl("div", "text-container");
  container.append(
    createEl("span", "user-name", user.name),
    createEl("span", "user-email", user.email),
  );
  return container;
}

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

function createAndAppendButton(user, container, users) {
  const button = createEl("button", "user-btn");
  button.type = "button";
  if (selectedUserIds.has(user.userId)) button.classList.add("selected");
  const icon = createEl("div", "user-icon", getInitials(user.name));
  icon.style.backgroundColor = user.backgroundColor || "#000000";
  button.append(
    icon,
    createTextContainer(user),
    createEl("div", "custom-checkbox"),
  );
  button.addEventListener("click", () =>
    toggleUserSelection(user, button, users),
  );
  container.append(button);
}

/* prettier-ignore */
async function getUserList() {
  const data = await get(ref(database, "users"));
  const container = document.getElementById("dropdownList");
  if (!container || !data.exists()) return;
  container.innerHTML = container.querySelector("#add-btn-container")?.outerHTML || "";
  const rawData = data.val();
  const users = Object.keys(rawData).map((k) => ({ userId: k, ...rawData[k] })).sort((a, b) => a.name.localeCompare(b.name));
  users.forEach((user) => {
    createAndAppendButton(user, container, users);
  });
}

function openDropdown() {
  const list = document.getElementById("dropdownList");
  const arrow = document.getElementById("dropdownArrowImg");
  if (list && list.classList.contains("hidden")) {
    list.classList.remove("hidden");
    if (arrow) arrow.classList.add("rotate-180");
    getUserList();
  }
}

function filterUserList() {
  openDropdown();
  const filter =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  const buttons = document.querySelectorAll("#dropdownList .user-btn");

  buttons.forEach((btn) => {
    const name = btn.querySelector(".user-name")?.innerText.toLowerCase() || "";
    btn.style.display = name.includes(filter) ? "flex" : "none";
  });
}

async function handleDropdownToggle() {
  const list = document.getElementById("dropdownList");
  const arrow = document.getElementById("dropdownArrowImg");
  if (!list || !arrow) return;
  list.classList.toggle("hidden");
  arrow.classList.toggle("rotate-180");
  if (!list.classList.contains("hidden")) await getUserList();
}

function setupEventListeners() {
  const toggleBtn = document.getElementById("dropdownToggle");
  const searchInput = document.getElementById("searchInput");

  if (toggleBtn) toggleBtn.addEventListener("click", handleDropdownToggle);
  if (searchInput) {
    searchInput.addEventListener("input", filterUserList);
    searchInput.addEventListener("click", openDropdown);
  }
}

function init() {
  renderTaskForm();
  setupEventListeners();
}

window.renderTaskForm = renderTaskForm;
document.addEventListener("DOMContentLoaded", init);
