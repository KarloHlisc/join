/**
 * Escapes HTML special characters.
 * @param {string} str - The raw text.
 * @returns {string} The escaped text.
 */
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Builds the HTML markup of a task card on the board.
 * @param {Object} task - The task to render.
 * @returns {string} HTML markup of the card.
 */
function getCartTemplate(task) {
  return `
        <div role="button" tabindex="0" data-id="${task.id}" class="cart draggable" id="${task.id}" draggable="true" onclick="openTaskDialog(event)">
            <div class="level-story">
                <p style="background-color: ${getTaskColor(task)}">${task.category || "User Story"}</p>
            </div>
            <div class="title-story">
                <h4>${escapeHtml(task.title) || "Keine Beschreibung"}</h4>
                <p>${escapeHtml(task.description) || ""}</p>
            </div>
            <div class="cart-progress">
                <progress value="${getProgressValue(task)}" max="100"></progress>
                <span class="subtask-count">${showSubtasks(task) || 0} Subtasks</span>
            </div>
            <div class="cart-assigment">
            <div class="users-together">
                <div class="assigned-users">
                   ${getUsersOnCart(task)}
                    </div> </div> 
                <div class="priority-badge">
                    <img src="${getPriorityImage(task.priority)}" alt="${task.priority}" class="priority-icon-small">
                </div>
            </div>
        </div>
    `;
}

/**
 * Builds the avatar chips of all users assigned to a task.
 * @param {Object} task - The task with an optional assignedTo list.
 * @returns {string} HTML markup of the avatars.
 */
function getUsersOnCart(task) {
  return `${getAssignedUsersArray(task)
    .map(
      (
        user,
      ) => `<div class="user-chip"><div class="user-avatar" style="background-color: ${user.backgroundColor}">${getInitials(escapeHtml(user.name))}</div>
       </div>`,
    )
    .join("")}`;
}

/**
 * Builds the HTML markup of the task detail dialog.
 * @param {Object} task - The task to show.
 * @param {Array<Object>} assignedUsers - Users assigned to the task.
 * @param {Array<Object>} subtaskArray - The task's subtasks with IDs.
 * @returns {string} HTML markup of the dialog.
 */
function getCreateTaskDetailTemplate(task, assignedUsers, subtaskArray) {
  return `
        <div class="dialog-content">
            <div class="dialog-header">
                <span class="category-badge" style="background-color:${getTaskColor(task)};">${task.category || "User Story"}</span>
                <button class="close-btn" onclick="document.getElementById('myDialog').close()">✕</button>
            </div>
            
            <div class="dialog-body">
                <h2 class="task-title">${escapeHtml(task.title)}</h2>
                <p class="task-description">${escapeHtml(task.description) || ""}</p>
                
                <div class="task-details">
                    <div class="detail-row">
                        <span class="detail-label">Due date:</span>
                        <span class="detail-value">${task.duedate || "No date"}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Priority:</span>
                        <div class="priority-display">
                        <span class="detail-value">${task.priority || "Normal"}</span>
                            <img src="${getPriorityImage(task.priority)}" alt="${task.priority}" class="priority-icon-dialog">
                        </div>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Assigned to:</span>
                    </div>
                    <div class="assigned-users">
                        ${assignedUsers
                          .map(
                            (user) => `
                            <div class="user-chip">
                                <div class="user-avatar" style="background-color: ${user.backgroundColor}">${getInitials(escapeHtml(user.name))}</div>
                                <span>${escapeHtml(user.name)}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="subtasks-section">
                    <h3 class="subtasks-title">Subtasks</h3>
                    <div class="subtasks-list">
                        ${
                          subtaskArray.length > 0
                            ? subtaskArray
                                .map(
                                  (st) => `
                                <div class="subtask-item">
                                    <input type="checkbox" id="subtask-${st.id}" ${st.isDone ? "checked" : ""}
                                     onchange="toggleSubtask('${task.id}', '${st.id}', this.checked)">
                                    <label for="subtask-${st.id}">${escapeHtml(st.title)}</label>
                                </div>
                            `,
                                )
                                .join("")
                            : '<p class="no-subtasks">No subtasks</p>'
                        }
                    </div>
                </div>
            </div>
            
            <div class="dialog-footer">
                <button class="btn-delete" onclick="deleteTask('${task.id}')">
                    <img src="../assets/icons/delete.svg" alt="delete"> Delete
                </button>
                <div id="footerBetween"></div>
                <button class="btn-edit" onclick="showEditTaskModule('${task.id}')">
                    <img src="../assets/icons/edit.svg" alt="edit"> Edit
                </button>
            </div>
        </div>
    `;
}
