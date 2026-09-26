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
let existSignUpForm;
let errEL;

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

function closeAllDropdowns() {
  document.getElementById("dropdownList")?.classList.add("hidden");
  document.getElementById("categoryList")?.classList.add("hidden");
  document.getElementById("dropdownArrowImg")?.classList.remove("rotate-180");
  document.getElementById("categoryArrowImg")?.classList.remove("rotate-180");
}

function toggleDropdown(listId, arrowId, callback = null) {
  const list = document.getElementById(listId);
  const arrow = document.getElementById(arrowId);
  if (!list || !arrow) return;
  const opening = list.classList.contains("hidden");
  closeAllDropdowns();
  if (opening) {
    list.classList.remove("hidden");
    arrow.classList.add("rotate-180");
    if (callback) callback();
  }
}

function openUserDropdown() {
  const list = document.getElementById("dropdownList");
  if (list && list.classList.contains("hidden")) {
    toggleDropdown("dropdownList", "dropdownArrowImg", getUserList);
  }
}

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

function clearSubtaskInput() {
  const input = document.getElementById("subtaskInput");
  if (!input) return;
  input.value = "";
  document.getElementById("addSubtaskBtn").style.display = "none";
  document.getElementById("clearSubtaskBtn").style.display = "none";
}

function toggleSubtaskEdit(li, isEditing) {
  li.classList.toggle("editing", isEditing);
  const input = li.querySelector(".subtask-edit-input");
  const textSpan = li.querySelector(".subtask-text");
  const editImg = li.querySelector(".edit-btn img");

  if (isEditing && input) {
    input.value = textSpan.innerText;
    input.focus();
    if (editImg) editImg.src = "../assets/icons/darkcheck.svg";
  } else if (editImg) {
    editImg.src = "../assets/icons/edit.svg";
  }
}

function saveSubtaskEdit(li) {
  const input = li.querySelector(".subtask-edit-input");
  const textSpan = li.querySelector(".subtask-text");
  if (input && textSpan && input.value.trim())
    textSpan.innerText = input.value.trim();
  toggleSubtaskEdit(li, false);
}

/* prettier-ignore */
function createSubtaskItem(text) {
  const li = createEl("li", "subtask-item");
  li.innerHTML = `<div><span>•</span><span class="subtask-text">${text}</span></div><input type="text" id="subtaskInputfield" class="subtask-edit-input" /><div class="subtask-actions"><button type="button" class="edit-btn"><img src="../assets/icons/edit.svg" alt="Edit" /></button><button type="button" class="delete-btn"><img src="../assets/icons/delete.svg" alt="Delete" /></button></div>`;
  li.addEventListener("dblclick", () => toggleSubtaskEdit(li, true));
  li.querySelector(".edit-btn").addEventListener("click", () => toggleSubtaskEdit(li, true));
  li.querySelector(".delete-btn").addEventListener("click", () => li.remove());
  const input = li.querySelector(".subtask-edit-input");
  input.addEventListener("keydown", (e) => e.key === "Enter" && saveSubtaskEdit(li));
  input.addEventListener("blur", () => saveSubtaskEdit(li));
  return li;
}

function addSubtask() {
  const input = document.getElementById("subtaskInput");
  const container = document.getElementById("subTaskList");
  if (!input || !container || !input.value.trim()) return;
  container.append(createSubtaskItem(input.value.trim()));
  clearSubtaskInput();
}

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

function generateNextTaskId(currenttasks) {
  const keys = Object.keys(currenttasks || {});
  if (keys.length === 0) return "task_01";
  const numbers = keys.map((k) => parseInt(k.match(/\d+/)?.[0] || 0, 10));
  return `task_${String(Math.max(...numbers) + 1).padStart(2, "0")}`;
}

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

function getSelectedPriority() {
  const activeBtn = document.querySelector(".priority-btn.active");
  return activeBtn ? activeBtn.getAttribute("data-value") : "medium";
}

function setupPriorityButtons() {
  const buttons = document.querySelectorAll(".priority-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function getSubtasksData() {
  const subtasks = {};
  document.querySelectorAll("#subTaskList .subtask-item").forEach((item, i) => {
    const text = item.querySelector(".subtask-text")?.innerText || "";
    subtasks[`subtask_${i}`] = { title: text, isDone: false };
  });
  return subtasks;
}

function clearErrors() {
  const titleErr = document.getElementById("errorTitle");
  const dateErr = document.getElementById("errorDate");
  if (titleErr) titleErr.textContent = "";
  if (dateErr) dateErr.textContent = "";
}

/* prettier-ignore */
function checkVali(e) {
  clearErrors();
  if (!existSignUpForm.checkValidity()) {
    e.preventDefault();
    existSignUpForm.querySelectorAll(":invalid").forEach((el) => el.classList.add("input-error"));
    if (!document.getElementById("formTitle").checkValidity()) {document.getElementById("errorTitle").textContent = "This field is required";}
    if (!document.getElementById("duedate").checkValidity()) {document.getElementById("errorDate").textContent = "This field is required";}
    return false;
  }
  return true;
}

function getAssignedUsersObj() {
  const assignedUsers = {};
  selectedUserIds.forEach((id) => {
    assignedUsers[id] = true;
  });
  return assignedUsers;
}

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

function setupFormSubmit() {
  existSignUpForm = document.getElementById("addTaskForm");
  existSignUpForm?.addEventListener("submit", handleFormSubmitEvent);
}

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

function init() {
  renderTaskForm();
  setupEventListeners();
  buttonVisability();
  setupFormSubmit();
  setupPriorityButtons();
}

window.renderTaskForm = renderTaskForm;
document.addEventListener("DOMContentLoaded", init);
