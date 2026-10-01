'use strict';

const hour = new Date().getHours();
let putText = document.getElementById('greeting-text');
let greeting;

if (hour < 12) {
    greeting = "Good Morning";
} else if (hour < 18) {
    greeting = "Good Afternoon";
} else {
    greeting = "Good Evening";
}

putText.innerHTML=greeting+",";