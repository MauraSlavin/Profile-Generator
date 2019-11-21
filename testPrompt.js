const prompt = require('./prompt.js');
// axios is used for api queries
const axios = require("axios");

let username = 'Dahamilton10';  // David is the default
let color = 'pink';  // pink is the default

// ask the user for the Github username and color
let promptResponses = prompt.ask();
console.log("promptResponses:  ");
console.log(promptResponses);
username = promptResponses.name;
color = promptResponses.color;
console.log("User:  " + username + ".  Color:  " + color + ".");