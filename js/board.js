
'use strict';
/*
import { database } from "../js/config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

let userTasks = [];
const BASE_URL = "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/tasks";

// Beim Laden der Seite
document.addEventListener("DOMContentLoaded", () => {
    getUserTasks();
});
*/






const BASE_URL = "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/";
let tickets = [];
let users = [];
// Hole Daten von Firebase
async function getUserTasks(path="") {
    try {
        const response = await fetch(BASE_URL + path + ".json");
        
        const data = await response.json();
    //    console.log(data);
        
        // Umwandle in Array
        const taskArray = Object.entries(data || {}).map(([id, task]) => ({id,...task}));
        
        tickets = taskArray;
        displayTasks(taskArray); 
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
    for (let index = 0; index < tickets.length; index++) {   //Object.entries(tickets)
      const element = tickets[index];
     //  console.log(element);
    
    }
   
}

async function getUsers(path="") {
    try {
        const response = await fetch(BASE_URL + path + ".json");
        
        const data = await response.json();
     //   console.log(data);
        
        // Umwandle in Array
        const taskArray = Object.entries(data || {}).map(([id, user]) => ({id,...user}));
        
        users = taskArray;
        displayTasks(taskArray); 
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
    for (let index = 0; index < tickets.length; index++) {   //Object.entries(tickets)
      const element = users[index];
    //   console.log(element);
    
    }
}



getUserTasks("/tasks") ;
 getUsers("/users");

// Zeige alle Aufgaben auf der Seite
function displayTasks(tickets) {
    const cart = document.getElementById("to-do-cards-container");
    
    if (!tickets || tickets.length === 0) {
        cart.innerHTML = '<div class="no-tasks-card">No tasks To do</div>';
        return;
    }
    
    const html = tickets.map(task => cartTemplate(task)).join("");
    
    cart.innerHTML = html;
    
}

// Template für EINE Aufgabe
function cartTemplate(task) {
//let elementTaskt = Object.entries(task.subtasks).length;
 
    return `
        <div role="button" class="cart">
            <div class="level-story">
                <p>${task.category  || "User Story"}</p>
            </div>
            <div class="title-story">
                <h4>${task.title || "Keine Beschreibung"}</h4>
                <p>${task.description || ""}</p>
            </div>
            <div class="cart-progress">
                <progress value="" max="100"></progress>
                <span> "0/0" Subtasks</span>
            </div>
            <div class="cart-assigment">
                <span>${checkUsers(task)}</span>
                <span>${task.priority}</span>
            </div>
        </div>
    `;
}


function checkUsers(task){
  //  console.log(task);
    const userid = Object.entries(task);
    console.log(userid[1][1]);

    let user = userid[1][1];
   
    
    if(task){}
}



function getAsigntUserName(user, task) {
 //   console.log(user.id);
  //  if(users[id].id === task.assignedTo.u)
    
}








function showAddTaskModule() {
  const container = document.getElementById("myDialog");
  if (!container) return;
  container.innerHTML = taskFormTemplate();
  document.getElementById("addTaskForm")?.addEventListener("submit", handleFormSubmit );
  setTimeout(() => {container.classList.add("active");
  }, 20);
}


function taskFormTemplate(){ return `
<div id="form-container">
  <div id="add-task-title"><h1>Add Task</h1></div>
  <form id="addTaskForm" novalidate>
    <div id="form-body">
      <div id="leftSide">
        <label for="formTitle">Title<span class="red-star">*</span></label>
        <input type="text" id="formTitle" placeholder="Enter a title" />
        <div id="errorTitle" style="color: red"></div>
        <label for="description">Description</label>
        <textarea id="description" placeholder="Enter a description"></textarea>
        <label for="duedate">Due date<span class="red-star">*</span></label>
        <input type="date" id="duedate"  placeholder="dd/mm/yy"  />
        <div id="errorDate" style="color: red"></div>
      </div>
      <div id="rightSide">
        <span class="form-label">Priority</span>
        <div id="priority-buttons">
          <button type="button" class="priority-btn" id="urgent-btn" data-value="urgent">Urgent <img src="../assets/icons/urgent.svg" alt="" aria-hidden="true" /></button>
          <button type="button" class="priority-btn" id="medium-btn" data-value="medium">Medium <img src="../assets/icons/medium.svg" alt="" aria-hidden="true" /></button>
          <button type="button" class="priority-btn" id="low-btn" data-value="low">Low <img src="../assets/icons/low.svg" alt="" aria-hidden="true" /></button>
        </div>
        <label for="searchInput">Assigned to</label>
        <div class="custom-dropdown">
          <div class="dropdown-header-input-wrapper">
            <input type="text" id="searchInput" placeholder="Select contacts to assign" autocomplete="off" />
            <button type="button" id="dropdownToggle" class="dropdown-btn" aria-label="Benutzerliste anzeigen"><img src="../assets/icons/arrow-drop-down.svg" alt="Pfeil unten" class="dropdown-img" id="dropdownArrowImg" /></button>
          </div>
          <ul class="dropdown-list hidden" id="dropdownList"></ul>
        </div>
        <div id="assignedUsersContainer" class="assigned-users"></div>
        <ul class="assigned-users"></ul>
        <label for="categoryToggle">Category<span class="red-star">*</span></label>
        <div class="custom-dropdown">
          <div class="dropdown-header" id="categoryHeader">
            <span id="categorySelectedText">Select task category</span>
            <button type="button" id="categoryToggle" class="dropdown-btn" aria-label="Kategorie anzeigen"><img src="../assets/icons/arrow-drop-down.svg" alt="Pfeil unten" class="dropdown-img" id="categoryArrowImg" /></button>
          </div>
          <ul class="dropdown-list hidden" id="categoryList">
            <li class="user-item" data-value="Technical"><span >Technical</span></li>
            <li class="user-item" data-value="User Story"><span >User Story</span></li>
          </ul>
          <div id="errorCategory" style="color: red"></div>
        </div>
        <label for="subtaskInput">Subtasks</label>
        <div class="subtask-container">
          <input type="text" id="subtaskInput" placeholder="Add new Subtasks" />
          <button type="button" id="addSubtaskBtn"><img src="../assets/icons/darkcheck.svg" alt="Add Subtask" /></button>
          <button type="button" id="clearSubtaskBtn"><img src="../assets/icons/delete.svg" alt="Clear input" /></button>
        </div>
        <ul id="subTaskList"></ul>
      </div>
    </div>
    <div id="createTaskBtn-container">
      <span class="required-hint"><span class="red-star">*</span>This field is required</span>
      <div id="btn-container">
        <button type="reset" id="clear">Clear <img src="../assets/icons/vector.svg" alt="" aria-hidden="true" /></button>
        <button type="submit" id="createTask">Create Task <img src="../assets/icons/check.svg" alt="" aria-hidden="true" /></button>
      </div>
    </div>
  </form>
</div>
`;
}
/*
'use strict';

import { database } from "../js/config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


let userTasks = [];
//function init(){
    getCartTemplate();
//}

function getCartTemplate() {
  const cart = document.getElementById("to-do-cards-container");
  // cart.innerHTML="";
  if (cart == "") {
    cart.innerHTML =
      '<div id="no-tasks-to-do" class="no-tasks-card">No tasks To do</div>';
  } else {
    cart.innerHTML = cartTemplate();
  }
}

function cartTemplate() {
  return `
        <div role="button" class="cart" >
                <div class="level-story">
                  <p>User Story</p>
                </div>
                <div class="title-story">
                  <h4>Kochwelt Page & Recepi</h4>
                  <p>Building start page with recepie redcomd</p>
                </div>
                <div class="cart-progress">
                  <progress id="file" value="32" max="100"></progress>
                  <span>1/2 Subtasks</span>
                </div>
                <div class="cart-contibutors">
                  <div class="contibutor">
                    <span>AM</span>
                    <span>EM</span>
                  </div>
                  <div class="cart-level">
                    <img src="../assets/icons/urgent.svg" alt="">
                  </div>
                </div>
              </div>
    `;
}

const BASE_URL = "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/tasks";

async function getUserTasks() {
    try{
        const response = await fetch (BASE_URL);
        const data = await response.json();
        getFromFetchedData(data);
    }
    catch(error)
    {
        console.log(error);
        
    }
}

async function getFromFetchedData(data) {
    let fechedData = data.reults;
    userTasks.push(...fechedData);
}

*/