
'use strict';

const BASE_URL = "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/";
let tickets = [];
let users = [];
let names = [];

function init(){
  getUserTasks("/tasks") ;
 getUsers("/users");
}

// Hole Daten von Firebase
async function getUserTasks(path="") {
    try {
        const response = await fetch(BASE_URL + path + ".json");
        
        const data = await response.json();
    //    console.log(data);
        
        // Umwandle in Array
        const taskArray = Object.entries(data || {}).map(([id, task]) => ({id,...task}));
        
        tickets = taskArray;
        displayTasks(tickets); 
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
  //  for (let index = 0; index < tickets.length; index++) {   //Object.entries(tickets)
    //  const element = tickets[index];
     //  console.log(element);
    
 //   }
   
}

async function getUsers(path="") {
    try {
        const response = await fetch(BASE_URL + path + ".json");
        
        const data = await response.json();
     //   console.log(data);
        
        // Umwandle in Array
        const taskArray = Object.entries(data || {}).map(([id, user]) => ({id,...user}));
        
        users = taskArray;
      //  findUsers(taskArray); 
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
    for (let index = 0; index < tickets.length; index++) {   //Object.entries(tickets)
      const element = users[index];
    //   console.log(element);
    
    }
}





// Zeige alle Aufgaben auf der Seite
function displayTasks(tickets) {
    
    if (!tickets || tickets.length === 0) {
        cart.innerHTML = '<div class="no-tasks-card">No tasks To do</div>';
        return;
    }
    
    //const html =
     tickets.map(task => showCards(task)).join("");
      
    
    //cart.innerHTML = html;
    
}

function showCards(task){
  const cartToDo = document.getElementById("to-do-cards-container");
    const cartInProgres = document.getElementById("in-progress-cards-container");
    const cartAwait = document.getElementById("await-feedback-cards-container");
    const cartDone = document.getElementById("done-cards-container");
   const status = task.status?.toLowerCase() || "todo";
     if (status === "todo")  cartToDo.innerHTML += cartTemplate(task);
        else if (status === "inprogress") cartInProgres.innerHTML += cartTemplate(task);
        else if (status === "awaitfeedback") cartAwait.innerHTML += cartTemplate(task);
        else if (status === "done") cartDone.innerHTML += cartTemplate(task);
    //    if (task.priority?.toLowerCase() === "urgent") {
      //          counts.urgent++;
        //    }
       
}



// Template für EINE Aufgabe
function cartTemplate(task) {
//let elementTaskt = Object.entries(task.subtasks).length;
// console.log(task);
 
    return `
        <button role="button" class="cart" draggable="true" ondragstart="dragstartHandler(event)">
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
                <span>${findUsers(task) || ""}</span> 
                <span>${task.priority}</span>
            </div>
        </button>
    `;
    //<!--${checkUsers(task)}-->
}


function findUsers(task){
    console.log(task.assignedTo);
    //console.log(Object.keys(task.assignedTo));
      let userOnTask = Object.keys(task.assignedTo || "");
      console.log(userOnTask);
      
    if(userOnTask == ""){return;}else{

    for(let i = 0; i <= userOnTask.length; i++ ){
      console.log(userOnTask[i]);

      let found = users.find((u) => u.id == userOnTask[i]);
      //names.push(...found);
    //console.log(found.name);
    if(found != undefined)
      {
    let userN = found.name;
    
     const userName = userN.split(" ");
      const firstInitial = userName[0].charAt(0);
      const lastInitial = userName[userName.length - 1].charAt(0) || "";
    //  console.log(firstInitial+lastInitial);
      return firstInitial+lastInitial;
    } else{return;}
    }   
    }
}



function getAsigntUserName(user, task) {
 //   console.log(user.id);
  //  if(users[id].id === task.assignedTo.u)
    
}
function dragstartHandler(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();
  const dataDrag = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(dataDrag));
}

