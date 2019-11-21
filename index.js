// axios is used for api queries
const axios = require("axios");
// inquirer is used to prompt the user for the Github username and favorite color
const inquirer = require('inquirer');

// ask the user for the Github username and color
inquirer
    .prompt([
        {
            type: "input",
            name: "username",
            message: "What is the Github username of the person whose profile you would like?"
        },
        {
            type: 'list',
            name: 'favColor',
            message: 'Click on your favorite color.',
            choices: ['blue', 'green', 'red', 'purple', 'yellow', 'pink', 'orange'],
            filter: function (val) {
                return val.toLowerCase();
            }
        }
    ])
    .then((promptResponses) => {
        // get username & color from response
        const { username, favColor } = promptResponses;

        //  can now query Github...for user's profile information   
        // query Github for 
        const queryUrlOwner = `https://api.github.com/users/${username}`;

        axios.get(queryUrlOwner).then(function (responseOwner) {

            //get information needed
            // profile profile link, profile image link, location, bio, blog link, # repositories
            //   console.log("responseOwner(.data)");
            // console.log(responseOwner.data);

            const githubProfileUrl = responseOwner.data.html_url;
            const profileImageUrl = responseOwner.data.avatar_url;
            const location = responseOwner.data.location;
            const bio = responseOwner.data.bio;
            const blogUrl = responseOwner.data.blog;
            const numRepos = responseOwner.data.public_repos;


            console.log("Profile:  " + githubProfileUrl);
            console.log("Image:  " + profileImageUrl);
            console.log("location:  " + location);
            console.log("bio: " + bio);
            console.log("blog:  " + blogUrl);
            console.log("# repos:  " + numRepos);
            console.log("starred: ");



            // query Github for user's repositories
            const queryUrlRepositories = `https://api.github.com/users/${username}/repos?per_page=100`;

            axios.get(queryUrlRepositories).then(function (responseRepositories) {
                // console.log(responseRepositories.data);   // ALL the results!!

                // Get star counts
                count = 0;
                const repositoryStars = responseRepositories.data.map(function (repository) {
                    console.log("responseRepositories.stargazers_count:" + repository.stargazers_count);  // this happens once for each repository
                    // console.log(repo.name);
                    count += repository.stargazers_count;
                    console.log("count: " + count);
                    console.log(" ");
                    return repository.stargazers_count;
                });

              //  console.log("repo names:  " + repositoryNames);
                //console.log("First repo name:  " + repositoryNames[0]);




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

    });