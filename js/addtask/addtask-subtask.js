"use strict";

/**
 * Clears the subtask input field and hides its action buttons.
 * @returns {void}
 */
export function clearSubtaskInput() {
  const input = document.getElementById("subtaskInput");
  if (!input) return;
  input.value = "";
  document.getElementById("addSubtaskBtn").style.display = "none";
  document.getElementById("clearSubtaskBtn").style.display = "none";
}

/**
 * Switches a subtask list item between view and edit mode.
 * @param {HTMLElement} li - The subtask list item.
 * @param {boolean} isEditing - Whether to enter edit mode.
 * @returns {void}
 */
export function toggleSubtaskEdit(li, isEditing) {
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

/**
 * Saves the edited text of a subtask and exits edit mode.
 * @param {HTMLElement} li - The subtask list item.
 * @returns {void}
 */
export function saveSubtaskEdit(li) {
  const input = li.querySelector(".subtask-edit-input");
  const textSpan = li.querySelector(".subtask-text");
  if (input && textSpan && input.value.trim())
    textSpan.innerText = input.value.trim();
  toggleSubtaskEdit(li, false);
}

/**
 * Creates a subtask list item with edit and delete controls.
 * @param {string} text - The subtask text.
 * @returns {HTMLElement} The subtask list item.
 */
/* prettier-ignore */
export function createSubtaskItem(text) {
  const li = document.createElement("li");
  li.classList.add("subtask-item");
  li.innerHTML = `<div><span>•</span><span class="subtask-text">${text}</span></div><input type="text" id="subtaskInputfield" class="subtask-edit-input" /><div class="subtask-actions"><button type="button" class="edit-btn"><img src="../assets/icons/edit.svg" alt="Edit" /></button><button type="button" class="delete-btn"><img src="../assets/icons/delete.svg" alt="Delete" /></button></div>`;
  li.addEventListener("dblclick", () => toggleSubtaskEdit(li, true));
  li.querySelector(".edit-btn").addEventListener("click", () => toggleSubtaskEdit(li, true));
  li.querySelector(".delete-btn").addEventListener("click", () => li.remove());
  const input = li.querySelector(".subtask-edit-input");
  input.addEventListener("keydown", (e) => e.key === "Enter" && saveSubtaskEdit(li));
  input.addEventListener("blur", () => saveSubtaskEdit(li));
  return li;
}

/**
 * Adds a new subtask from the input field to the subtask list.
 * @returns {void}
 */
export function addSubtask() {
  const input = document.getElementById("subtaskInput");
  const container = document.getElementById("subTaskList");
  if (!input || !container || !input.value.trim()) return;
  container.append(createSubtaskItem(input.value.trim()));
  clearSubtaskInput();
}

/**
 * Collects all subtasks currently in the subtask list.
 * @returns {object} The subtasks, keyed by generated subtask ID.
 */
export function getSubtasksData() {
  const subtasks = {};
  document.querySelectorAll("#subTaskList .subtask-item").forEach((item, i) => {
    const text = item.querySelector(".subtask-text")?.innerText || "";
    subtasks[`subtask_${i}`] = { title: text, isDone: false };
  });
  return subtasks;
}
