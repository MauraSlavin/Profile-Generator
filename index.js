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

const borderColors = {
    blue: "#000080",  // dark blue
    red: "#660000",   // dark red
    yellow: "#b32400",  // dark orange
    orange: "#b32400",  // dark orange
    purple: "#ff00ff",  // hot pink
    green: "#ffff00",   // yellow
    pink: "#ff00ff"   // hot pink
};

const textColors = {
    blue: "#ffffff",     // white
    red: "#ffffff",     // white
    yellow: "#333333",  // dark grey
    orange: "#333333",
    purple: "#ffffff",
    green: "#ffffff",
    pink: "#333333"
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
            choices: ['blue', 'green', 'pink', 'purple', 'red', 'orange', 'yellow'],
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
        const borderColor = borderColors[favColor];
        const textColor = textColors[favColor];
        console.log("color: " + mainColor + ". Comp color:  " + backgroundColor);
        console.log("border: " + borderColor + ". Text color:  " + textColor);

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

            const name = responseOwner.data.name;
            const githubProfileUrl = responseOwner.data.html_url;
            const profileImageUrl = responseOwner.data.avatar_url;
            const location = responseOwner.data.location;
            const bio = responseOwner.data.bio;
            const blogUrl = responseOwner.data.blog;
            const numRepos = responseOwner.data.public_repos;
            const followers = responseOwner.data.followers;
            const numFollowing = responseOwner.data.following;
            let company = responseOwner.data.company;
            if (company === null) {
                company = "No company listed."
            }
            else {
                company = `Currently @ ${company}.`
            };


            console.log("Name:  " + name);
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

                // draw the background rectangles in complimentary color
                doc.save()
                    .rect(0, 0, 611, 254)
                    .fill(backgroundColor);

                doc.save()
                    .rect(0, 507, 611, 254)
                    .fill(backgroundColor);

                // draw primary rectangle in preferred color
                doc.save()
                    .roundedRect(15, 45, 581, 225, 45)
                    .fill(mainColor);

                // add profile picture with complimentary border color
                doc.image('maura.jpg', 255, 20, { fit: [100, 100] })
                    .rect(255, 20, 100, 100)
                    .lineWidth(3)
                    .stroke(borderColor);


                doc.moveDown(4);
                // add "Hi!"
                doc.save()
                    .font("Helvetica-Bold", textColor, 25)
                    .fillAndStroke(textColor)
                    .text("Hi!", {
                        align: "center"
                    });

                // and introduction
                doc.save()
                    .fontSize(20)
                    .text(`My name is ${name}!`, {
                        align: "center"
                    });

                // where
                doc.save()
                    .fontSize(10)
                    .text(company, {
                        align: "center"
                    });

                doc.moveDown();






                console.log("got here, too");
                console.log("textColor:  " + textColor);
                doc.moveDown();














                // Finalize PDF file
                doc.end();

                // open the PDF


                //              doc.output( function(pdf) {
                //                res.type('application/pdf');
                //              res.end(pdf, 'binary');
                //        });
                //      app.get('profile.pdf', function (req, res) {
                //        var doc = new Pdf();
                //    doc.text("Hello World", 50, 50);

                //      doc.output( function(pdf) {
                //        res.type('application/pdf');
                //      res.end(pdf, 'binary');
                //});
                //              });
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