"use strict";

//import { getCreateTaskDetailTemplate} from "../js/template.js";

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
    const taskArray = Object.entries(data || {}).map(([id, task]) => ({id,...task, }));
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
    const taskArray = Object.entries(data || {}).map(([id, user]) => ({id,...user,}));

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

// Template für EINE Aufgabe
function cartTemplate(task) {
  const taskId = `task-${task.id}`;
  return getCartTemplate(task);
}

function findUsers(task) {
  let userOnTask = Object.keys(task.assignedTo || "");
  if (userOnTask == "") {return;
  } else {
    getUserOnTask(userOnTask);
  }
}

function getTaskColor(task){
  //let getColorTask = Object.entries(task.category);
  if(task.category == "User Story"){
    return "rgba(0, 56, 255, 1)";
  }else if(task.category == "Technical"){
    return "rgba(31, 215, 193, 1)";
  }
}

function getUserOnTask(userOnTask){
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

function findUsersByTask(task) {
  const userIds = Object.keys(task.assignedTo || {});
  if (userIds.length === 0) return "";
  return userIds.map((userId) => {
      const user = users.find((u) => u.id === userId);
      return user ? user.name : "Unknown";
    }).join(", ");
}

function openEditTask(task){
  const dialogEdit = document.getElementById("myAddTask");
  dialogEdit.innerHTML = getTaskFormTemplate(task.id);
  dialogEdit.showModal();
 closeDialogTask();
  dialogEdit.addEventListener("click", (e) => {
    if (e.target === dialogEdit) {
      dialogEdit.close();
    }
  })
}

function closeDialogTask(){
   const taskDialog = document.getElementById("myDialog");
  taskDialog.close();
}

function closeEditTask(){
   const dialogEdit = document.getElementById("myAddTask");
  dialogEdit.close();
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

function showSubtasks(task){
  //let subtask = document.getElementById("showSubtask");
  const subtask = Object.keys(task.subtasks || {});
  //document.getElementById("showSubtask").innerHTML+=
  
  for(let index = 0; index < subtask.length; index++){
    let element = subtask[index];
    return `0/${subtask.length}`;
    
  }
}

function createTaskDetailTemplate(task) {
  const assignedUsers = getAssignedUsersArray(task);
  const subtasks = task.subtasks || {};
  const subtaskArray = Object.entries(subtasks).map(([id, st]) => ({id,...st,}));
return getCreateTaskDetailTemplate(task, assignedUsers, subtaskArray);
}

function getAssignedUsersArray(task) {
  const userIds = Object.keys(task.assignedTo || {});
  return userIds.map((userId) => {
    const user = users.find((u) => u.id === userId);
    return user || { id: userId, name: "Unknown" };
  });
}

async function deleteTask(path="") {
  let response = await fetch(BASE_URL + path + ".json",{
    method:"DELETE",
  })
 
 // if (confirm("Are you sure you want to delete this task?")) {
   // console.log("Delete task:", taskId);
    // Add delete logic here
    document.getElementById("myDialog").close();
  
  return responseToJson = await response.json();
}

function editTask(taskId) {
  showEditTaskModule(taskId);
  console.log("Edit task:", taskId);
  document.getElementById("myDialog").close();
}

function getPriorityImage(priority) {
  const images = {
    urgent: "../assets/icons/urgent.svg",
    medium: "../assets/icons/medium.svg",
    low: "../assets/icons/low.svg",
  };
  return images[priority?.toLowerCase()] || "../assets/icons/low.svg";
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
    { offset: Number.NEGATIVE_INFINITY },).element;
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
  cartContainersFun(cardContainers);
}

function cartContainersFun(cardContainers) {
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

function searchCards() {
  let cardSearchText = document.getElementById("search-task").value;
  console.log(cardSearchText);
  filterItems(tickets, cardSearchText);
  if (cardSearchText == "") {
    displayTasks(tickets);
  }
}

function filterItems(arr, query){
    let getCartTitle = arr.filter((el) => el.title.toLowerCase().includes(query.toLowerCase()));
    let getCartDescription = arr.filter((el) => el.description.toLowerCase().includes(query.toLowerCase()));
    checkIfExist(getCartTitle,getCartDescription);
}

function checkIfExist(getCartTitle, getCartDescription){
    if(!getCartTitle.length == 0 || !getCartDescription.length == 0){
        document.getElementById("to-do-cards-container").innerHTML="";
        document.getElementById("in-progress-cards-container").innerHTML="";
        document.getElementById("await-feedback-cards-container").innerHTML="";
        document.getElementById("done-cards-container").innerHTML="";
        iterarCards(getCartTitle, getCartDescription);
    }else{
        return;
    }
}

function iterarCards(getCartTitle,getCartDescription){
    const search = [...new Set([...getCartTitle, ...getCartDescription])];
   if(search.length != 0){
    for (let index = 0; index < search.length; index++) {
        const elementTitle = search[index]; 
        showCards(elementTitle);
     } 
   } 
   else{
    return;
   }    
}

function editTask(taskId) {
  console.log("Edit task:", taskId);
  document.getElementById("myDialog").close();
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
