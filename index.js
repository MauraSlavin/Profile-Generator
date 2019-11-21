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
            let bio = responseOwner.data.bio;
            const blogUrl = responseOwner.data.blog;
            const numRepos = responseOwner.data.public_repos;
            const followers = responseOwner.data.followers;
            const numFollowing = responseOwner.data.following;
            let company = responseOwner.data.company;
            if (bio === null) {
                bio = "No bio entered."
            };
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
                    .rect(0, 0, 611, 204)
                    .fill(backgroundColor);

                doc.save()
                    .rect(0, 557, 611, 204)
                    .fill(backgroundColor);

                // draw primary rectangle in preferred color
                doc.save()
                    .roundedRect(15, 45, 581, 175, 60)
                    .fill(mainColor);


                // draw boxes for stats
                doc.save()
                    .roundedRect(35, 320, 260, 70, 60)   // for repositories
                    .fill(mainColor);

                doc.save()
                    .roundedRect(315, 320, 260, 70, 60)    // for followers
                    .fill(mainColor);

                doc.save()
                    .roundedRect(35, 410, 260, 70, 60)    //for stars
                    .fill(mainColor);

                doc.save()
                    .roundedRect(315, 410, 260, 70, 60)   // for following
                    .fill(mainColor);

                // add profile picture with complimentary border color
                doc.image('maura.jpg', 255, 20, { fit: [100, 100] })
                    .rect(255, 20, 100, 100)
                    .lineWidth(3)
                    .stroke(borderColor);


                    // add "Hi!"
                doc.moveDown(4);
                doc.save()
                    .font("Helvetica-Bold", textColor, 25)
                    .fillAndStroke(textColor)
                    .text("Hi!", {
                        align: "center"
                    });

                // and introduction w/name
                doc.save()
                    .fontSize(20)
                    .text(`My name is ${name}!`, {
                        align: "center"
                    });

                // company
                doc.save()
                    .fontSize(10)
                    .text(company, {
                        align: "center"
                    });

                    // space for links to google maps, github profile & blog
                doc.moveDown();
                doc.save()
                    .fontSize(8)
                    .text("location   GitHub   Blog", {
                        align: "center"
                    });

                    // bio
                doc.moveDown(2);
                doc.save()
                    .fontSize(15)
                    .fillAndStroke("black")
                    .text(bio, {
                        align: "center"
                    });

                    // text for repositories & followers
                    doc.moveDown();
                    doc.save()
                    .fontSize(15)
                    .fillAndStroke(textColor)
                    .text("Public Repositories", 35, 340, {
                        width: 260,
                        height: 15,
                        align: "center"
                    });
                    
                    doc.save()
                    .text("Followers", 315, 340, {
                        width: 260,
                        height: 15,
                        align: "center"
                    });
                    
                    // data for repositories & followers
                    doc.save()
                    .text(numRepos, 35, 365, {
                        width: 260,
                        height: 10,
                        align: "center"
                    });

                    doc.save()
                    .text(followers, 315, 365, {
                        width: 260,
                        height: 10,
                        align: "center"
                    });
                    
                    // text for stars & following
                    doc.moveDown();
                    doc.save()
                    .fontSize(15)
                    .fillAndStroke(textColor)
                    .text("GitHub Stars", 35, 430, {
                        width: 260,
                        height: 15,
                        align: "center"
                    });
                    
                    doc.save()
                    .text("Following", 315, 430, {
                        width: 260,
                        height: 15,
                        align: "center"
                    });
                    
                    // data for stars & following
                    doc.save()
                    .text(count, 35, 455, {
                        width: 260,
                        height: 10,
                        align: "center"
                    });

                    doc.save()
                    .text(numFollowing, 315, 455, {
                        width: 260,
                        height: 10,
                        align: "center"
                    });




















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
