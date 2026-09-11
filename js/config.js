"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKH7ztxWnzKNZgXM_uD3DjF1J2vpV_y5U",
  authDomain: "join-bd9bf.firebaseapp.com",
  databaseURL:
    "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "join-bd9bf",
  storageBucket: "join-bd9bf.firebasestorage.app",
  messagingSenderId: "910343030385",
  appId: "1:910343030385:web:fd1dd850214dae22de7dd0",
  measurementId: "G-BRT3FJ9248",
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
