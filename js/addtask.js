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
} from "./addtask/addtask_dropdown.js";
import {
  clearSubtaskInput,
  toggleSubtaskEdit,
  saveSubtaskEdit,
  createSubtaskItem,
  addSubtask,
  getSubtasksData,
} from "./addtask/addtask_subtask.js";
import {
  setFieldError,
  validateTitle,
  validateDate,
  validateCategory,
  clearErrors,
  checkVali,
} from "./addtask/addtask_validate.js";
import {
  selectedUserIds,
  getUserList,
  filterUserList,
} from "./addtask/addtask_assign.js";
import { buildTaskData, registerTask } from "./addtask/addtask_save.js";

let existSignUpForm;
let errEL;
let taskStatus = "todo";
let onTaskCreated = null;

/**
 * Renders the Add Task form into the given container.
 * @param {string} [targetId="main-container"] - ID of the target container.
 * @returns {void}
 */
export function renderTaskForm(targetId = "main-container") {
  const target = document.getElementById(targetId);
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
  selectPriority("medium");
}

/**
 * Wires up Dropdown event listeners for the Add Task form.
 * @returns {void}
 */
function setupDropdownListeners() {
  document.getElementById("dropdownToggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown("dropdownList", "dropdownArrowImg", getUserList);
  });
  document.getElementById("categoryToggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown("categoryList", "categoryArrowImg");
  });
}

/**
 * Wires up Search event listeners for the Add Task form.
 * @returns {void}
 */
function setupSearchListeners() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.addEventListener("input", filterUserList);
  input.addEventListener("click", (e) => {
    e.stopPropagation();
    openUserDropdown(getUserList);
  });
}

/**
 * Wires up Subtask event listeners for the Add Task form.
 * @returns {void}
 */
function setupSubtaskListeners() {
  document
    .getElementById("addSubtaskBtn")
    ?.addEventListener("click", addSubtask);
  document
    .getElementById("clearSubtaskBtn")
    ?.addEventListener("click", clearSubtaskInput);
  document
    .getElementById("subtaskInput")
    ?.addEventListener("keydown", handleSubtaskEnter);
}

/**
 * Wires up all event listeners for the Add Task form.
 * @returns {void}
 */
function setupEventListeners() {
  setupDropdownListeners();
  setupSearchListeners();
  setupSubtaskListeners();
  document.getElementById("clear")?.addEventListener("click", resetForm);
  setupCategorySelection();
  document.removeEventListener("click", closeAllDropdowns);
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
 * Gets the currently selected priority value.
 * @returns {string} The selected priority, defaulting to "medium".
 */
function getSelectedPriority() {
  const activeBtn = document.querySelector(".priority-btn.active");
  return activeBtn ? activeBtn.getAttribute("data-value") : "medium";
}

/**
 * Marks one priority button as active and swaps the icons.
 * @param {string} [value="medium"] - The priority to select.
 * @returns {void}
 */
function selectPriority(value = "medium") {
  document.querySelectorAll(".priority-btn").forEach((btn) => {
    const active = btn.dataset.value === value;
    btn.classList.toggle("active", active);
    btn.querySelector("img").src =
      `../assets/icons/${btn.dataset.value}${active ? "-white" : ""}.svg`;
  });
}

/**
 * Wires up click handlers for the priority buttons and preselects medium.
 * @returns {void}
 */
function setupPriorityButtons() {
  document.querySelectorAll(".priority-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectPriority(btn.dataset.value));
  });
  selectPriority("medium");
}

/**
 * Saves the task to Firebase and disables the submit button while loading.
 * @returns {void}
 */
/* prettier-ignore */
function saveTask() {
  const btn = document.getElementById("createTask");
  btn.disabled = true;
  registerTask(buildTaskData(), taskStatus)
    .then(() => {
      resetForm();
      showSuccessModal();
    })
    .catch((err) => {
      btn.disabled = false;
      if (errEL) errEL.textContent = err.message;
    });
}

function handleSubtaskEnter(e) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  addSubtask();
}

/**
 * Handles the Add Task form submission.
 * @param {SubmitEvent} e - The form submit event.
 * @returns {void}
 */
function handleFormSubmitEvent(e) {
  e.preventDefault();
  errEL = document.getElementById("errorMessage");
  if (errEL) errEL.textContent = "";
  existSignUpForm
    .querySelectorAll(".input-error")
    .forEach((el) => el.classList.remove("input-error"));
  if (!checkVali(e)) return;
  saveTask();
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
 * Redirects to the board page.
 * @returns {void}
 */
function redirectToBoard() {
  window.location.href = "../html/board.html";
}

/**
 * Shows the task-added toast. In modal mode the callback runs immediately,
 * otherwise the user is redirected to the board.
 * @returns {void}
 */
function showSuccessModal() {
  const modal = document.getElementById("congrats-modal");
  modal.classList.add("active");
  if (onTaskCreated) onTaskCreated();
  setTimeout(() => {
    modal.classList.remove("active");
    if (!onTaskCreated) setTimeout(redirectToBoard, 400);
  }, 2500);
}

/**
 * Prepares the rendered task form for a given column status.
 * @param {string} [status="todo"] - Status assigned to the new task.
 * @param {function|null} [onCreated=null] - Callback after a task was created.
 * @returns {void}
 */
export function setupTaskForm(status = "todo", onCreated = null) {
  taskStatus = status.replace(/-/g, "");
  onTaskCreated = onCreated;
  selectedUserIds.clear();
  setupEventListeners();
  buttonVisability();
  setupFormSubmit();
  setupPriorityButtons();
}

/**
 * Initializes the Add Task page.
 * @returns {void}
 */
function init() {
  renderTaskForm();
  setupTaskForm();
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
if (document.body.dataset.page === "add-task") {
  document.addEventListener("DOMContentLoaded", init);
}
