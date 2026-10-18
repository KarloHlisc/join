"use strict";
import { database } from "../config.js";
import {
  ref,
  runTransaction,
  update,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
import { getAssignedUsersObj } from "./addtask_assign.js";
import { getSubtasksData } from "./addtask_subtask.js";

/**
 * Updates an existing task, keeping its status.
 * @param {string} taskId - The task ID.
 * @param {object} task - The new task data.
 * @returns {Promise<void>}
 */
export function updateTask(taskId, task) {
  return update(ref(database, `tasks/${taskId}`), task);
}

/**
 * Generates the next sequential task ID.
 * @param {object} currentTasks - The tasks object from Firebase.
 * @returns {string} The next ID, e.g. "task_03".
 */
function generateNextTaskId(currentTasks) {
  const keys = Object.keys(currentTasks || {});
  if (keys.length === 0) return "task_01";
  const numbers = keys.map((k) => parseInt(k.match(/\d+/)?.[0] || 0, 10));
  return `task_${String(Math.max(...numbers) + 1).padStart(2, "0")}`;
}

/**
 * Gets the currently selected priority value.
 * @returns {string} The priority, defaulting to "medium".
 */
export function getSelectedPriority() {
  const active = document.querySelector(".priority-btn.active");
  return active ? active.dataset.value : "medium";
}

/**
 * Reads the task data from the form.
 * @returns {object} The task data without status.
 */
export function buildTaskData() {
  const val = (id) => document.getElementById(id)?.value?.trim() || "";
  return {
    title: val("formTitle"),
    description: val("description"),
    duedate: val("duedate"),
    priority: getSelectedPriority(),
    category: document.getElementById("categorySelectedText")?.innerText || "",
    assignedTo: getAssignedUsersObj(),
    subtasks: getSubtasksData(),
  };
}

/**
 * Saves a new task to Firebase.
 * @param {object} task - The task data.
 * @param {string} status - The task status.
 * @returns {Promise<void>}
 */
export function registerTask(task, status) {
  return runTransaction(ref(database, "tasks"), (current) => {
    const tasks = current || {};
    tasks[generateNextTaskId(tasks)] = { ...task, status };
    return tasks;
  });
}
