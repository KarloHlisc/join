"use strict";
import { isValidEmail, bindBlurValidation, showFieldError } from "../utils.js";

const checks = {
  name: (v) => (v ? "" : "Please enter a name."),
  email: (v) => (isValidEmail(v) ? "" : "Please enter a valid email address."),
  phone: (v) =>
    /^\+?[0-9\s\-/()]{6,20}$/.test(v)
      ? ""
      : "Please enter a valid phone number.",
};

/**
 * Validates the contact form values.
 * @param {{name: string, email: string, phone: string}} values - The form values.
 * @returns {object} Error messages keyed by field ID.
 */
export function validateContactFields(values) {
  const errors = {};
  Object.keys(checks).forEach((id) => {
    const message = checks[id](values[id]);
    if (message) errors[id] = message;
  });
  return errors;
}

/**
 * Marks invalid fields and shows each error under its field.
 * @param {object} errors - Error messages keyed by field ID.
 * @returns {boolean} True if there are no errors.
 */
export function showContactErrors(errors) {
  ["name", "email", "phone"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) showFieldError(input, errors[id] || "", `${id}Error`);
  });
  return Object.keys(errors).length === 0;
}

/**
 * Registers blur validation for the contact form fields.
 * @returns {void}
 */
export function setupContactBlurValidation() {
  Object.keys(checks).forEach((id) =>
    bindBlurValidation(id, checks[id], `${id}Error`),
  );
}
