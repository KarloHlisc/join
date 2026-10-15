function getCartTemplate(task) {
  return `
        <button role="button" class="cart draggable" id="${task.id}" draggable="true" onclick="openTaskDialog(event)" data-task-id="${task.id}">
            <div class="level-story">
                <p style="background-color: ${getTaskColor(task)}"">${task.category || "User Story"}</p>
            </div>
            <div class="title-story">
                <h4>${task.title || "Keine Beschreibung"}</h4>
                <p>${task.description || ""}</p>
            </div>
            <div class="cart-progress">
                <progress value="" max="100"></progress>
                <span id="showSubtask">${showSubtasks(task) || 0} Subtasks</span>
            </div>
            <div class="cart-assigment">
            <div class="users-together">
                <div class="assigned-users">
                        ${getAssignedUsersArray(task).map((user) => `
                            <div class="user-chip">
                                <div class="user-avatar" style="background-color: ${user.backgroundColor}">${getInitials(user.name)}</div>
                            </div>
                        `,).join("")}
                    </div> </div> 
                <div class="priority-badge">
                    <img src="${getPriorityImage(task.priority)}" alt="${task.priority}" class="priority-icon-small">
                </div>
            </div>
        </button>
    `;
}

function getCreateTaskDetailTemplate(task, assignedUsers, subtaskArray) {
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
                        ${assignedUsers.map((user) => `
                            <div class="user-chip">
                                <div class="user-avatar" style="background-color: ${user.backgroundColor}">${getInitials(user.name)}</div>
                                <span>${user.name}</span>
                            </div>
                        `,).join("")}
                    </div>
                </div>
                
                <div class="subtasks-section">
                    <h3 class="subtasks-title">Subtasks</h3>
                    <div class="subtasks-list">
                        ${subtaskArray.length > 0 ? subtaskArray.map((st) => `
                                <div class="subtask-item">
                                    <input type="checkbox" id="subtask-${st.id}" ${st.done ? "checked" : ""}>
                                    <label for="subtask-${st.id}">${st.title}</label>
                                </div>
                            `,).join("") : '<p class="no-subtasks">No subtasks</p>'
                        }
                    </div>
                </div>
            </div>
            
            <div class="dialog-footer">
                <button class="btn-delete" onclick="deleteTask('${task.id}')">
                    <img src="../assets/icons/delete.svg" alt="delete"> Delete
                </button>
                <div id="footerBetween"></div>
                <button class="btn-edit" onclick="openEditTask(${task.id})">
                    <img src="../assets/icons/edit.svg" alt="edit"> Edit
                </button>
            </div>
        </div>
    `;
}


function getTaskFormTemplate(task){
    return  `
<div id="form-container">
  <div id="add-task-title"><h1>Add Task</h1></div>
  <form id="addTaskForm" novalidate>
    <div id="form-body">
      <div id="leftSide">
        <label for="formTitle">Title<span class="red-star">*</span></label>
        <input type="text" id="formTitle" placeholder=""/><span>${task.title}</span>
        <div id="errorTitle" style="color: red"></div>
        <label for="description">Description</label>
        <textarea id="description" placeholder="${task.description}" value=""></textarea>
        <label for="duedate">Due date<span class="red-star">*</span></label>
        <input type="date" id="duedate"  placeholder="${task.duedate}"  />
        <div id="errorDate" style="color: red"></div>
      </div>
      <div id="rightSide">
        <span class="form-label">Priority</span>
        <div id="priority-buttons">
          <button type="button" class="priority-btn" id="urgent-btn" data-value="urgent">Urgent <img src="../assets/icons/urgent.svg" alt="" aria-hidden="true" /></button>
          <button type="button" class="priority-btn" id="medium-btn" data-value="medium">Medium <img src="../assets/icons/medium.svg" alt="" aria-hidden="true" /></button>
          <button type="button" class="priority-btn" id="low-btn" data-value="low">Low <img src="../assets/icons/low.svg" alt="" aria-hidden="true" /></button>
        </div>
        <label for="searchInput">Assigned to</label>
        <div class="custom-dropdown">
          <div class="dropdown-header-input-wrapper">
            <input type="text" id="searchInput" placeholder="Select contacts to assign" autocomplete="off" />
            <button type="button" id="dropdownToggle" class="dropdown-btn" aria-label="Benutzerliste anzeigen"><img src="../assets/icons/arrow-drop-down.svg" alt="Pfeil unten" class="dropdown-img" id="dropdownArrowImg" /></button>
          </div>
          <ul class="dropdown-list hidden" id="dropdownList"></ul>
        </div>
        <div id="assignedUsersContainer" class="assigned-users"></div>
        <ul class="assigned-users"></ul>
        <label for="categoryToggle">Category<span class="red-star">*</span></label>
        <div class="custom-dropdown">
          <div class="dropdown-header" id="categoryHeader">
            <span id="categorySelectedText">Select task category</span>
            <button type="button" id="categoryToggle" class="dropdown-btn" aria-label="Kategorie anzeigen"><img src="../assets/icons/arrow-drop-down.svg" alt="Pfeil unten" class="dropdown-img" id="categoryArrowImg" /></button>
          </div>
          <ul class="dropdown-list hidden" id="categoryList">
            <li class="user-item" data-value="Technical"><span >Technical</span></li>
            <li class="user-item" data-value="User Story"><span >User Story</span></li>
          </ul>
          <div id="errorCategory" style="color: red"></div>
        </div>
        <label for="subtaskInput">Subtasks</label>
        <div class="subtask-container">
          <input type="text" id="subtaskInput" placeholder="Add new Subtasks" />
          <button type="button" id="addSubtaskBtn"><img src="../assets/icons/darkcheck.svg" alt="Add Subtask" /></button>
          <button type="button" id="clearSubtaskBtn"><img src="../assets/icons/delete.svg" alt="Clear input" /></button>
        </div>
        <ul id="subTaskList"></ul>
      </div>
    </div>
    <div id="createTaskBtn-container">
      <span class="required-hint"><span class="red-star">*</span>This field is required</span>
      <div id="btn-container">
        <button type="reset" id="clear" onclick="closeEditTask()">Cancel <img src="../assets/icons/vector.svg" alt="" aria-hidden="true"  /></button>
        <button type="submit" id="createTask">Save Task <img src="../assets/icons/check.svg" alt="" aria-hidden="true" /></button>
      </div>
    </div>
  </form>
</div>
`;
}