"use strict";

export function getNavigationHtml() {
  return `
        <button id="nav-summary" onclick="location.href='./summary.html'"><img src="../assets/icons/summary.png"> Summary</button>
        <button id="nav-add_task" onclick="location.href='./add_task.html'"><img src="../assets/icons/add_task.png"> Add Task</button>
        <button id="nav-board" onclick="location.href='./board.html'"><img src="../assets/icons/board.png"> Board</button>
        <button id="nav-contacts" onclick="location.href='./contacts.html'"><img src="../assets/icons/contacts.png"> Contacts</button>
    `;
}

export function getLogoutModule() {
  return `
    <div id="logout-overlay" class="logout-overlay" onclick="closeLogoutModule()"></div>
    <div id="logout-module">
        <button id="help-btn" class="help help-logout" onclick="openHelpPage()">Help</button>
        <button id="nav-legal_after_login" onclick="location.href='./legal_after_login.html'">Legal notice</button>
        <button id="nav-policy_after_login" onclick="location.href='./policy_after_login.html'">Privacy Policy</button>
        <button id="logout" onclick="logoutFromAccount()">Logout</button>
    </div>
    `;
}

export function getLayoutHtml() {
  return `
    <aside class="side-bar-wrapper">
        <div class="aside-logo"><img src="../assets/img/join_white.svg" alt="Logo" /></div>
        <div class="aside-menu">${getNavigationHtml()}</div>
        <div class="aside-footer"><button id="nav-policy_after_login" onclick="location.href='./policy_after_login.html'">Privacy Policy</button><button id="nav-legal_after_login" onclick="location.href='./legal_after_login.html'">Legal notice</button></div>
    </aside>
    <header><p>Kanban Project Management Tool</p><div class="user-and-help"><button id="help-btn" class="help" onclick="openHelpPage()"><img src="../assets/icons/help.png" alt="help-icon" /></button><button class="user-icon header-icon" onclick="showLogoutModule()"></button></div><div id="logout-container"></div>
    </header>`;
}

export const helpTemplateTxT = `
          <div class="help-header">
        <h1>Help</h1>
        <button class="btn-back-to-main" onclick="closeHelpPage()">
          <img src="../assets/icons/arrow-left-line.png" alt="arrow-btn" />
        </button>
      </div>
      <div class="help-main">
        <p>Welcome to the help page for Join, your guide to using our kanban project management tool. Here, we'll provide an overview of what Joinis,how it can benefit you, and how to use it.
        </p>
        <h2>What is Join?</h2>
        <p>Join is a kanban-based project management tool designed and built by a group of dedicated students as part of their web development bootcamp at the Developer Akademie.</br></br> Kanban, a Japanese term meaning "billboard", is a highly effective method to visualize work, limit
          work-in-progress, and maximize efficiency (or flow). Join leverages
          the principles of kanban to help users manage their tasks and projects
          in an intuitive, visual interface.</br></br>It is important to note that Join
          is designed as an educational exercise and is not intended for
          extensive business usage. While we strive to ensure the best possible
          user experience, we cannot guarantee consistent availability,
          reliability, accuracy, or other aspects of quality regarding Join.
        </p>
        <h2>How to use it</h2>
        <p>Here is a step-by-step guide on how to use Join:</p>
        <ol>
          <li><h3>Exploring the Board</h3>
          <p>When you log in to Join, you'll find a default board. This board represents your project and contains four default lists: "To Do", "In Progress", “Await feedback” and "Done".</p></li>
          <li><h3>Creating Contacts</h3>
          <p>In Join, you can add contacts to collaborate on your projects. Go to the "Contacts" section, click on "New contact", and fill in the required information. Once added, these contacts can be assigned tasks and they can interact with the tasks on the board.</p></li>
          <li><h3>Adding Cards</h3>
          <p>Now that you've added your contacts, you can start adding cards. Cards represent individual tasks. Click the "+" button under the appropriate list to create a new card. Fill in the task details in the card, like task name, description, due date, assignees, etc.</p></li>
          <li><h3>Moving Cards</h3>
          <p>As the task moves from one stage to another, you can reflect that on the board by dragging and dropping the card from one list to another.</p></li>
          <li><h3>Deleting Cards</h3>
          <p>Once a task is completed, you can either move it to the "Done" list or delete it. Deleting a card will permanently remove it from the board. Please exercise caution when deleting cards, as this action is irreversible.Remember that using Join effectively requires consistent updates from you and your team to ensure the board reflects the current state of your project.Have more questions about Join? Feel free to contact us at [Your Contact Email]. We're here to help you!
</p></li>
        </ol>
      </div>`;

