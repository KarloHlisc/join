'use strict';
/*
import { database } from "../js/config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";
*/
let userTasks = [];
//function init(){
    getCartTemplate();
//}

function getCartTemplate(){
    const cart = document.getElementById("to-do-cards-container");
    // cart.innerHTML="";
    if(cart == ""){
        cart.innerHTML = '<div id="no-tasks-to-do" class="no-tasks-card">No tasks To do</div>';
    }
    else{
   
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