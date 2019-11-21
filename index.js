// axios is used for api queries
const axios = require("axios");
// inquirer is used to prompt the user for the Github username and favorite color
const inquirer = require('inquirer');
// pdfkit is used to create the PDF file
const PDFDocument = require('pdfkit');
// fs is used for writing to files when creating the PDF
const fs = require('fs');
// to get image from github profile image url
const request = require('request');

const complimentaryColors = {
    blue: "#ffff99",   // pale yellow with blue
    red: "#ffff99",   // pale yellow with red
    yellow: "#ff6600",   // orange with yellow
    orange: "#ffff00",   // yellow with orange
    purple: "#ffb3ff",   // pink with purple
    green: "#b3ffcc",    // light green with green
    pink: "#ffccff"    // light pink with pink
};

const colors = {
    blue: "#0066ff",
    red: "#ff0000",
    yellow: "#ffff00",
    orange: "#ff6600",
    purple: "#9900cc",
    green: "#009933",
    pink: "#ff00ff"
};


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
        const backgroundColor = complimentaryColors[favColor];
        const mainColor = colors[favColor];
        console.log("color: " + mainColor + ". Comp color:  " + backgroundColor);

        //        var x = {'test': 'hi'};
        // alert(x.test); // // alerts hi
        // alert(x['test']); // alerts hi

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
            const followers = responseOwner.data.followers;
            const numFollowing = responseOwner.data.following;



            console.log("Profile:  " + githubProfileUrl);
            console.log("Image:  " + profileImageUrl);
            console.log("location:  " + location);
            console.log("bio: " + bio);
            console.log("blog:  " + blogUrl);
            console.log("# repos:  " + numRepos);
            console.log("followers: " + followers);
            console.log("num following: " + numFollowing);



            // query Github for user's repositories
            const queryUrlRepositories = `https://api.github.com/users/${username}/repos?per_page=100`;

            axios.get(queryUrlRepositories).then(function (responseRepositories) {
                // console.log(responseRepositories.data);   // ALL the results!!

                // Get star counts
                count = 0;
                const repositoryStars = responseRepositories.data.map(function (repository) {
                    //     console.log("responseRepositories.stargazers_count:" + repository.stargazers_count);  // this happens once for each repository
                    // console.log(repo.name);
                    count += repository.stargazers_count;
                    //  console.log("count: " + count);
                    //   console.log(" ");
                    return repository.stargazers_count;
                });


                //               const getProfileImage = function () {
                //                 request(profileImageUrl).pipe(fs.createWriteStream('profile.png'));
                //           }
                //         getProfileImage();



                //              var stream = function(){
                //                request(profileImageUrl).pipe(fs.createWriteStream('test1.png'));
                //          }
                //    stream();
                console.log(profileImageUrl);

                // save image file from url to put in PDF later
                //           let fileStream = fs.createWriteStream('profile.png');
                //         request(profileImageUrl).pipe(fileStream);


                // try .... catch:  executes try. if error happens, executes catch.
                async function getProfileImage(url) {
                    try {
                        let fileStream = fs.createWriteStream('profile.png');
                        request(profileImageUrl).pipe(fileStream);  // end of const movie assignment / getMovie function


                        console.log("Got here");

                    }   // end of try block
                    catch (err) {
                        console.log(err);
                    }  // end of catch block
                }; // end of async block

                getProfileImage(profileImageUrl);










                //              request(profileImageUrl, function (err, res, profileImage) {

                //               let userinfo = {
                //                 name: username,
                //               imageURL: profileImageUrl,
                //             locationUrl: "https://www.google.maps",
                //           githubProfileUrl: githubProfileUrl,
                //         blogUrl: blogUrl,
                //       bio: bio,
                //     numRepos: numRepos,
                //   followers: followers,
                // numStars: repositoryStars,
                //numFollowing: numFollowing
                // }

                // create the PDF file

                const doc = new PDFDocument;

                // Pipe its output somewhere, like to a file or HTTP response
                // See below for browser usage
                doc.pipe(fs.createWriteStream('profile.pdf'));
                // doc.lineWidth(25);
                // draw the background rectangles
                doc.save()
                    .rect(0, 0, 610, 261)
                    .fill(backgroundColor);

                doc.save()
                    .rect(0, 539, 610, 261)
                    .fill(backgroundColor);

                doc.save()
                    .roundedRect(15, 45, 580, 255, 45)
                    .fill(mainColor);

               // doc.save()
                 //   .circle(305, 75, 55)
                   // .lineWidth(5);
                //  .fillOpacity(0.6)
                // .fill("./maura.jpg");

                //         doc.image("maura.jpg", 250, 20, { width: 100 });
                doc.image('maura.jpg', 250, 20, { fit: [100, 100] })
                    .rect(250, 20, 100, 100)
                    .lineWidth(5)
                 
                    .stroke('yellow');











                // Finalize PDF file
                doc.end();

            });
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