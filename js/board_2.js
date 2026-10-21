"use strict";

/**
 * Moves the dragged card inside the column and highlights the column.
 * @param {DragEvent} e - The dragover event.
 * @param {HTMLElement} container - The column under the pointer.
 * @returns {void}
 */
function handleDragOver(e, container) {
  e.preventDefault();
  const draggable = document.querySelector(".dragging");
  if (!draggable) return;
  setTilt(draggable, e.clientX);
  container.classList.add("drag-over");
  container.querySelector(".no-tasks-card")?.remove();
  const afterElement = getDragAfrerElement(container, e.clientY);
  if (afterElement == null) container.appendChild(draggable);
  else container.insertBefore(draggable, afterElement);
}

/**
 * Tilts the dragged card in the direction of the pointer movement.
 * @param {HTMLElement} card - The dragged card.
 * @param {number} x - The current horizontal pointer position.
 * @returns {void}
 */
function setTilt(card, x) {
  if (x === lastDragX) return;
  card.style.setProperty("--tilt", x > lastDragX ? "3deg" : "-3deg");
  lastDragX = x;
}

/**
 * Saves a dragged card's status to Firebase and updates the local task data.
 * @param {HTMLElement} card Dragged card with a `data-id` attribute.
 * @returns {Promise<void>}
 */
