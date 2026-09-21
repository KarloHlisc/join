"use strict";

export function getNavigationHtml() {
  return `
        <button id="nav-summary" onclick="location.href='./summary.html'"><img src="../assets/icons/summary.png"> Summary</button>
        <button id="nav-add_task" onclick="location.href='./add_task.html'"><img src="../assets/icons/add_task.png"> Add Task</button>
        <button id="nav-board" onclick="location.href='./board.html'"><img src="../assets/icons/board.png"> Board</button>
        <button id="nav-contacts" onclick="location.href='./contacts.html'"><img src="../assets/icons/contacts.png"> Contacts</button>
    `;
}

export function getLogoutModule() {
  return `
    <div id="logout-overlay" class="logout-overlay" onclick="closeLogoutModule()"></div>
    <div id="logout-module">
        <button id="help-btn" class="help help-logout" onclick="openHelpPage()">Help</button>
        <button id="nav-legal_after_login" onclick="location.href='./legal_after_login.html'">Legal notice</button>
        <button id="nav-policy_after_login" onclick="location.href='./policy_after_login.html'">Privacy Policy</button>
        <button id="logout" onclick="logoutFromAccount()">Logout</button>
    </div>
    `;
}

export function getLayoutHtml() {
  return `
    <aside class="side-bar-wrapper">
        <div class="aside-logo"><img src="../assets/img/join_white.svg" alt="Logo" /></div>
        <div class="aside-menu">${getNavigationHtml()}</div>
        <div class="aside-footer"><button id="nav-policy_after_login" onclick="location.href='./policy_after_login.html'">Privacy Policy</button><button id="nav-legal_after_login" onclick="location.href='./legal_after_login.html'">Legal notice</button></div>
    </aside>
    <header><p>Kanban Project Management Tool</p><div class="user-and-help"><button id="help-btn" class="help" onclick="openHelpPage()"><img src="../assets/icons/help.png" alt="help-icon" /></button><button class="user-icon header-icon" onclick="showLogoutModule()"></button></div><div id="logout-container"></div>
    </header>`;
}

export const helpTemplateTxT = `
      <div class="help-header">
        <h1>Help</h1>
        <button class="btn-back-to-main" onclick="closeHelpPage()">
          <img src="../assets/icons/arrow-left-line.png" alt="arrow-btn" />
        </button>
      </div>
      <div class="help-main">
        <p>Welcome to the help page for Join, your guide to using our kanban project management tool...</p>
        <!-- (Restlicher Text bleibt wie von dir definiert) -->
      </div>`;

export function helpTemplate() {
  return helpTemplateTxT;
}

export function getAddContactModule() {
  return `<div id="add-overlay" onclick="closeAddContactModule()"><div id="add-module" onclick="event.stopPropagation()"> <div id="add-contact-text">
          <img src="../assets/img/join_white.svg" alt="join-logo" /><h1>Add contact</h1><span>Tasks are better with a team!</span></div> 
          <div id="add-contact"><button id="close-contact-module" onclick="closeAddContactModule()"><img src="../assets/icons/vector.svg" alt="x-logo" /></button><div id="person-icon"><img src="../assets/icons/person.svg" alt="person-logo"/></div>
          <div id="form-container"><form id="add-contact-form"><input type="text" placeholder="Name" id="name" required /><input type="text" placeholder="Email" id="email" required /><input type="text" placeholder="Phone" id="phone" required /><div id="errorMessage" style="color: red"></div>
            <div class="button-container">
              <button id="cancel-contact-module" onclick="closeAddContactModule()">Cancel <img src="../assets/icons/vector.svg" alt="x-logo" /></button>
              <button type="submit" id="create-contact">Create contact <img src="../assets/icons/check.svg" alt="check-logo"/></button>
            </div>
          </form></div></div></div></div></div>`;
}
