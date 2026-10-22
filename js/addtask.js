"use strict";

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
  renderSelectedBadges,
} from "./addtask/addtask_assign.js";
import {
  buildTaskData,
  registerTask,
  updateTask,
} from "./addtask/addtask_save.js";

let editTaskId = null;
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
 * Clears assigned users, subtasks and selection state.
 * @returns {void}
 */
function clearAssignedAndSubtasks() {
  selectedUserIds.clear();
  const assigned = document.getElementById("assignedUsersContainer");
  const subtask = document.getElementById("subTaskList");
  if (assigned) assigned.innerHTML = "";
  if (subtask) subtask.innerHTML = "";
  document
    .querySelectorAll("#dropdownList .user-btn")
    .forEach((button) => button.classList.remove("selected"));
}

/**
 * Resets the Add Task form to its initial empty state.
 * @returns {void}
 */
function resetForm() {
  const form = document.getElementById("addTaskForm");
  if (!form) return;
  form.reset();
  clearAssignedAndSubtasks();
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
function saveTask() {
  const btn = document.getElementById("createTask");
  btn.disabled = true;
  sendTask(buildTaskData())
    .then(onTaskSaved)
    .catch((err) => onTaskSaveError(btn, err));
}

/**
 * Updates or registers a task depending on the form mode.
 * @param {Object} data - The task data.
 * @returns {Promise<void>}
 */
function sendTask(data) {
  return editTaskId
    ? updateTask(editTaskId, data)
    : registerTask(data, taskStatus);
}

/**
 * Resets the form and shows the success toast.
 * @returns {void}
 */
function onTaskSaved() {
  resetForm();
  showSuccessModal();
}

/**
 * Re-enables the submit button and shows the error.
 * @param {HTMLButtonElement} btn - The submit button.
 * @param {Error} err - The error that occurred.
 * @returns {void}
 */
function onTaskSaveError(btn, err) {
  btn.disabled = false;
  if (errEL) errEL.textContent = err.message;
}

/**
 * Adds a subtask when Enter is pressed, without submitting the form.
 * @param {KeyboardEvent} e - The keydown event.
 * @returns {void}
 */
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
  modal.querySelector("p").textContent = editTaskId
    ? "Task updated"
    : "task added to board";
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
export function setupTaskForm(status = "todo", onCreated = null, task = null) {
  taskStatus = status.replace(/-/g, "");
  onTaskCreated = onCreated;
  editTaskId = task ? task.id : null;
  selectedUserIds.clear();
  setupEventListeners();
  buttonVisability();
  setupFormSubmit();
  setupPriorityButtons();
  if (task) {
    fillTaskForm(task);
    setEditLabels();
  }
}

/**
 * Fills the task form with the data of an existing task.
 * @param {Object} task - The task to edit.
 * @returns {void}
 */
function fillTaskForm(task) {
  const set = (id, v) => (document.getElementById(id).value = v || "");
  set("formTitle", task.title);
  set("description", task.description);
  set("duedate", task.duedate);
  document.getElementById("categorySelectedText").innerText = task.category;
  selectPriority(task.priority || "medium");
  fillAssignedAndSubtasks(task);
}

/**
 * Preselects the assigned users and renders the subtasks of a task.
 * @param {Object} task - The task to edit.
 * @returns {void}
 */
function fillAssignedAndSubtasks(task) {
  Object.keys(task.assignedTo || {}).forEach((id) => selectedUserIds.add(id));
  renderSelectedBadges();
  const list = document.getElementById("subTaskList");
  Object.values(task.subtasks || {}).forEach((s) =>
    list.append(createSubtaskItem(s.title, s.isDone)),
  );
}

/**
 * Switches title and button text of the form to edit mode.
 * @returns {void}
 */
function setEditLabels() {
  document.querySelector("#add-task-title h1").innerText = "Edit Task";
  document.getElementById("createTask").childNodes[0].textContent =
    "Save Task ";
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
