"use strict";
function init() {
  getCartTemplate();
}

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
