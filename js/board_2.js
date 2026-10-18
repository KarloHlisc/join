"use strict";

let dropZonesReady = false;

/**
 * Registers drag-and-drop listeners for cards and board columns.
 * @returns {void}
 */
function initDragAndDrop() {
  const draggables = document.querySelectorAll(".draggable");
  const cardContainers = document.querySelectorAll(".cards-container");
  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });
    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
      saveCardStatus(draggable);
    });
  });
  if (dropZonesReady) return;
  cartContainersFun(cardContainers);
  dropZonesReady = true;
}

/**
 * Registers drag-and-drop event listeners on the card containers.
 * @param {NodeListOf<Element>} cardContainers The board's card containers.
 * @returns {void}
 */
function cartContainersFun(cardContainers) {
  cardContainers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggable = document.querySelector(".dragging");
      if (!draggable) return;
      container.classList.add("drag-over");
      container.querySelector(".no-tasks-card")?.remove();
      const afterElement = getDragAfrerElement(container, e.clientY);
      if (afterElement == null) container.appendChild(draggable);
      else container.insertBefore(draggable, afterElement);
    });
    container.addEventListener("dragleave", (e) => {
      if (!container.contains(e.relatedTarget))
        container.classList.remove("drag-over");
    });
    container.addEventListener("drop", () =>
      container.classList.remove("drag-over"),
    );
  });
}

/**hide this */
function cartContainersFun(cardContainers) {
  cardContainers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggable = document.querySelector(".dragging");
      if (!draggable) return;
      const afterElement = getDragAfrerElement(container, e.clientY);
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });
}

/**
 * Saves a dragged card's status to Firebase and updates the local task data.
 * @param {HTMLElement} card Dragged card with a `data-id` attribute.
 * @returns {Promise<void>}
 */
async function saveCardStatus(card) {
  const cardId = card.dataset.id;
  const container = card.closest(".cards-container");
  const newStatus = container?.dataset.status;
  if (!cardId || !newStatus) {
    console.error("Karte braucht data-id und Spalte braucht data-status.");
    return;
  }
  try {
    const task = tickets.find((t) => t.id === cardId);
    if (task) {
      task.status = newStatus;
    }
    await updateStatusFirebase(cardId, newStatus);
    clearAllContainers();
  } catch (error) {
    console.error("Status konnte nicht gespeichert werden:", error);
  }
}

/**
 * Updates a task's status in Firebase.
 * @param {string} cardId ID of the task.
 * @param {string} newStatus The task's new status.
 * @returns {Promise<void>}
 * @throws {Error} If Firebase returns an unsuccessful HTTP response.
 */
async function updateStatusFirebase(cardId, newStatus) {
  const response = await fetch(`${BASE_URL}tasks/${cardId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!response.ok) {
    throw new Error(`Firebase-Error: ${response.status}`);
  }
}

/**
 * Clears the board columns and renders the board from the local task array.
 * @returns {void}
 */
function clearAllContainers() {
  clearTheTaskPreview();
  displayTasks(tickets);
}

/**
 * Filters tasks using the search field's contents and updates the display.
 * @returns {void}
 */
function searchCards() {
  let cardSearchText = document.getElementById("search-task").value;
  filterItems(tickets, cardSearchText);
  if (cardSearchText == "") {
    displayTasks(tickets);
  }
}

/**
 * Filters tasks for matches in their titles or descriptions.
 * @param {Array<Object>} arr Tasks to search.
 * @param {string} query Search term.
 * @returns {void}
 */
function filterItems(arr, query) {
  let getCartTitle = arr.filter((el) =>
    el.title.toLowerCase().includes(query.toLowerCase()),
  );
  let getCartDescription = arr.filter((el) =>
    (el.description || "").toLowerCase().includes(query.toLowerCase()),
  );
  checkIfExist(getCartTitle, getCartDescription);
}

/**
 * Clears the board, displays the matching tasks, and initializes drag and drop.
 * @param {Array<Object>} getCartTitle Tasks with a title match.
 * @param {Array<Object>} getCartDescription Tasks with a description match.
 * @returns {void}
 */
function checkIfExist(getCartTitle, getCartDescription) {
  clearTheTaskPreview();
  iterarCards(getCartTitle, getCartDescription);
  checkIfBoardEmpty();
  initDragAndDrop();
}

/**
 * Combines the result arrays without duplicates and renders the matching tasks.
 * @param {Array<Object>} getCartTitle Tasks with a title match.
 * @param {Array<Object>} getCartDescription Tasks with a description match.
 * @returns {void}
 */
function iterarCards(getCartTitle, getCartDescription) {
  const search = [...new Set([...getCartTitle, ...getCartDescription])];
  if (search.length != 0) {
    for (let index = 0; index < search.length; index++) {
      const elementTitle = search[index];
      showCards(elementTitle);
    }
  } else {
    return;
  }
}

/**
 * Converts a name into two initials: the first and last words' initials.
 * @param {string} name Full name.
 * @returns {string} Two uppercase initials.
 */
function getInitials(name) {
  const parts = name.split(" ");
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  return first + last;
}
