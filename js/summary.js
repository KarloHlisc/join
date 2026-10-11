"use strict";

const BASE_URL =
  "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/";

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

/**
 * Retrieves the logged-in username from session storage and renders it in the DOM.
 * Aborts early if the DOM element does not exist or no user data is found.
 * @returns {void}
 */
function getUserName() {
  const name = document.getElementById("greeting-name");
  const stored = sessionStorage.getItem("loggedInUser");
  if (!name || !stored) return;
  const user = JSON.parse(stored);
  if (!user.name) return;
  name.innerText = user.name;
}

/*
async function findUser(email, password) {
    const data = await get(child(ref(database), "users"));
    const users = data.exists() ? data.val() : {};
    return Object.values(users).find(
        (u) => u.email === email && u.password === password,
    );
}

findUser();


// ============ NEW: Task Summary Functions ============

/**
 * Get task counts by status and priority
 */
async function getTaskCountsByStatus() {
  try {
    const response = await fetch(BASE_URL + "tasks.json");
    const data = await response.json();
    const taskArray = Object.entries(data || {}).map(([id, task]) => ({
      id,
      ...task,
    }));
    const counts = {
      todo: 0,
      inprogress: 0,
      feedback: 0,
      done: 0,
      urgent: 0,
      total: 0,
    };
    taskArray.forEach((task) => {
      taskCounter(counts, task);
    });
    return counts;
  } catch (error) {
    console.error("Fehler beim Laden der Task-Counts:", error);
    return {
      todo: 0,
      inprogress: 0,
      feedback: 0,
      done: 0,
      urgent: 0,
      total: 0,
    };
  }
}

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
 * Get the closest deadline from urgent tasks
 */
async function getUrgentDeadline() {
  try {
    const response = await fetch(BASE_URL + "tasks.json");
    const data = await response.json();
    const taskArray = Object.entries(data || {}).map(([id, task]) => ({
      id,
      ...task,
    }));
    const urgentTasks = taskArray.filter(
      (task) => task.priority?.toLowerCase() === "urgent" && task.duedate,
    );
    if (urgentTasks.length === 0) {
      return null;
    }
    urgentTasks.sort((a, b) => new Date(a.duedate) - new Date(b.duedate));
    return urgentTasks[0].duedate;
  } catch (error) {
    console.error("Fehler beim Laden des nächsten Deadlines:", error);
    return null;
  }
}

/**
 * Display counts on summary page
 */
async function displaySummary() {
  const counts = await getTaskCountsByStatus();
  const deadline = await getUrgentDeadline();
  updateSummaryData(counts); // Update the summary boxes
  if (deadline) {
    // Update deadline if urgent task exists
    const dateObj = new Date(deadline);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = dateObj.toLocaleDateString("en-US", options);
    document.getElementById("card-deadline").textContent = formattedDate;
  }
}

function updateSummaryData(counts) {
  document.getElementById("card-number-to-do").textContent = counts.todo;
  document.getElementById("card-number-done").textContent = counts.done;
  document.getElementById("card-number-stat").textContent = counts.urgent;
  document.getElementById("tasks-in-board").textContent = counts.total;
  document.getElementById("tasks-in-progress").textContent = counts.inprogress;
  document.getElementById("awaiting-feedback").textContent = counts.feedback;
}

//document.addEventListener("DOMContentLoaded", displaySummary); // Call on page load
