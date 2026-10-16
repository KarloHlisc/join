"use strict";

import {
  getPolicyTemplate,
  getLegalTemplate,
} from "./legal_policy_templates.js";

/**
 * Builds the "Log in" navigation button shown on pre-login pages.
 * @returns {string} HTML markup for the navigation button.
 */
function getNavigationHtmlBeforeLogin() {
  return `        
          <button onclick="location.href = '../index.html'"><img src="../assets/icons/login.png" alt="join summary" /> Log in</button>`;
}

/**
 * Builds the sidebar and header layout shown on pre-login pages.
 * @returns {string} HTML markup for the layout.
 */
function getLayoutHtmlBeforeLogin() {
  return `
    <aside class="side-bar-wrapper">
        <div class="aside-logo"><img src="../assets/img/join_white.svg" alt="Logo" /></div>
        <div class="aside-menu">${getNavigationHtmlBeforeLogin()}</div>
        <div class="aside-footer"><button id="nav-policy_login" onclick="location.href='./policy_login.html'">Privacy Policy</button><button id="nav-legal_login" onclick="location.href='./legal_login.html'">Legal notice</button></div>
    </aside>
    <header><p>Kanban Project Management Tool</p>`;
}

/**
 * Highlights the sidebar button matching the current page.
 * @returns {void}
 */
function setActivePage() {
  const page = window.location.pathname.split("/").pop().replace(".html", "");
  document.getElementById(`nav-${page}`)?.classList.add("active-site");
}

const templates = {
  getpolicyloginTemplate: getpolicyloginTemplate,
  getlegalloginTemplate: getlegalloginTemplate,
};

/**
 * Renders the page-specific template into its main element.
 * @returns {void}
 */
function renderPageTemplate() {
  const page = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "")
    .replaceAll("_", "")
    .toLowerCase();
  const template = templates[`get${page}Template`];
  const main = document.getElementById(`main-${page}`);
  if (typeof template === "function" && main) main.innerHTML = template();
}

/**
 * Renders the pre-login layout and the page-specific template.
 * @returns {void}
 */
function initLayout() {
  document.body.insertAdjacentHTML("afterbegin", getLayoutHtmlBeforeLogin());
  renderPageTemplate();
  setActivePage();
}

/**
 * Returns the privacy policy template for pre-login pages.
 * @returns {string} HTML markup for the privacy policy.
 */
function getpolicyloginTemplate() {
  return getPolicyTemplate();
}

/**
 * Returns the legal notice template for pre-login pages.
 * @returns {string} HTML markup for the legal notice.
 */
function getlegalloginTemplate() {
  return getLegalTemplate();
}

document.addEventListener("DOMContentLoaded", initLayout);
