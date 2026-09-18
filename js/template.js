"use strict";

let currentPage = "main-container";

function getNavigationHtml() {
  return `
        <button id="nav-summary" onclick="location.href='./summary.html'"><img src="../assets/icons/summary.png"> Summary</button>
        <button id="nav-add_task" onclick="location.href='./add_task.html'"><img src="../assets/icons/add_task.png"> Add Task</button>
        <button id="nav-board" onclick="location.href='./board.html'"><img src="../assets/icons/board.png"> Board</button>
        <button id="nav-contacts" onclick="location.href='./contacts.html'"><img src="../assets/icons/contacts.png"> Contacts</button>
    `;
}

function getLayoutHtml() {
  return `
    <aside class="side-bar-wrapper">
        <div class="aside-logo"><img src="../assets/img/join_white.svg" alt="Logo" /></div>
        <div class="aside-menu">${getNavigationHtml()}</div>
        <div class="aside-footer"><button id="nav-policy_after_login" onclick="location.href='./policy_after_login.html'">Privacy Policy</button><button id="nav-legal_after_login" onclick="location.href='./legal_after_login.html'">Legal notice</button></div>
    </aside>
    <header><p>Kanban Project Management Tool</p><div class="user-and-help"><button id="help-btn" class="help" onclick="openHelpPage()"><img src="../assets/icons/help.png" alt="help-icon" /></button><button class="user-icon"></button></div>
    </header>`;
}

function setActivePage() {
  const page = window.location.pathname.split("/").pop().replace(".html", "");
  document.getElementById(`nav-${page}`)?.classList.add("active-site");
}

function initLayout() {
  document.body.insertAdjacentHTML("afterbegin", getLayoutHtml());
  setActivePage();
}

document.addEventListener("DOMContentLoaded", initLayout);

const helpTemplateTxT = `
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

function helpTemplate() {
  return helpTemplateTxT;
}

function openHelpPage() {
  document.getElementById(currentPage).style.display = "none";
  document.getElementById("help-container").innerHTML = helpTemplate();
  document.getElementById("help-btn").style.display = "none";
}

function closeHelpPage() {
  document.getElementById("help-container").innerHTML = "";
  document.getElementById(currentPage).style.display = "block";
  document.getElementById("help-btn").style.display = "inline-block";
}
