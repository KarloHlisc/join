"use strict";

import { escapeHtml, isGuestUser } from "../utils.js";

/**
 * Builds the logout dropdown module with help, legal, and logout actions.
 * @returns {string} HTML markup for the logout module.
 */
export function getLogoutModule() {
  return `
    <div id="logout-overlay" class="logout-overlay" onclick="closeLogoutModule()"></div>
    <div id="logout-module">
        <button class="help-btn help help-logout" onclick="location.href='./help.html'">Help</button>
        <button class="nav-legal-btn" onclick="location.href='./legalAfterLogin.html'">Legal notice</button>
        <button class="nav-policy-btn" onclick="location.href='./policyAfterLogin.html'">Privacy Policy</button>
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
        <div id="details"><span ><strong>Email</strong></span><span class="user-email">${escapeHtml(user.email)}</span><span><strong>Phone</strong></span><span>${escapeHtml(user.phone)}</span></div><button id="mobile-menu-btn" onclick="toggleContactMenu(event)">&#8942;</button><div id="contact-menu"><div class="mobile-menu-contacts" onclick="showEditContactModule('${user.userId}')"><img id="mobile-menu-edit" src="../assets/icons/edit.svg" alt="edit image"> <button type="button">Edit</button></div>${isGuestUser(user) ? "" : `<div class="mobile-menu-contacts" onclick="deleteUser('${user.userId}')"><img id="mobile-menu-delete" src="../assets/icons/delete.svg" alt="delete image"> <button type="button">Delete</button></div>`}</div>`;
}

/**
 * Build the add contact modal form
 * @returns {string} HTML markup for the add-contact modal.
 */
export function getAddContactModule() {
  return `<div id="add-overlay" onclick="closeAddContactModule()"><div id="add-module" onclick="event.stopPropagation()"> <div id="add-contact-text">
          <img src="../assets/img/join_white.svg" alt="join-logo" /><h1>Add contact</h1><span>Tasks are better with a team!</span></div> 
          <div id="add-contact"><button id="close-contact-module" onclick="closeAddContactModule()"><img src="../assets/icons/vector.svg" alt="x-logo" /></button><div id="person-icon"><img src="../assets/icons/person.svg" alt="person-logo"/></div>
          <div id="form-container"><form id="add-contact-form"><input type="text" placeholder="Name" id="name" /><div class="field-error" id="nameError"></div><input type="text" placeholder="Email" id="email" /><div class="field-error" id="emailError"></div><input type="text" placeholder="Phone" id="phone" /><div class="field-error" id="phoneError"></div>
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
          <div id="form-container"><form id="add-contact-form"><input type="text" value="${escapeHtml(user.name)}" id="name" /><div class="field-error" id="nameError"></div><input type="text" value="${escapeHtml(user.email)}" id="email" ${isGuestUser(user) ? "readonly" : ""} /><div class="field-error" id="emailError"></div><input type="text" value="${escapeHtml(user.phone)}" id="phone" /><div class="field-error" id="phoneError"></div>
            <div class="button-container">
              ${isGuestUser(user) ? "" : `<button type="button" class="edit-delete" onclick="deleteUser('${user.userId}')">Delete</button>`}
              <button type="submit" id="edit-contact">Save <img src="../assets/icons/check.svg" alt="check-logo"/></button>
            </div>
          </form></div></div></div></div></div>`;
}

/**
 * Builds the "Add Task" modal wrapper around the task form.
 * @param {string} formHtml - The markup of the task form.
 * @returns {string} HTML markup for the add-task modal.
 */
export function getAddTaskModule(formHtml) {
  return `<div id="add-task-overlay" onmousedown="if (event.target === this) closeAddTaskModule()">
    <div id="add-task-module">
      <button type="button" id="close-task-module" onclick="closeAddTaskModule()"><img src="../assets/icons/vector.svg" alt="x-logo" /></button>
      ${formHtml}
    </div>
  </div>`;
}
