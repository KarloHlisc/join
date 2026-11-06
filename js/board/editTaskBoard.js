"use strict";
import { setupTaskForm } from "../addTask.js";
import { getAddTaskModule } from "../templates/template.js";
import { loadTaskFormHtml } from "../utils.js";

/**
 * Opens the task form prefilled with an existing task.
 * @param {string} taskId - The task ID.
 * @returns {Promise<void>}
 */
async function showEditTaskModule(taskId) {
  const task = tickets.find((t) => t.id === taskId);
  const container = document.getElementById("add-task-container");
  if (!task || !container) return;
  document.getElementById("myDialog").close();
  container.innerHTML = getAddTaskModule(await loadTaskFormHtml());
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