export function helpTemplate() {
  return helpTemplateTxT;
}

export function userDetailTemplate(user, initials) {
  return `<div id="details-header"><h1>Contacts</h1><span>Better with a team</span></div>
        <div id="icon-name-and-details">
          <div id="details-icon" class="user-icon" style="background-color: ${user.backgroundColor || "#000"}">${initials}</div>
          <div id="name-and-button">
            <span>${user.name}</span>
            <div id="edit-delete"><button id="edit" onclick="showEditContactModule('${user.userId}')"><img src="../assets/icons/edit.svg" alt="edit-btn" />Edit</button><button id="delete" onclick="deleteUser('${user.userId}')"><img src="../assets/icons/delete.svg" alt="delete-btn" />Delete</button></div>
          </div>
        </div>
        <span id="contact-info">Contact information</span>
        <div id="details"><span ><strong>Email</strong></span><span class="user-email">${user.email}</span><span><strong>Phone</strong></span><span>${user.phone}</span></div>`;
}

export function getAddContactModule() {
  return `<div id="add-overlay" onclick="closeAddContactModule()"><div id="add-module" onclick="event.stopPropagation()"> <div id="add-contact-text">
          <img src="../assets/img/join_white.svg" alt="join-logo" /><h1>Add contact</h1><span>Tasks are better with a team!</span></div> 
          <div id="add-contact"><button id="close-contact-module" onclick="closeAddContactModule()"><img src="../assets/icons/vector.svg" alt="x-logo" /></button><div id="person-icon"><img src="../assets/icons/person.svg" alt="person-logo"/></div>
          <div id="form-container"><form id="add-contact-form"><input type="text" placeholder="Name" id="name" required /><input type="text" placeholder="Email" id="email" required /><input type="text" placeholder="Phone" id="phone" required /><div id="errorMessage" style="color: red"></div>
            <div class="button-container">
              <button id="cancel-contact-module" onclick="closeAddContactModule()">Cancel <img src="../assets/icons/vector.svg" alt="x-logo" /></button>
              <button type="submit" id="create-contact">Create contact <img src="../assets/icons/check.svg" alt="check-logo"/></button>
            </div>
          </form></div></div></div></div></div>`;
}

export function getEditContactModule(user, initials) {
  return `<div id="add-overlay" onclick="closeAddContactModule()"><div id="add-module" onclick="event.stopPropagation()"> <div id="add-contact-text">
          <img src="../assets/img/join_white.svg" alt="join-logo" /><h1 class="edit-title">Edit contact</h1></div> 
          <div id="add-contact"><button id="close-contact-module" onclick="closeAddContactModule()"><img src="../assets/icons/vector.svg" alt="x-logo" /></button><div id="details-icon" class="user-icon" style="background-color: ${user.backgroundColor || "#000"}">${initials}</div>
          <div id="form-container"><form id="add-contact-form"><input type="text" value="${user.name}" id="name" required /><input type="text" value="${user.email}" id="email" required /><input type="text" value="${user.phone}" id="phone" required /><div id="errorMessage" style="color: red"></div>
            <div class="button-container">
              <button id="delete" class="edit-delete"onclick="deleteUser('${user.userId}')">Delete</button>
              <button type="submit" id="edit-contact">Save <img src="../assets/icons/check.svg" alt="check-logo"/></button>
            </div>
          </form></div></div></div></div></div>`;
}
