"use strict";

function getNavigationHtmlBeforeLogin() {
  return `        
          <button onclick="location.href = '../index.html'"><img src="../assets/icons/login.png" alt="join summary" /> Log in</button>`;
}

function getLayoutHtmlBeforeLogin() {
  return `
    <aside class="side-bar-wrapper">
        <div class="aside-logo"><img src="../assets/img/join_white.svg" alt="Logo" /></div>
        <div class="aside-menu">${getNavigationHtmlBeforeLogin()}</div>
        <div class="aside-footer"><button id="nav-policy_login" onclick="location.href='./policy_login.html'">Privacy Policy</button><button id="nav-legal_login" onclick="location.href='./legal_login.html'">Legal notice</button></div>
    </aside>
    <header><p>Kanban Project Management Tool</p>`;
}

function setActivePage() {
  const page = window.location.pathname.split("/").pop().replace(".html", "");
  document.getElementById(`nav-${page}`)?.classList.add("active-site");
}

function initLayout() {
  document.body.insertAdjacentHTML("afterbegin", getLayoutHtmlBeforeLogin());
  const page = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "")
    .replaceAll("_", "")
    .toLowerCase();
  const whichTemplate = `get${page}Template`;
  if (typeof window[whichTemplate] === "function") {
    document.getElementById(`main-${page}`).innerHTML = window[whichTemplate]();
  } else {
    console.error(`Die Funktion ${whichTemplate} wurde nicht gefunden!`);
  }

  setActivePage();
}

document.addEventListener("DOMContentLoaded", initLayout);

const policyTemplate = `     <h1>Pivacy Policy</h1>
      <h3>Subtitle</h3>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem
        quidem neque nesciunt, esse ullam reiciendis sapiente fugit magnam
        molestiae nihil eum rem harum numquam maiores aspernatur corporis
        quisquam, animi necessitatibus!
      </p>
      <h3>Subtitle</h3>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quo, rerum hic
        excepturi velit fugit deserunt rem laboriosam provident asperiores quasi
        beatae ab, ratione architecto autem accusantium ut ea qui quaerat.
      </p>`;

function getpolicyloginTemplate() {
  return policyTemplate;
}

const legalTemplate = ` <h1>Legal Notice</h1>
      <h4>Subtitle</h4>
      <ul>
        <li>[Student Names List]</li>
        <li>[Address of the JOIN operator - e.g. one of the students]</li>
        <li>[Postcode and city]</li>
      </ul>
      <h4>Exploring the Board</h4>
      <p>Email: [Email]</p>
      <h4>Acceptance of terms</h4>
      <p>
        By accessing and using Join (Product), you acknowledge and agree to the
        following terms and conditions, and any policies, guidelines, or
        amendments thereto that may be presented to you from time to time. We,
        the listed students, may update or change the terms and conditions from
        time to time without notice.
      </p>
      <h4>Scope and ownership of the product</h4>
      <p>
        Join has been developed as part of a student group project in a web
        development bootcamp at the Developer Akademie GmbH. It has an
        educational purpose and is not intended for extensive personal &
        business usage. As such, we cannot guarantee consistent availability,
        reliability, accuracy, or any other aspect of quality regarding this
        Product. The design of Join is owned by the Developer Akademie GmbH.
        Unauthorized use, reproduction, modification, distribution, or
        replication of the design is strictly prohibited.
      </p>
      <h4>Proprietary rights</h4>
      <p>
        Aside from the design owned by Developer Akademie GmbH, we, the listed
        students, retain all proprietary rights in Join, including any
        associated copyrighted material, trademarks, and other proprietary
        information.
      </p>
      <h4>Use of the product</h4>
      <p>
        Join is intended to be used for lawful purposes only, in accordance with
        all applicable laws and regulations. Any use of Join for illegal
        activities, or to harass, harm, threaten, or intimidate another person,
        is strictly prohibited. You are solely responsible for your interactions
        with other users of Join.
      </p>
      <h4>Disclaimer of warranties and limitation of liability</h4>
      <p>
        Join is provided "as is" without warranty of any kind, whether express
        or implied, including but not limited to the implied warranties of
        merchantability, fitness for a particular purpose, and non-infringement.
        In no event will we, the listed students, or the Developer Akademie, be
        liable for any direct, indirect, incidental, special, consequential or
        exemplary damages, including but not limited to, damages for loss of
        profits, goodwill, use, data, or other intangible losses, even if we
        have been advised of the possibility of such damages, arising out of or
        in connection with the use or performance of Join.
      </p>
      <h4>Indemnity</h4>
      <p>
        You agree to indemnify, defend and hold harmless us, the listed
        students, the Developer Akademie, and our affiliates, partners,
        officers, directors, agents, and employees, from and against any claim,
        demand, loss, damage, cost, or liability (including reasonable legal
        fees) arising out of or relating to your use of Join and/or your breach
        of this Legal Notice. For any questions or notices, please contact us at
        [Contact Email]. Date: July 26, 2023
      </p>`;

function getlegalloginTemplate() {
  return legalTemplate;
}
