"use strict";
/**
 * Closes all open dropdowns and resets their arrow icons.
 * @returns {void}
 */
export function closeAllDropdowns() {
  document.getElementById("dropdownList")?.classList.add("hidden");
  document.getElementById("categoryList")?.classList.add("hidden");
  document.getElementById("dropdownArrowImg")?.classList.remove("rotate-180");
  document.getElementById("categoryArrowImg")?.classList.remove("rotate-180");
}

/**
 * Opens or closes a dropdown list and rotates its arrow icon.
 * @param {string} listId - The ID of the dropdown list element.
 * @param {string} arrowId - The ID of the arrow icon element.
 * @param {function} [callback] - Optional callback run when the dropdown opens.
 * @returns {void}
 */
export function toggleDropdown(listId, arrowId, callback = null) {
  const list = document.getElementById(listId);
  const arrow = document.getElementById(arrowId);
  if (!list || !arrow) return;
  const opening = list.classList.contains("hidden");
  closeAllDropdowns();
  if (opening) {
    list.classList.remove("hidden");
    arrow.classList.add("rotate-180");
    if (callback) callback();
  }
}

/**
 * Opens the user dropdown if it is currently closed.
 * @returns {void}
 */
export function openUserDropdown() {
  const list = document.getElementById("dropdownList");
  if (list && list.classList.contains("hidden")) {
    toggleDropdown("dropdownList", "dropdownArrowImg", getUserList);
  }
}
