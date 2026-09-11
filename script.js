"use strict";

import { database } from "./js/config.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("errorMessage");
  errEl.textContent = "";
  try {
    const snap = await get(child(ref(database), "users"));
    const users = snap.exists() ? snap.val() : {};
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value;
    const user = Object.values(users).find(
      (u) => u.email === email && u.password === pass,
    );
    if (!user) throw new Error("Account not found.");
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "./html/summary.html";
  } catch (err) {
    errEl.textContent = err.message;
  }
});
