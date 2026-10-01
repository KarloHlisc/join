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
import {
  closeAllDropdowns,
  toggleDropdown,
  openUserDropdown,
} from "./addtask/addtask-dropdown.js";
import {
  clearSubtaskInput,
  toggleSubtaskEdit,
  saveSubtaskEdit,
  createSubtaskItem,
  addSubtask,
  getSubtasksData,
} from "./addtask/addtask-subtask.js";
import {
  setFieldError,
  validateTitle,
  validateDate,
  validateCategory,
  clearErrors,
  checkVali,
} from "./addtask/addtask-validate.js";

const selectedUserIds = new Set();
let existSignUpForm;
let errEL;

/**
 * Renders the Add Task form into the main container.
 * @returns {void}
 */
export function renderTaskForm() {
  const target = document.getElementById("main-container");
  if (!target) return;
  target.innerHTML = taskFormTemplate;
}

/**
 * Extracts the initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The uppercase initials.
 */
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0]
  ).toUpperCase();
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
async function getUserList() {
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
function filterUserList() {
  openUserDropdown();
  const filter =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  const buttons = document.querySelectorAll("#dropdownList .user-btn");
  buttons.forEach((btn) => {
    const name = btn.querySelector(".user-name")?.innerText.toLowerCase() || "";
    btn.style.display = name.includes(filter) ? "flex" : "none";
  });
}

/**
 * Wires up click handlers for selecting a task category.
 * @returns {void}
 */
function setupCategorySelection() {
  const items = document.querySelectorAll("#categoryList .user-item");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedText = document.getElementById("categorySelectedText");
      if (selectedText)
        selectedText.innerText = item.getAttribute("data-value");
      toggleDropdown("categoryList", "categoryArrowImg");
    });
  });
}

/**
 * Shows or hides the subtask add/clear buttons based on input content.
 * @returns {void}
 */
function buttonVisability() {
  const input = document.getElementById("subtaskInput");
  input?.addEventListener("input", () => {
    const hasText = input.value.trim().length > 0;
    document.getElementById("addSubtaskBtn").style.display = hasText
      ? "flex"
      : "none";
    document.getElementById("clearSubtaskBtn").style.display = hasText
      ? "flex"
      : "none";
  });
}

/**
 * Resets the Add Task form to its initial empty state.
 * @returns {void}
 */
function resetForm() {
  const form = document.getElementById("addTaskForm");
  const assigned = document.getElementById("assignedUsersContainer");
  const subtask = document.getElementById("subTaskList");
  if (!form) return;
  form.reset();
  selectedUserIds.clear();
  if (assigned) assigned.innerHTML = "";
  if (subtask) subtask.innerHTML = "";
  const buttons = document.querySelectorAll("#dropdownList .user-btn");
  buttons.forEach((button) => button.classList.remove("selected"));
  const categoryText = document.getElementById("categorySelectedText");
  if (categoryText) categoryText.innerText = "Select task category";
}

/**
 * Wires up all event listeners for the Add Task form.
 * @returns {void}
 */
/* prettier-ignore */
function setupEventListeners() {
  document.getElementById("dropdownToggle")?.addEventListener("click", (e) => { e.stopPropagation(); toggleDropdown("dropdownList", "dropdownArrowImg", getUserList); });
  document.getElementById("categoryToggle")?.addEventListener("click", (e) => { e.stopPropagation(); toggleDropdown("categoryList", "categoryArrowImg"); });
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {searchInput.addEventListener("input", filterUserList);searchInput.addEventListener("click", (e) => { e.stopPropagation(); openUserDropdown(); });}
  document.getElementById("clear")?.addEventListener("click", resetForm);
  document.getElementById("addSubtaskBtn")?.addEventListener("click", addSubtask);
  document.getElementById("clearSubtaskBtn")?.addEventListener("click", clearSubtaskInput);
  document.getElementById("subtaskInput")?.addEventListener("keydown", (e) => e.key === "Enter" && (e.preventDefault() || addSubtask()));
  setupCategorySelection();
  document.addEventListener("click", closeAllDropdowns);
}

/**
 * Generates the next sequential task ID based on existing task keys.
 * @param {object} currenttasks - The current tasks object from Firebase.
 * @returns {string} The next task ID, e.g. "task_03".
 */
