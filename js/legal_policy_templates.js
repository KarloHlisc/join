"use strict";

/** HTML markup for the policy template, injected into main-container. */
const policyTemplate = `<h1>Privacy Policy</h1>
      <h3>Responsible parties</h3>
      <p>Sandro Spirig, Gartenstrasse 3, 8000 Zürich, and Karlo H, PilgStr 5, 8133 Munich. Contact: sandro.spirig@example.com</p>
      <h3>Which data we store</h3>
      <p>When you sign up we store your name, email address and password. For contacts we store name, email address and phone number. Tasks (title, description, due date, priority, category, assigned contacts, subtasks) are stored as well.</p>
      <h3>Where data is stored</h3>
      <p>All data is stored in a Google Firebase Realtime Database (region asia-southeast1). The Firebase SDK is loaded from Google servers (gstatic.com), so your IP address is transmitted to Google when you open Join.</p>
      <h3>Browser storage</h3>
      <p>After login your user data is kept in the session storage of your browser until you log out or close the tab.</p>
      <h3>Purpose and your rights</h3>
      <p>Join is an educational project. You can request information about, correction of, or deletion of your data at any time by email.</p>`;

/**
 * Returns the shared privacy policy markup used on all privacy policy pages.
 * @returns {string} HTML markup for the privacy policy.
 */
export function getPolicyTemplate() {
  return policyTemplate;
}

/** HTML markup for the legal template, injected into main-container. */
const legalTemplate = ` <h1>Legal Notice</h1>
      <h4>Adresse</h4>
      <ul>
        <li>Sandro Spirig</li>
        <li>Gartenstrasse 3</li>
        <li>8000 Zürich</li>
      </ul>
      <ul>
        <li>Karlo H</li>
        <li>PilgStr 5</li>
        <li>8133 Munich</li>
      </ul>
      <h4>Contacts</h4>
      <p>Email: sandro.spirig@example.com</p>
      <p>Email: karlo.h@example.com</p>
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
        sandro.spirig@example.com. Date: October 20, 2026
      </p>`;

/**
 * Returns the shared legal notice markup used on all legal notice pages.
 * @returns {string} HTML markup for the legal notice.
 */
export function getLegalTemplate() {
  return legalTemplate;
}
