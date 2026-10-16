function getCartTemplate(task){
    return `
        <button 
            role="button" 
            class="cart draggable" 
            id="${task.id}"
            draggable="true"
            onclick="openTaskDialog(event)"
            data-task-id="${task.id}"
        >
            <div class="level-story">
                <p style="background:#2d8cff;">${task.category || "User Story"}</p>
            </div>
            <div class="title-story">
                <h4>${task.title || "Keine Beschreibung"}</h4>
                <p>${task.description || ""}</p>
            </div>
            <div class="cart-progress">
                <progress value="" max="100"></progress>
                <span>"0/0" Subtasks</span>
            </div>
            <div class="cart-assigment">
                <span>${findUsers(task) || ""}</span> 
                <div class="priority-badge">
                    <img src="${getPriorityImage(task.priority)}" alt="${task.priority}" class="priority-icon-small">
                </div>
            </div>
        </button>
    `;
}


function getCreateTaskDetailTemplate(task, assignedUsers,subtaskArray){
   return `
        <div class="dialog-content">
            <div class="dialog-header">
                <span class="category-badge" style="background-color:${task.colors};">${task.category || "User Story"}</span>
                <button class="close-btn" onclick="document.getElementById('myDialog').close()">✕</button>
            </div>
            
            <div class="dialog-body">
                <h2 class="task-title">${task.title}</h2>
                <p class="task-description">${task.description || ""}</p>
                
                <div class="task-details">
                    <div class="detail-row">
                        <span class="detail-label">Due date:</span>
                        <span class="detail-value">${task.dueDate || "No date"}</span>
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
                                <div class="user-avatar" style="background-color: ${getUserColor(user.id)}">${getInitials(user.name)}</div>
                                <span>${user.name}</span>
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
                                    <input type="checkbox" id="subtask-${st.id}" ${st.done ? "checked" : ""}>
                                    <label for="subtask-${st.id}">${st.title}</label>
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
                <button class="btn-edit" onclick="editTask(${task.id})">
                    <img src="../assets/icons/edit.svg" alt="edit"> Edit
                </button>
            </div>
        </div>
    `;
}