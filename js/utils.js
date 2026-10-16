"use strict";
import { database } from "./config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

/**
 * Checks whether a string is a syntactically valid email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the format is valid.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Escapes HTML special characters.
 * @param {string} str - The raw text.
 * @returns {string} The escaped text.
 */
export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Extracts the initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The uppercase initials.
 */
export function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const ini = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  return ini.toUpperCase();
}

/**
 * Creates a DOM element with a class and optional text content.
 * @param {string} type - The tag name.
 * @param {string} className - The CSS class.
 * @param {string} [text] - Optional text content.
 * @returns {HTMLElement} The created element.
 */
export function createEl(type, className, text = "") {
  const el = document.createElement(type);
  el.classList.add(className);
  if (text) el.innerText = text;
  return el;
}

/**
 * Generates a random hex color for avatar backgrounds.
 * @returns {string} A hex color string.
 */
export function getRandomColor() {
  const n = Math.floor(Math.random() * 0xffffff);
  return "#" + n.toString(16).padStart(6, "0");
}

/**
 * Generates the next sequential user ID.
 * @param {object} currentUsers - The users object from Firebase.
 * @returns {string} The next ID, e.g. "userid_03".
 */
export function generateNextUserId(currentUsers) {
  const keys = Object.keys(currentUsers || {});
  if (keys.length === 0) return "userid_01";
  const numbers = keys.map((k) => parseInt(k.match(/\d+/)?.[0] || 0, 10));
  return `userid_${String(Math.max(...numbers) + 1).padStart(2, "0")}`;
}

/**
 * Builds a user object for Firebase.
 * @param {string} email - The email.
 * @param {string} name - The name.
 * @param {string} [password] - The password (empty for contacts).
 * @param {string} [phone] - The phone number.
 * @returns {object} The user object.
 */
export function buildUser(email, name, password = "", phone = "") {
  return { email, name, password, phone, backgroundColor: getRandomColor() };
}

/**
 * Checks whether an email address is already registered.
 * @param {string} email - The email to check.
 * @returns {Promise<object|undefined>} The matching user, or undefined.
 */
export async function checkEmail(email) {
  const data = await get(ref(database, "users"));
  const users = data.exists() ? data.val() : {};
  return Object.values(users).find((u) => u.email === email);
}
