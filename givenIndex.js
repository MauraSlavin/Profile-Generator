var inquirer = require("inquirer");

//const questions = [
//    "What is your favorite color?",
//    "What is your Github username?"
//  
//];

//function writeToFile(fileName, data) {

//};

//function init() { };

//init();

// let color = prompt("What is your Github username?");
inquirer
    .prompt([
        {
            type: "input",
            message: "What is your Github username?",
            name: "username"
        },
        {
            type: 'list',
            name: 'color',
            message: 'What is your favorite color?',
            choices: ['blue', 'green', 'red', 'purple', 'yellow', 'pink', 'orange'],
            filter: function (val) {
                return val.toLowerCase();
            }
        }
    ])
    .then(answers => {
        console.log(JSON.stringify(answers, null, '  '));
    });

