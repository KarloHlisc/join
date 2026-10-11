"use strict";

const BASE_URL =
  "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/";
let tickets = [];
let users = [];
let names = [];

function init() {
  getUserTasks("/tasks");
  getUsers("/users");
}

// Hole Daten von Firebase
async function getUserTasks(path = "") {
  try {
    const response = await fetch(BASE_URL + path + ".json");
    const data = await response.json();

    // Umwandle in Array
    const taskArray = Object.entries(data || {}).map(([id, task]) => ({
      id,
      ...task,
    }));

    tickets = taskArray;
    displayTasks(tickets);
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

async function getUsers(path = "") {
  try {
    const response = await fetch(BASE_URL + path + ".json");
    const data = await response.json();

    // Umwandle in Array
    const taskArray = Object.entries(data || {}).map(([id, user]) => ({
      id,
      ...user,
    }));

    users = taskArray;
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

// Zeige alle Aufgaben auf der Seite
function displayTasks(tickets) {
  if (!tickets || tickets.length === 0) {
    document.getElementById("to-do-cards-container").innerHTML =
      '<div class="no-tasks-card">No tasks To do</div>';
    return;
  }

  // Clear containers
  document.getElementById("to-do-cards-container").innerHTML = "";
  document.getElementById("in-progress-cards-container").innerHTML = "";
  document.getElementById("await-feedback-cards-container").innerHTML = "";
  document.getElementById("done-cards-container").innerHTML = "";

  // Render tasks
  tickets.forEach((task) => showCards(task));

  // Initialize drag-and-drop after cards are rendered
  initDragAndDrop();
}

function showCards(task) {
  const cartToDo = document.getElementById("to-do-cards-container");
  const cartInProgres = document.getElementById("in-progress-cards-container");
  const cartAwait = document.getElementById("await-feedback-cards-container");
  const cartDone = document.getElementById("done-cards-container");
  const status = task.status?.toLowerCase() || "todo";

  if (status === "todo") cartToDo.innerHTML += cartTemplate(task);
  else if (status === "inprogress")
    cartInProgres.innerHTML += cartTemplate(task);
  else if (status === "awaitfeedback")
    cartAwait.innerHTML += cartTemplate(task);
  else if (status === "done") cartDone.innerHTML += cartTemplate(task);
}

// Template für EINE Aufgabe , die muss ins template.js
function cartTemplate(task) {
  const taskId = `task-${task.id}`;

  return `
        <button 
            role="button" 
            class="cart draggable" 
            id="${taskId}"
            draggable="true"
            onclick="openTaskDialog(event)"
            data-task-id="${task.id}"
        >
            <div class="level-story">
                <p style="background:#2d8cff;">${task.category || "User Story"}</p>
            </div>
            <div class="title-story">
                <h4>${task.title || "Keine Beschreibung"}</h4>
                <p>${task.description || ""}</p>
            </div>
            <div class="cart-progress">
                <progress value="" max="100"></progress>
                <span>"0/0" Subtasks</span>
            </div>
            <div class="cart-assigment">
                <span>${findUsers(task) || ""}</span> 
                <div class="priority-badge">
                    <img src="${getPriorityImage(task.priority)}" alt="${task.priority}" class="priority-icon-small">
                    <span>${task.priority}</span>
                </div>
            </div>
        </button>
    `;
}

function findUsers(task) {
  let userOnTask = Object.keys(task.assignedTo || "");

  if (userOnTask == "") {
    return;
  } else {
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
}

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

// Dialog Functions
function openTaskDialog(event) {
  // Prevent drag-and-drop from triggering the dialog
  if (event.target.closest(".dragging")) return;

  const taskId = event.currentTarget.getAttribute("data-task-id");
  const task = tickets.find((t) => t.id === taskId);

  if (!task) return;

  const dialog = document.getElementById("myDialog");
  dialog.innerHTML = createTaskDetailTemplate(task);
  dialog.showModal();

  // Close dialog when clicking outside
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
}

function createTaskDetailTemplate(task) {
  const assignedUsers = getAssignedUsersArray(task);
  const subtasks = task.subtasks || {};
  const subtaskArray = Object.entries(subtasks).map(([id, st]) => ({
    id,
    ...st,
  }));

  return `
        <div class="dialog-content">
            <div class="dialog-header">
                <span class="category-badge" style="background-color:${task.colors};">${task.category || "User Story"}</span>
                <button class="close-btn" onclick="document.getElementById('myDialog').close()">✕</button>
            </div>
            
            <div class="dialog-body">
                <h2 class="task-title">${task.title}</h2>
                <p class="task-description">${task.description || ""}</p>
                
                <div class="task-details">
                    <div class="detail-row">
                        <span class="detail-label">Due date:</span>
                        <span class="detail-value">${task.dueDate || "No date"}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Priority:</span>
                        <div class="priority-display">
                        <span class="detail-value">${task.priority || "Normal"}</span>
                            <img src="${getPriorityImage(task.priority)}" alt="${task.priority}" class="priority-icon-dialog">
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Assigned to:</span>
                    </div>
                    <div class="assigned-users">
                        ${assignedUsers
                          .map(
                            (user) => `
                            <div class="user-chip">
                                <div class="user-avatar" style="background-color: ${getUserColor(user.id)}">${getInitials(user.name)}</div>
                                <span>${user.name}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="subtasks-section">
                    <h3 class="subtasks-title">Subtasks</h3>
                    <div class="subtasks-list">
                        ${
                          subtaskArray.length > 0
                            ? subtaskArray
                                .map(
                                  (st) => `
                                <div class="subtask-item">
                                    <input type="checkbox" id="subtask-${st.id}" ${st.done ? "checked" : ""}>
                                    <label for="subtask-${st.id}">${st.title}</label>
                                </div>
                            `,
                                )
                                .join("")
                            : '<p class="no-subtasks">No subtasks</p>'
                        }
                    </div>
                </div>
            </div>
            
            <div class="dialog-footer">
                <button class="btn-delete" onclick="deleteTask('${task.id}')">
                    <img src="../assets/icons/delete.svg" alt="delete"> Delete
                </button>
                <div id="footerBetween"></div>
                <button class="btn-edit" onclick="editTask('${task.id}')">
                    <img src="../assets/icons/edit.svg" alt="edit"> Edit
                </button>
            </div>
        </div>
    `;
}

function getAssignedUsersArray(task) {
  const userIds = Object.keys(task.assignedTo || {});
  return userIds.map((userId) => {
    const user = users.find((u) => u.id === userId);
    return user || { id: userId, name: "Unknown" };
  });
}

function getInitials(name) {
  const parts = name.split(" ");
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  return first + last;
}

function getUserColor(userId) {
  const colors = [
    "#2d8cff",
    "#ff3d00",
    "#4caf50",
    "#ff9800",
    "#9c27b0",
    "#00bcd4",
    "#e91e63",
    "#fbc02d",
  ];
  const index = Math.abs(userId.charCodeAt(0)) % colors.length;
  return colors[index];
}

function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    console.log("Delete task:", taskId);
    // Add delete logic here
    document.getElementById("myDialog").close();
  }
}

function editTask(taskId) {
  console.log("Edit task:", taskId);
  document.getElementById("myDialog").close();
}

function getPriorityImage(priority) {
  const images = {
    urgent: "../assets/icons/urgent.svg",
    dringend: "../assets/icons/urgent.svg",
    high: "../assets/icons/high.svg",
    hoch: "../assets/icons/high.svg",
    medium: "../assets/icons/medium.svg",
    low: "../assets/icons/low.svg",
    niedrig: "../assets/icons/low.svg",
  };
  return images[priority?.toLowerCase()] || "../assets/icons/low.svg";
}

function editTask(taskId) {
  console.log("Edit task:", taskId);
  document.getElementById("myDialog").close();
}

// Drag and Drop Functions
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

function initDragAndDrop() {
  const draggables = document.querySelectorAll(".draggable");
  const cardContainers = document.querySelectorAll(".cards-container");
  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });
    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
    });
  });

  cardContainers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggable = document.querySelector(".dragging");
      if (!draggable) return;
      const afterElement = getDragAfrerElement(container, e.clientY);

      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });
}
