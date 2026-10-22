"use strict";

import { escapeHtml, isGuestUser } from "./utils.js";

/**
 * Builds the logout dropdown module with help, legal, and logout actions.
 * @returns {string} HTML markup for the logout module.
 */
export function getLogoutModule() {
  return `
    <div id="logout-overlay" class="logout-overlay" onclick="closeLogoutModule()"></div>
    <div id="logout-module">
        <button class="help-btn help help-logout" onclick="location.href='./help.html'">Help</button>
        <button class="nav-legal-btn" onclick="location.href='./legal_after_login.html'">Legal notice</button>
        <button class="nav-policy-btn" onclick="location.href='./policy_after_login.html'">Privacy Policy</button>
        <button id="logout" onclick="logoutFromAccount()">Logout</button>
    </div>
  `;
}

/**
 *Builds the content detail view for a given user.
 * @param {object} user - The contact's data (name, email, phone, etc.).
 * @param {string} initials - The contact's initials for the avatar/icon.
 * @returns {string} HTML markup for the contact details
 */
export function userDetailTemplate(user, initials) {
  return `<div id="details-header"><h1>Contacts</h1><span>Better with a team</span></div>
        <button id="details-back" onclick="closeContactDetails()"><img src="../assets/icons/arrow-left-line.png" alt="Back" /></button>
        <div id="icon-name-and-details">
          <div class="user-icon details-icon" style="background-color: ${user.backgroundColor || "#000"}">${initials}</div>
          <div id="name-and-button">
            <span>${escapeHtml(user.name)}</span>
            <div id="edit-delete"><button id="edit" onclick="showEditContactModule('${user.userId}')"><img src="../assets/icons/edit.svg" alt="edit-btn" />Edit</button>${isGuestUser(user) ? "" : `<button id="delete" onclick="deleteUser('${user.userId}')"><img src="../assets/icons/delete.svg" alt="delete-btn" />Delete</button>`}</div>
          </div>
        </div>
        <span id="contact-info">Contact information</span>
        <div id="details"><span ><strong>Email</strong></span><span class="user-email">${escapeHtml(user.email)}</span><span><strong>Phone</strong></span><span>${escapeHtml(user.phone)}</span></div><button id="mobile-menu-btn" onclick="toggleContactMenu(event)">&#8942;</button><div id="contact-menu"><button onclick="showEditContactModule('${user.userId}')">Edit</button>${isGuestUser(user) ? "" : `<button onclick="deleteUser('${user.userId}')">Delete</button>`}</div>`;
}

/**
 * Build the add contact modal form
 * @returns {string} HTML markup for the add-contact modal.
 */
export function getAddContactModule() {
  return `<div id="add-overlay" onclick="closeAddContactModule()"><div id="add-module" onclick="event.stopPropagation()"> <div id="add-contact-text">
          <img src="../assets/img/join_white.svg" alt="join-logo" /><h1>Add contact</h1><span>Tasks are better with a team!</span></div> 
          <div id="add-contact"><button id="close-contact-module" onclick="closeAddContactModule()"><img src="../assets/icons/vector.svg" alt="x-logo" /></button><div id="person-icon"><img src="../assets/icons/person.svg" alt="person-logo"/></div>
          <div id="form-container"><form id="add-contact-form"><input type="text" placeholder="Name" id="name" /><input type="text" placeholder="Email" id="email" /><input type="text" placeholder="Phone" id="phone" /><div id="errorMessage" style="color: red"></div>
            <div class="button-container">
              <button type="button" id="cancel-contact-module" onclick="closeAddContactModule()">Cancel <img src="../assets/icons/vector.svg" alt="x-logo" /></button>
              <button type="submit" id="create-contact">Create contact <img src="../assets/icons/check.svg" alt="check-logo"/></button>
            </div>
          </form></div></div></div></div></div>`;
}

/**
 * Builds the "Edit contact" modal form pre-filled with existing data.
 * @param {object} user - The contact's current data.
 * @param {string} initials - The contact's initials for the avatar.
 * @returns {string} HTML markup for the edit-contact modal.
 */
export function getEditContactModule(user, initials) {
  return `<div id="add-overlay" onclick="closeAddContactModule()"><div id="add-module" onclick="event.stopPropagation()"> <div id="add-contact-text">
          <img src="../assets/img/join_white.svg" alt="join-logo" /><h1 class="edit-title">Edit contact</h1></div> 
          <div id="add-contact"><button id="close-contact-module" onclick="closeAddContactModule()"><img src="../assets/icons/vector.svg" alt="x-logo" /></button><div id="details-icon" class="user-icon details-icon" style="background-color: ${user.backgroundColor || "#000"}">${initials}</div>
          <div id="form-container"><form id="add-contact-form"><input type="text" value="${escapeHtml(user.name)}" id="name" /><input type="text" value="${escapeHtml(user.email)}" id="email" ${isGuestUser(user) ? "readonly" : ""} /><input type="text" value="${escapeHtml(user.phone)}" id="phone" /><div id="errorMessage" style="color: red"></div>
            <div class="button-container">
              ${isGuestUser(user) ? "" : `<button type="button" class="edit-delete" onclick="deleteUser('${user.userId}')">Delete</button>`}
              <button type="submit" id="edit-contact">Save <img src="../assets/icons/check.svg" alt="check-logo"/></button>
            </div>
          </form></div></div></div></div></div>`;
}

/**
 * Builds the "Add Task" modal wrapper around the task form.
 * @returns {string} HTML markup for the add-task modal.
 */
export function getAddTaskModule() {
  return `<div id="add-task-overlay" onmousedown="if (event.target === this) closeAddTaskModule()">
    <div id="add-task-module">
      <button type="button" id="close-task-module" onclick="closeAddTaskModule()"><img src="../assets/icons/vector.svg" alt="x-logo" /></button>
      ${taskFormTemplate}
    </div>
  </div>`;
}

/** HTML markup for the Add Task form, injected into #main-container. */
export const taskFormTemplate = `
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
            <li class="user-item" data-value="Technical Tasks"><span >Technical Tasks</span></li>
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
