// inquirer is used to prompt the user for the Github username and favorite color
const inquirer = require('inquirer');
// axios is used for api queries
const axios = require("axios");



// ask the user for the Github username and color
inquirer
    .prompt([
        {
            type: "input",
            message: "What is the Github username of the person whose profile you would like?",
            name: "username"
        },
        {
            type: 'list',
            name: 'color',
            message: 'Click on your favorite color.',
            choices: ['blue', 'green', 'red', 'purple', 'yellow', 'pink', 'orange'],
            filter: function(val) {
                return val.toLowerCase();
            }
        }
    ])
    .then((promptResponse) => {
        //  can now get repositories from Github        
        //      console.log(`Username entered: ${response.username}`);
        //    console.log(`Color entered: ${response.color}`);
        const queryUrlRepositories = `https://api.github.com/users/${promptResponse.username}/repos?per_page=100`;

        axios.get(queryUrlRepositories).then(function (responseRepositories) {
            // console.log(response.data);   // ALL the results!!

            // Get all the repository names
            const repositoryNames = responseRepositories.data.map(function (repository) {
                // console.log("Repo.name:");  // this happens once for each repository
                // console.log(repo.name);
                return repository.name;
            });

            


            console.log("repo names:  " + repositoryNames);
            console.log("First repo name:  " + repositoryNames[0]);

            let profileImageURL = responseRepositories.data[0].owner.avatar_url;


            //        console.log(`Saved ${repoNames.length} repos`);
        });
        //  console.log(`First repo:  ${repoNames[0]}`);
        //  console.log(`First repo data:`);
        //  console.log(res.data[0]);
        //  console.log("First repo owner:");
        //  console.log(res.data[0].owner);
        //    console.log(`Profile image URL:  ${profileImageURL}`);
        //       });
        //  if (response.confirm === response.password) {
        //    console.log("Success!");
        //  }
        //  else {
        //    console.log("You forgot your password already?!");
        //  }


    });




