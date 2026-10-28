"use strict";

const BASE_URL =
  "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/";

/**
 * Initializes the summary page: greeting and task numbers.
 * @returns {void}
 */
function init() {
  greetings();
  displaySummary();
}
// Greeting based on time of day
/**
 * Updates the welcome text in the UI based on the current time of day.
 * If a valid user is logged in, it appends a comma and triggers the username display.
 * Otherwise, it appends an exclamation mark.
 * @returns {void}
 */
function greetings() {
  const putText = document.getElementById("greeting-text");
  const nameEl = document.getElementById("greeting-name");
  if (!putText) return;
  const hr = new Date().getHours();
  const greet =
    hr < 12 ? "Good Morning" : hr < 18 ? "Good Afternoon" : "Good Evening";
  const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
  const isUser = user.name && user.name !== "Guest";
  putText.innerText = `${greet}${isUser ? "," : "!"}`;
  if (nameEl) nameEl.innerText = isUser ? user.name : "";
}

// ============ NEW: Task Summary Functions ============

/**
 * Returns a counter object with all values set to zero.
 * @returns {Object} The empty counters.
 */
function getEmptyCounts() {
  return { todo: 0, inprogress: 0, feedback: 0, done: 0, urgent: 0, total: 0 };
}

/**
 * Loads all tasks and counts them per status.
 * @returns {Promise<Object>} The counters, all zero on error.
 */
async function getTaskCountsByStatus() {
  try {
    const response = await fetch(BASE_URL + "tasks.json");
    const data = await response.json();
    const counts = getEmptyCounts();
    Object.values(data || {}).forEach((task) => taskCounter(counts, task));
    return counts;
  } catch (error) {
    console.error("Fehler beim Laden der Task-Counts:", error);
    return getEmptyCounts();
  }
}

/**
 * Adds one task to the matching counters.
 * @param {Object} counts - The counter object to update.
 * @param {Object} task - The task to count.
 * @returns {void}
 */
function taskCounter(counts, task) {
  counts.total++;
  const status = task.status?.toLowerCase() || "todo";
  if (status === "todo") counts.todo++;
  else if (status === "inprogress") counts.inprogress++;
  else if (status === "awaitfeedback") counts.feedback++;
  else if (status === "done") counts.done++;
  if (task.priority?.toLowerCase() === "urgent") {
    counts.urgent++;
  }
}

/**
 * Loads all tasks and returns the nearest urgent deadline.
 * @returns {Promise<string|null>} The due date, or null.
 */
async function getUrgentDeadline() {
  try {
    const response = await fetch(BASE_URL + "tasks.json");
    const data = await response.json();
    return showTaskArra(data);
  } catch (error) {
    console.error("Fehler beim Laden des nächsten Deadlines:", error);
    return null;
  }
}

/**
 * Returns the due date of the nearest open urgent task.
 * @param {Object} data - The tasks object from Firebase.
 * @returns {string|null} The due date, or null if none exists.
 */
function showTaskArra(data) {
  const urgent = Object.values(data || {}).filter(isOpenUrgent);
  if (!urgent.length) return null;
  urgent.sort((a, b) => new Date(a.duedate) - new Date(b.duedate));
  return urgent[0].duedate;
}

/**
 * Checks whether a task is urgent, not done and has a due date.
 * @param {Object} task - The task to check.
 * @returns {boolean} True if the task counts for the deadline card.
 */
function isOpenUrgent(task) {
  return (
    task.priority?.toLowerCase() === "urgent" &&
    task.status !== "done" &&
    !!task.duedate
  );
}

/**
 * Display counts on summary page
 */
async function displaySummary() {
  const counts = await getTaskCountsByStatus();
  const deadline = await getUrgentDeadline();
  updateSummaryData(counts); // Update the summary boxes
  document.getElementById("card-deadline").textContent = deadline
    ? new Date(deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No deadline";
}

/**
 * Writes the counters into the summary cards.
 * @param {Object} counts - The counters from getTaskCountsByStatus.
 * @returns {void}
 */
function updateSummaryData(counts) {
  document.getElementById("card-number-to-do").textContent = counts.todo;
  document.getElementById("card-number-done").textContent = counts.done;
  document.getElementById("card-number-stat").textContent = counts.urgent;
  document.getElementById("tasks-in-board").textContent = counts.total;
  document.getElementById("tasks-in-progress").textContent = counts.inprogress;
  document.getElementById("awaiting-feedback").textContent = counts.feedback;
}

const toDoCardBtn = document.getElementById("to-do-card-btn");
const doneCardBtn = document.getElementById("done-card-btn");
const imgToDo = document.getElementById("img-to-do");
const imgDone = document.getElementById("img-done");
/*
toDoCardBtn.addEventListener("mouseover", () => {
  imgToDo.src = "../assets/icons/todo_edit_white.svg";
});

toDoCardBtn.addEventListener("mouseout", () => {
  imgToDo.src = "../assets/icons/to-do-edit.svg";
}); 

doneCardBtn.addEventListener("mouseover", () => {
   imgDone.src = "../assets/icons/done_white.svg";
});

doneCardBtn.addEventListener("mouseout", () => {
 imgDone.src = "../assets/icons/done-edit.svg";
});
*/
// To-Do Card Button
toDoCardBtn.addEventListener("mouseover", () => {
  imgToDo.src = "../assets/icons/todo_edit_white.svg";
});

toDoCardBtn.addEventListener("mouseout", () => {
  imgToDo.src = "../assets/icons/to-do-edit.svg";
});

toDoCardBtn.addEventListener("touchstart", () => {
  imgToDo.src = "../assets/icons/todo_edit_white.svg";
});

toDoCardBtn.addEventListener("touchend", () => {
  imgToDo.src = "../assets/icons/to-do-edit.svg";
});

// Done Card Button
doneCardBtn.addEventListener("mouseover", () => {
  imgDone.src = "../assets/icons/done_white.svg";
});

doneCardBtn.addEventListener("mouseout", () => {
  imgDone.src = "../assets/icons/done-edit.svg";
});

doneCardBtn.addEventListener("touchstart", () => {
  imgDone.src = "../assets/icons/done_white.svg";
});

doneCardBtn.addEventListener("touchend", () => {
  imgDone.src = "../assets/icons/done-edit.svg";
});