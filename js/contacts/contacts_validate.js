"use strict";
import { isValidEmail } from "../utils.js";

/**
 * Validates the contact form values.
 * @param {{name: string, email: string, phone: string}} values - The form values.
 * @returns {object} Error messages keyed by field ID.
 */
export function validateContactFields({ name, email, phone }) {
  const errors = {};
  if (!name) errors.name = "Please enter a name.";
  if (!isValidEmail(email))
    errors.email = "Please enter a valid email address.";
  if (!/^\+?[0-9\s\-/()]{6,20}$/.test(phone))
    errors.phone = "Please enter a valid phone number.";
  return errors;
}

/**
 * Marks invalid fields and shows the first error message.
 * @param {object} errors - Error messages keyed by field ID.
 * @returns {boolean} True if there are no errors.
 */
export function showContactErrors(errors) {
  ["name", "email", "phone"].forEach((id) => {
    document.getElementById(id)?.classList.toggle("input-error", !!errors[id]);
  });
  const message = Object.values(errors)[0] || "";
  const display = document.getElementById("errorMessage");
  if (display) display.textContent = message;
  return !message;
}
