"use strict";

const cartToDo = document.getElementById("to-do-cards-container");
const cartInProgres = document.getElementById("in-progress-cards-container");
const cartAwait = document.getElementById("await-feedback-cards-container");
const cartDone = document.getElementById("done-cards-container");

const BASE_URL =
  "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/";
let tickets = [];
let users = [];
let names = [];

/**
 * Initializes the board, loads tasks and users, and displays the tasks.
 * Also adds a click listener to close the task dialog.
 * @returns {Promise<void>}
 */
async function init() {
  await Promise.all([getUserTasks("/tasks"), getUsers("/users")]);
  displayTasks(tickets);
  document.getElementById("myDialog").addEventListener("click", (e) => {
    if (e.target.id === "myDialog") e.target.close();
  });
}

/**
 * Reloads the tasks and refreshes the board.
 * @returns {Promise<void>}
 */
async function reloadBoard() {
  await getUserTasks("/tasks");
  displayTasks(tickets);
}

document.addEventListener("tasksChanged", reloadBoard);

/**
 * Loads tasks from Firebase and stores them in the `tickets` array.
 * @param {string} [path=""] Firebase path relative to the database URL.
 * @returns {Promise<void>}
 */
async function getUserTasks(path = "") {
  try {
    const response = await fetch(BASE_URL + path + ".json");
    const data = await response.json();
    // Umwandle in Array
    tickets = Object.entries(data || {}).map(([id, task]) => ({
      id,
      ...task,
    }));
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

/**
 * Loads tasks from Firebase and stores them in the `tickets` array.
 * @param {string} [path=""] Firebase path relative to the database URL.
 * @returns {Promise<void>}
 */
async function getUsers(path = "") {
  try {
    const response = await fetch(BASE_URL + path + ".json");
    const data = await response.json();
    // Umwandle in Array
    users = Object.entries(data || {}).map(([id, user]) => ({
      id,
      ...user,
    }));
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

/**
 * Clears the task containers in all board columns.
 * @returns {void}
 */
function clearTheTaskPreview() {
  cartToDo.innerHTML = "";
  cartInProgres.innerHTML = "";
  cartAwait.innerHTML = "";
  cartDone.innerHTML = "";
}

/**
 * Clears the board, renders the provided tasks, and initializes drag and drop.
 * @param {Array<Object>} tickets Tasks to display on the board.
 * @returns {void}
 */
function displayTasks(tickets) {
  clearTheTaskPreview();
  tickets.forEach((task) => showCards(task));
  initDragAndDrop();
  checkIfBoardEmpty();
}

/**
 * Displays a placeholder in each empty board column.
 * @returns {void}
 */
function checkIfBoardEmpty() {
  if (cartToDo.childNodes[1] === undefined) {
    cartToDo.innerHTML =
      '<div class="no-tasks-card" data-id="notodo">No tasks To do</div>';
  }
  if (cartInProgres.childNodes[1] === undefined) {
    cartInProgres.innerHTML =
      '<div class="no-tasks-card" data-id="noinprogress">No tasks In progress</div>';
  }
  if (cartAwait.childNodes[1] === undefined) {
    cartAwait.innerHTML =
      '<div class="no-tasks-card" data-id="noawaitfeedback">No tasks Await feedback</div>';
  }
  if (cartDone.childNodes[1] === undefined) {
    cartDone.innerHTML =
      '<div class="no-tasks-card" data-id="nodone">No tasks Done</div>';
  }
}

/**
 * Renders a task in the board column that matches its status.
 * @param {Object} task Task with at least a `status` property.
 * @returns {void}
 */
function showCards(task) {
  const status = task.status?.toLowerCase() || "todo";
  if (status === "todo") cartToDo.innerHTML += cartTemplate(task);
  else if (status === "inprogress")
    cartInProgres.innerHTML += cartTemplate(task);
  else if (status === "awaitfeedback")
    cartAwait.innerHTML += cartTemplate(task);
  else if (status === "done") cartDone.innerHTML += cartTemplate(task);
}

/**
 * Creates the HTML markup for a task card.
 * @param {Object} task Task to render.
 * @returns {string} The task card's HTML markup.
 */
function cartTemplate(task) {
  const taskId = `task-${task.id}`;
  return getCartTemplate(task);
}

/**
 * Gets the IDs of the users assigned to a task and passes them to
 * `getUserOnTask` for further processing.
 * @param {Object} task Task with an optional `assignedTo` property.
 * @returns {void}
 */
function findUsers(task) {
  let userOnTask = Object.keys(task.assignedTo || "");
  if (userOnTask == "") {
    return;
  } else {
    getUserOnTask(userOnTask);
  }
}

/**
 * Returns the color associated with a task's category.
 * @param {Object} task Task with a `category` property.
 * @returns {string} An RGBA color value.
 */
function getTaskColor(task) {
  if (task.category === "User Story") return "rgba(0, 56, 255, 1)";
  return "rgba(31, 215, 193, 1)";
}

/**
 * Updates a subtask's completion status in Firebase and refreshes the board.
 * @param {string} taskId ID of the task.
 * @param {string} subId ID of the subtask.
 * @param {boolean} isDone Whether the subtask is complete.
 * @returns {Promise<void>}
 */
async function toggleSubtask(taskId, subId, isDone) {
  await fetch(`${BASE_URL}tasks/${taskId}/subtasks/${subId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isDone }),
  });
  tickets.find((t) => t.id === taskId).subtasks[subId].isDone = isDone;
  displayTasks(tickets);
}

/**
 * Gets initials for the users assigned to a task based on their IDs.
 * @param {string[]} userOnTask IDs of users assigned to the task.
 * @returns {string|undefined} The initials of a matching user, or `undefined`.
 */
function getUserOnTask(userOnTask) {
  for (let i = 0; i <= userOnTask.length; i++) {
    let found = users.find((u) => u.id == userOnTask[i]);
    if (found != undefined) {
      let userN = found.name;
      const userName = userN.split(" ");
      const firstInitial = userName[0].charAt(0);
      const lastInitial = userName[userName.length - 1].charAt(0) || "";
      return firstInitial + lastInitial;
    } else {
      return;
    }
  }
}

/**
 * Returns the names of the users assigned to a task.
 * @param {Object} task Task with an optional `assignedTo` property.
 * @returns {string} Assigned users' names, separated by commas, or an empty string.
 */
function findUsersByTask(task) {
  const userIds = Object.keys(task.assignedTo || {});
  if (userIds.length === 0) return "";
  return userIds
    .map((userId) => {
      const user = users.find((u) => u.id === userId);
      return user ? user.name : "Unknown";
    })
    .join(", ");
}

/**
 * Opens the task editing dialog and sets its form content.
 * @param {Object} task Task to edit.
 * @returns {void}
 */
function openEditTask(task) {
  const dialogEdit = document.getElementById("myAddTask");
  dialogEdit.innerHTML = getTaskFormTemplate(task.id);
  dialogEdit.showModal();
  closeDialogTask();
  dialogEdit.addEventListener("click", (e) => {
    if (e.target === dialogEdit) {
      dialogEdit.close();
    }
  });
}

/**
 * Closes the task details dialog.
 * @returns {void}
 */
function closeDialogTask() {
  const taskDialog = document.getElementById("myDialog");
  taskDialog.close();
}

/**
 * Closes the dialog used to add or edit a task.
 * @returns {void}
 */
function closeEditTask() {
  const dialogEdit = document.getElementById("myAddTask");
  dialogEdit.close();
}

/**
 * Opens the details dialog for the task whose ID is on the event target.
 * @param {Event} event Click event from an element with a `data-id` attribute.
 * @returns {void}
 */
function openTaskDialog(event) {
  const taskId = event.currentTarget.getAttribute("data-id");
  const task = tickets.find((t) => t.id === taskId);
  if (!task) return;
  const dialog = document.getElementById("myDialog");
  dialog.innerHTML = createTaskDetailTemplate(task);
  dialog.showModal();
}

/**
 * Returns the number of completed subtasks and the total number of subtasks.
 * @param {Object} task Task with optional subtasks.
 * @returns {string} Progress in the format "completed/total", or an empty string.
 */
function showSubtasks(task) {
  const subs = Object.values(task.subtasks || {});
  if (!subs.length) return "";
  const done = subs.filter((s) => s.isDone).length;
  return `${done}/${subs.length}`;
}

/**
 * Calculates the completion percentage of a task's subtasks.
 * @param {Object} task Task with optional subtasks.
 * @returns {number} Progress from 0 to 100.
 */
function getProgressValue(task) {
  const subs = Object.values(task.subtasks || {});
  if (!subs.length) return 0;
  return (subs.filter((s) => s.isDone).length / subs.length) * 100;
}

/**
 * Creates the HTML markup for a task details dialog.
 * @param {Object} task Task whose details should be displayed.
 * @returns {string} The dialog's HTML markup.
 */
function createTaskDetailTemplate(task) {
  const assignedUsers = getAssignedUsersArray(task);
  const subtasks = task.subtasks || {};
  const subtaskArray = Object.entries(subtasks).map(([id, st]) => ({
    id,
    ...st,
  }));
  return getCreateTaskDetailTemplate(task, assignedUsers, subtaskArray);
}

/**
 * Returns the user objects assigned to a task.
 * Users that cannot be found are returned with the name "Unknown".
 * @param {Object} task Task with an optional `assignedTo` property.
 * @returns {Array<Object>} The assigned users.
 */
function getAssignedUsersArray(task) {
  const userIds = Object.keys(task.assignedTo || {});
  return userIds.map((userId) => {
    const user = users.find((u) => u.id === userId);
    return user || { id: userId, name: "Unknown" };
  });
}

/**
 * Deletes a task from Firebase, closes the details dialog, and reloads the board.
 * @param {string} taskId ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
  closeDialogTask();
  await reloadBoard();
}

/**
 * Opens the task editing module and closes the details dialog.
 * @param {string} taskId ID of the task to edit.
 * @returns {void}
 */
function editTask(taskId) {
  showEditTaskModule(taskId);
  console.log("Edit task:", taskId);
  document.getElementById("myDialog").close();
}

/**
 * Returns the image path for the specified priority.
 * @param {string} priority Priority, such as "urgent", "medium", or "low".
 * @returns {string} Path to the priority icon.
 */
function getPriorityImage(priority) {
  const images = {
    urgent: "../assets/icons/urgent.svg",
    medium: "../assets/icons/medium.svg",
    low: "../assets/icons/low.svg",
  };
  return images[priority?.toLowerCase()] || "../assets/icons/low.svg";
}

/**
 * Finds the card element before which a dragged card should be inserted,
 * based on the pointer's vertical position.
 * @param {Element} container Container holding the cards.
 * @param {number} y Pointer's vertical position in the viewport.
 * @returns {Element|undefined} The next card element, or `undefined`.
 */
function getDragAfrerElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}
