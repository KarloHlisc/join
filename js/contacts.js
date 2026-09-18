"use strict";
import { database } from "../js/config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const ini = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  return ini.toUpperCase();
}

function createEl(type, className, text = "") {
  const el = document.createElement(type);
  el.classList.add(className);
  if (text) el.innerText = text;
  return el;
}

function checkAndRenderHeader(name, lastLetter, container) {
  const currentLetter = name.charAt(0).toUpperCase();
  if (currentLetter !== lastLetter) {
    const header = document.createElement("h2");
    header.innerText = currentLetter;
    container.append(header);
    return currentLetter;
  }
  return lastLetter;
}

function createTextContainer(user) {
  const container = createEl("div", "text-container");
  const nameSpan = createEl("span", "user-name", user.name);
  const emailSpan = createEl("span", "user-email", user.email);
  container.append(nameSpan, emailSpan);
  return container;
}

function createAndAppendButton(user, container) {
  const button = createEl("button", "user-btn");
  const icon = createEl("div", "user-icon", getInitials(user.name));
  const textContainer = createTextContainer(user);

  button.append(icon, textContainer);
  container.append(button);
}

async function getUserList() {
  const data = await get(ref(database, "users"));
  const users = data.exists() ? Object.values(data.val()) : [];
  users.sort((a, b) => a.name.localeCompare(b.name));
  const container = document.getElementById("main-container");
  let lastLetter = "";
  users.forEach((user) => {
    lastLetter = checkAndRenderHeader(user.name, lastLetter, container);
    createAndAppendButton(user, container);
  });
}

window.getUserList = getUserList;
document.addEventListener("DOMContentLoaded", getUserList);
