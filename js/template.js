"use strict";

const currentPage = "main-content";

function getNavigationHtml() {
  return `
        <button id="nav-summary" onclick="location.href='./summary.html'"><img src="../assets/icons/summary.png"> Summary</button>
        <button id="nav-add_task" onclick="location.href='./add_task.html'"><img src="../assets/icons/add_task.png"> Add Task</button>
        <button id="nav-board" onclick="location.href='./board.html'"><img src="../assets/icons/board.png"> Board</button>
        <button id="nav-contacts" onclick="location.href='./contacts.html'"><img src="../assets/icons/contacts.png"> Contacts</button>
    `;
}

function getLayoutHtml() {
  return `
    <aside class="side-bar-wrapper">
        <div class="aside-logo"><img src="../assets/img/join_white.svg" alt="Logo" /></div>
        <div class="aside-menu">${getNavigationHtml()}</div>
        <div class="aside-footer"><button id="nav-policy_after_login" onclick="location.href='./policy_after_login.html'">Privacy Policy</button><button id="nav-legal_after_login" onclick="location.href='./legal_after_login.html'">Legal notice</button></div>
    </aside>
    <header><p>Kanban Project Management Tool</p>
            <div class="user-and-help">
             <button class="help"><img src="../assets/icons/help.png" alt="help-icon" /></button>
            <button id="user-icon"></button>
            </div>
    </header>`;
}

function setActivePage() {
  const page = window.location.pathname.split("/").pop().replace(".html", "");
  document.getElementById(`nav-${page}`)?.classList.add("active-site");
}

function initLayout() {
  document.body.insertAdjacentHTML("afterbegin", getLayoutHtml());
  setActivePage();
}

document.addEventListener("DOMContentLoaded", initLayout);

function helpTemplate() {
  return `
    <div class="help-header">
    <h2`;
}
