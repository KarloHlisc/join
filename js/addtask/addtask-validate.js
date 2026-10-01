"use strict";

/**
 * Displays or clears a validation error message for a given input.
 * @param {string} inputId - The ID of the input field.
 * @param {string} errorId - The ID of the error message element.
 * @param {string} message - The error message, or an empty string to clear it.
 * @returns {void}
 */
export function setFieldError(inputId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  if (message) document.getElementById(inputId).classList.add("input-error");
}

/**
 * Validates that the task title field is filled.
 * @returns {boolean} True if the title is valid.
 */
export function validateTitle() {
  const value = document.getElementById("formTitle").value.trim();
  setFieldError(
    "formTitle",
    "errorTitle",
    value ? "" : "This field is required",
  );
  return !!value;
}

/**
 * Validates that the due date field is filled.
 * @returns {boolean} True if the date is valid.
 */
export function validateDate() {
  const value = document.getElementById("duedate").value.trim();
  setFieldError("duedate", "errorDate", value ? "" : "This field is required");
  return !!value;
}

/**
 * Validates that a task category has been selected.
 * @returns {boolean} True if a category is selected.
 */
export function validateCategory() {
  const value = document.getElementById("categorySelectedText").innerText;
  const ok = value !== "Select task category";
  document.getElementById("errorCategory").textContent = ok
    ? ""
    : "Please select a category";
  return ok;
}

/**
 * Clears all Add Task form validation error messages and styles.
 * @returns {void}
 */
export function clearErrors() {
  ["errorTitle", "errorDate", "errorCategory"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  document.getElementById("formTitle")?.classList.remove("input-error");
  document.getElementById("duedate")?.classList.remove("input-error");
}

/**
 * Validates the Add Task form before submission.
 * @param {SubmitEvent} e - The form submit event.
 * @returns {boolean} True if the form is valid.
 */
export function checkVali(e) {
  clearErrors();
  const valid = validateTitle() && validateDate() && validateCategory();
  if (!valid) e.preventDefault();
  return valid;
}
