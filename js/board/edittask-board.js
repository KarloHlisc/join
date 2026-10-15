"use strict";
import { setupTaskForm } from "../addtask.js";
import { getAddTaskModule } from "../template.js";

/**
 * Opens the "Add Task" modal and prepares the form for the given status.
 * @param {string} [status="todo"] - Status assigned to the new task.
 * @returns {void}
 */
function showEditTaskModule(task) {
  const container = document.getElementById("add-task-container");
  if (!container) return;
  container.innerHTML = getAddTaskModule();
  setupTaskForm(task, handleTaskCreated);
  setTimeout(() => container.classList.add("active"), 20);
}

/**
 * Closes and clears the "Add Task" modal.
 * @returns {void}
 */
function closeAddTaskModule() {
  const container = document.getElementById("add-task-container");
  if (!container) return;
  container.classList.remove("active");
  container.innerHTML = "";
}

/**
 * Closes the modal and notifies the board that a task was created.
 * @returns {void}
 */
function handleTaskCreated() {
  closeAddTaskModule();
  document.dispatchEvent(new CustomEvent("taskCreated"));
}

window.showAddTaskModule = showEditTaskModule;
window.closeAddTaskModule = closeAddTaskModule;