function generateNextTaskId(currenttasks) {
  const keys = Object.keys(currenttasks || {});
  if (keys.length === 0) return "task_01";
  const numbers = keys.map((k) => parseInt(k.match(/\d+/)?.[0] || 0, 10));
  return `task_${String(Math.max(...numbers) + 1).padStart(2, "0")}`;
}

/**
 * Saves a new task to Firebase with a generated ID.
 * @param {string} title - The task title.
 * @param {string} desc - The task description.
 * @param {string} date - The due date.
 * @param {string} prio - The task priority.
 * @param {string} cat - The task category.
 * @param {object} users - The assigned users, keyed by user ID.
 * @param {object} subtasks - The task's subtasks.
 * @returns {Promise<void>}
 */
/* prettier-ignore */
const registerTask = async (title, desc, date, prio, cat, users, subtasks) => {
  const tasksRef = ref(database, "tasks");
  return runTransaction(tasksRef, (currenttasks) => {
    const tasks = currenttasks || {};
    tasks[generateNextTaskId(tasks)] = {
      title, description: desc, duedate: date, status: "todo",
      priority: prio, assignedTo: users, category: cat, subtasks
    };
    return tasks;
  });
};

/**
 * Gets the currently selected priority value.
 * @returns {string} The selected priority, defaulting to "medium".
 */
function getSelectedPriority() {
  const activeBtn = document.querySelector(".priority-btn.active");
  return activeBtn ? activeBtn.getAttribute("data-value") : "medium";
}

/**
 * Wires up click handlers for the priority buttons.
 * @returns {void}
 */
function setupPriorityButtons() {
  const buttons = document.querySelectorAll(".priority-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}
/**
 * Builds the assigned users object for saving to Firebase.
 * @returns {object} The assigned users, keyed by user ID.
 */
function getAssignedUsersObj() {
  const assignedUsers = {};
  selectedUserIds.forEach((id) => {
    assignedUsers[id] = true;
  });
  return assignedUsers;
}

/**
 * Handles the Add Task form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @returns {void}
 */
/* prettier-ignore */
function handleFormSubmitEvent(e) {
  e.preventDefault();
  errEL = document.getElementById("errorMessage");
  if (errEL) errEL.textContent = "";
  existSignUpForm.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
  if (!checkVali(e)) return;
  const val = (id) => document.getElementById(id)?.value?.trim() || "";
  const cat = document.getElementById("categorySelectedText")?.innerText || "";
  registerTask(val("formTitle"), val("description"), val("duedate"), getSelectedPriority(), cat, getAssignedUsersObj(), getSubtasksData())
    .then(() => { resetForm(); showSuccessModal(); })
    .catch((err) => { if (errEL) errEL.textContent = err.message; });
}

/**
 * Wires up the Add Task form submit handler.
 * @returns {void}
 */
function setupFormSubmit() {
  existSignUpForm = document.getElementById("addTaskForm");
  existSignUpForm?.addEventListener("submit", handleFormSubmitEvent);
}

/**
 * Shows the task-added success modal and redirects to the board.
 * @returns {void}
 */
function showSuccessModal() {
  const modal = document.getElementById("congrats-modal");
  modal.classList.add("active");
  setTimeout(() => {
    modal.classList.remove("active");
    setTimeout(() => {
      window.location.href = "../html/board.html";
    }, 400);
  }, 2500);
}

/**
 * Initializes the Add Task page.
 * @returns {void}
 */
function init() {
  renderTaskForm();
  setupEventListeners();
  buttonVisability();
  setupFormSubmit();
  setupPriorityButtons();
}

window.setFieldError = setFieldError;
window.validateTitle = validateTitle;
window.validateDate = validateDate;
window.validateCategory = validateCategory;
window.clearErrors = clearErrors;
window.checkVali = checkVali;
window.clearSubtaskInput = clearSubtaskInput;
window.toggleSubtaskEdit = toggleSubtaskEdit;
window.saveSubtaskEdit = saveSubtaskEdit;
window.createSubtaskItem = createSubtaskItem;
window.addSubtask = addSubtask;
window.getSubtasksData = getSubtasksData;
window.closeAllDropdowns = closeAllDropdowns;
window.toggleDropdown = toggleDropdown;
window.openUserDropdown = openUserDropdown;
window.renderTaskForm = renderTaskForm;
document.addEventListener("DOMContentLoaded", init);
