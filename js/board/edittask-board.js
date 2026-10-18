"use strict";
import { setupTaskForm } from "../addtask.js";
import { getAddTaskModule } from "../template.js";

/**
 * Opens the task form prefilled with an existing task.
 * @param {string} taskId - The task ID.
 * @returns {void}
 */
function showEditTaskModule(taskId) {
  const task = tickets.find((t) => t.id === taskId);
  const container = document.getElementById("add-task-container");
  if (!task || !container) return;
  document.getElementById("myDialog").close();
  container.innerHTML = getAddTaskModule();
  setupTaskForm(task.status, handleTaskUpdated, task);
  setTimeout(() => container.classList.add("active"), 20);
}

/**
 * Closes the modal and tells the board to reload.
 * @returns {void}
 */
function handleTaskUpdated() {
  window.closeAddTaskModule();
  document.dispatchEvent(new CustomEvent("tasksChanged"));
}

window.showEditTaskModule = showEditTaskModule;