async function saveCardStatus(card) {
  const { cardId, newStatus } = getCardIdAndStatus(card);
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
 * Reads a card's ID and the status of its containing column.
 * Logs an error if either `data-id` or `data-status` is missing.
 * @param {Element} card - The card element to inspect.
 * @returns {{ cardId: string, newStatus: string } | undefined}
 *   The card ID and column status, or `undefined` if either is missing.
 */
function getCardIdAndStatus(card) {
   const cardId = card.dataset.id;
  const container = card.closest(".cards-container");
  const newStatus = container?.dataset.status;
  if (!cardId || !newStatus) {
    console.error("Karte braucht data-id und Spalte braucht data-status.");
    return;
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

/**
 * Starts a touch-based drag operation for the card receiving the pointer event.
 * Ignores non-touch pointers and non-primary buttons. For a valid touch event,
 * records the card's position and size, applies drag styles, registers pointer
 * event listeners, and prevents the default browser behavior.
 * @param {PointerEvent} event - The pointer event that starts the drag.
 * @returns {void}
 */
function startPointerDrag(event) {
  if (event.pointerType !== "touch" || event.button !== 0) return;
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  setPointerDrag(event, card, rect);
  addCardStyle(card, rect);
  document.addEventListener("pointermove", movePointerDrag, { passive: false });
  document.addEventListener("pointerup", stopPointerDrag);
  document.addEventListener("pointercancel", stopPointerDrag);
  event.preventDefault();
}

/**
 * Stores the card and pointer position details needed during a drag operation.
 * @param {PointerEvent} event - The pointer event that started the drag.
 * @param {Element} card - The card being dragged.
 * @param {DOMRect} rect - The card's position and dimensions at drag start.
 * @returns {void}
 */
function setPointerDrag(event, card, rect) {
    pointerDrag = {
    card,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Applies the styles needed to visually move a card during a drag operation.
 * @param {Element} card - The card being dragged.
 * @param {DOMRect} rect - The card's position and dimensions at drag start.
 * @returns {void}
 */
function addCardStyle(card, rect) {
  card.classList.add("dragging");
  card.style.width = `${rect.width}px`;
  card.style.height = `${rect.height}px`;
  card.style.position = "fixed";
  card.style.left = `${rect.left}px`;
  card.style.top = `${rect.top}px`;
  card.style.zIndex = "1000";
  card.style.pointerEvents = "none";
}

/**
 * Moves the card and highlights the column under the pointer.
 * @param {PointerEvent} event
 */
function movePointerDrag(event) {
  if (!pointerDrag) return;
  event.preventDefault();
  setPointerDragPosition(event);
  if (!hoveredContainer) return;
  hoveredContainer.querySelector(".no-tasks-card")?.remove();
  const afterElement = getDragAfterElement(hoveredContainer,event.clientY,);
  if (afterElement) {
    hoveredContainer.insertBefore(card, afterElement);
  } else {
    hoveredContainer.appendChild(card);
  }
}

/**
 * Updates the dragged card's position to follow the pointer and highlights the
 * card container currently beneath it.
 * Expects `pointerDrag` to contain the dragged card and its pointer offsets.
 * @param {PointerEvent} event - The pointer movement event.
 * @returns {void}
 */
function setPointerDragPosition(event) {
  const { card, offsetX, offsetY } = pointerDrag;
  card.style.left = `${event.clientX - offsetX}px`;
  card.style.top = `${event.clientY - offsetY}px`;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const hoveredContainer = target?.closest(".cards-container");
  document.querySelectorAll(".cards-container").forEach((container) => {
    container.classList.toggle("drag-over", container === hoveredContainer);
  });
}

/**
 * Ends a touch drag, saves the card if it was dropped in a column,
 * or restores it to its original position if dropped outside the board.
 * @param {PointerEvent} event
 */
function stopPointerDrag(event) {
  if (!pointerDrag) return;
  const { card } = pointerDrag;
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const dropContainer = target?.closest(".cards-container");
  removePointerEventListeners();
  checkIfDropZoneReady(dropContainer, card, event);
  resetPointerDraggedCard(card);
  document.querySelectorAll(".cards-container").forEach((container) => {
    container.classList.remove("drag-over");
  });
  pointerDrag = null;
 checkIfSaveCardStatus( dropContainer, card);
}

/**
 * Moves a card into the drop container at the position indicated by the
 * pointer's vertical coordinate.
 * @param {Element | null} dropContainer - The container receiving the card, if any.
 * @param {Element} card - The card to move.
 * @param {PointerEvent} event - The pointer event used to determine the insertion position.
 * @returns {void}
 */
function checkIfDropZoneReady(dropContainer, card, event) {
  if (dropContainer) {
    const afterElement = getDragAfterElement(dropContainer, event.clientY);
    if (afterElement) {
      dropContainer.insertBefore(card, afterElement);
    } else {
      dropContainer.appendChild(card);
    }
  }
}

/**
 * Removes the pointer event listeners used during a drag operation.
 * @returns {void}
 */
function removePointerEventListeners() { 
  document.removeEventListener("pointermove", movePointerDrag);
  document.removeEventListener("pointerup", stopPointerDrag);
  document.removeEventListener("pointercancel", stopPointerDrag);
}

/**
 * Saves the card's status if a drop container exists.
 * @param {Element | null} dropContainer - The container the card was dropped into, if any.
 * @param {Element} card - The card whose status should be saved.
 * @returns {void}
 */
function checkIfSaveCardStatus(dropContainer, card) {
   if (dropContainer) {
    saveCardStatus(card);
  }
}

/**
 * Clears temporary inline styles used while touch-dragging.
 * @param {HTMLElement} card
 */
function resetPointerDraggedCard(card) {
  card.classList.remove("dragging");
  card.style.position = "";
  card.style.left = "";
  card.style.top = "";
  card.style.zIndex = "";
  card.style.pointerEvents = "";
  card.style.width = "";
  card.style.height = "";
}

/**
 * Registers native desktop drag-and-drop listeners on each card container.
 * @param {NodeListOf<Element>} cardContainers
 */
function registerCardContainerListeners(cardContainers) {
  cardContainers.forEach((container) => {
    container.addEventListener("dragover", (event) => {
      event.preventDefault();
      setDragOverPosition(event, container);
    });
    container.addEventListener("dragleave", (event) => {
     checkIfLeaveContainer(event, container);
    });
    container.addEventListener("drop", () => {
      container.classList.remove("drag-over");
    });
  });
}

/**
 * Positions the currently dragged card within a container based on the
 * pointer's vertical position.
 * Adds the `drag-over` class and removes any `.no-tasks-card` placeholder.
 * Does nothing if no card is being dragged or a pointer-based drag is active.
 * @param {DragEvent} event - The drag event used to determine the insertion position.
 * @param {Element} container - The container receiving the dragged card.
 * @returns {void}
 */
function setDragOverPosition(event, container) {
  const card = document.querySelector(".dragging");
      if (!card || pointerDrag) return;
      container.classList.add("drag-over");
      container.querySelector(".no-tasks-card")?.remove();
      const afterElement = getDragAfterElement(container, event.clientY);
      if (afterElement) {
        container.insertBefore(card, afterElement);
      } else {
        container.appendChild(card);
      }
}

/**
 * Removes the `drag-over` class when the pointer leaves the container.
 * @param {DragEvent} event - The drag-leave event.
 * @param {Element} container - The container to check.
 * @returns {void}
 */
function checkIfLeaveContainer(event, container) {
   if (!container.contains(event.relatedTarget)) {
        container.classList.remove("drag-over");
      }
}

/**
 * Finds the card that the dragged card should be placed before.
 * @param {Element} container
 * @param {number} y
 * @returns {Element | undefined}
 */
function getDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll(".draggable:not(.dragging)"),];
  return cards.reduce(
    (closest, card) => {
      const box = card.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: card };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: undefined },).element;
}
