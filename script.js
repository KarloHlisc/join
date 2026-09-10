"use strict";
const baseUrl =
  "https://join-bd9bf-default-rtdb.asia-southeast1.firebasedatabase.app/";

function init() {
  getData();
  setupPasswordToggle();
}

async function getData() {
  try {
    const response = await fetch(`{baseUrl}data.json`);
    const data = await response.json();
  } catch (error) {
    console.error("Error fetchinng data:", error);
  }
}
