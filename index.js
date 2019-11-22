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
    pink: "#9900cc"   // purple
};

const textColors = {
    blue: "#ffffff",     // white
    red: "#ffffff",     // white
    yellow: "#696463",  // dark grey
    orange: "#696463",  // dark grey
    purple: "#ffffff",     // white
    green: "#ffffff",     // white
    pink: "#696463"  // dark grey
};

const locationIconColors = {
    blue: "locationIconWhite.png",     // white
    red: "locationIconWhite.png",     // white
    yellow: "locationIconGrey.png",  // dark grey
    orange: "locationIconGrey",
    purple: "locationIconWhite.png",
    green: "locationIconWhite.png",
    pink: "locationIconGrey"
};

const githubIconColors = {
    blue: "githubIconWhite.png",     // white
    red: "githubIconWhite.png",     // white
    yellow: "githubIconGrey.png",  // dark grey
    orange: "githubIconGrey",
    purple: "githubIconWhite.png",
    green: "githubIconWhite.png",
    pink: "githubIconGrey"
};

const blogIconColors = {
    blue: "blogIconWhite.png",     // white
    red: "blogIconWhite.png",     // white
    yellow: "blogIconGrey.png",  // dark grey
    orange: "blogIconGrey",
    purple: "blogIconWhite.png",
    green: "blogIconWhite.png",
    pink: "blogIconGrey"
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
        const locationIcon = locationIconColors[favColor];
        const githubIcon = githubIconColors[favColor];
        const blogIcon = blogIconColors[favColor];
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
            let location = responseOwner.data.location;
            let bio = responseOwner.data.bio;
            let blogUrl = responseOwner.data.blog;
            const numRepos = responseOwner.data.public_repos;
            const followers = responseOwner.data.followers;
            const numFollowing = responseOwner.data.following;
            let company = responseOwner.data.company;

            // default text if no bio
            if ((bio === null) || (bio == "")) {
                bio = "No bio entered."
            };

            // default text if no company
            if ((company === null) || (company == "")) {
                company = "No company listed."
            }
            else {
                company = `Currently @ ${company}.`
            };

            // build url for google.maps
            let locationExists;
            if ((location === null) || (location == "")) {
                location = "No location listed.";
                locationExists = false;
            }
            else {
                locationExists = true;
                console.log(`location:  ${location}`);
            };

            // check for blog
            let blogExists = true;
            if ((blogUrl === null) || (blogUrl == "")) {
                blogUrl = "No blog found.";
                blogExists = false;
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

            // Download actual profile image, save to file called profile.jpg.  
            // It will be overwritten if it already exists
            async function stream(profileImageUrl) {
                console.log("stream started");
                try {
                    response = await request(profileImageUrl).pipe(fs.createWriteStream('profile.jpg'));
                    console.log("request initialed");
                } // end of try
                catch (err) {
                    console.log(err);
                } // end of catch

            };  // end of asynch block
            stream(profileImageUrl);

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
                    .rect(0, 557, 611, 234)
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

                // add profile picture with complimentary border color (maura.jpg works)
                doc.image('profile.jpg', 255, 20, { fit: [100, 100] })
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

                // link to location, if it exists w/ leading icon
                doc.moveDown();
                if (locationExists) {
                    // location icon first
                    doc.image(locationIcon, 205, 205, { 
                        fit: [8, 8],    // same as fonstSize
                        continue: true  // don't go to next line
                    });  // end of icon block
                    // then location text and link
                    doc.save()
                        .fontSize(8)
                        .link(205, 205, 40, 8, `https://www.google.com/maps/place/${location.replace(/ /g, '+')}`)
                        .text(location, 215, 205, {
                            width: 201,
                            align: "left",
                            continue: true
                        });
                }
                // no location found - print text saying so
                else {
                    doc.save()
                        .fontSize(8)
                        .text(location, 215, 205, {
                            align: "left",
                            width: 201,
                            continue: true
                        });
                };

                // link to github profile with icon
                // github icon first
                doc.image(githubIcon, 290, 205, { 
                    fit: [8, 8],    // same as fontSize
                    continue: true  // don't go to next line yet
                });  // end of icon block
                doc.save()
                    .link(290, 205, 40, 8, githubProfileUrl)  // link starts where icon is & goes for 20
                    .text("GitHub", 300, 205, {
                        align: "left",
                        width: 30,
                        link: githubProfileUrl,
                        continue: true    // don't go to next line yet
                });

                // link to blog
                if (blogExists) {
                    // blog icon first
                    doc.image(blogIcon, 376, 205, { 
                        fit: [8, 8],    // same as fonstSize
                        //width: 8,
                        //align: "right",
                        continue: true  // don't go to next line yet
                    });  // end of icon block
                    doc.save()
                        .link(366, 205, 40, 8)
                        .text("Blog", 366, 205, {
                            align: "right",
                            width: 40,
                            link: blogUrl
                        });
                }
                else {
                    doc.save()
                        .text(blogUrl, 215, 205, {
                            align: "right",
                            width: 181
                        });

                };


                // bio
                doc.moveDown(2);
                doc.save()
                    .fontSize(15)
                    .fillAndStroke(textColor)
                    .text(bio, 35, 240, {
                        align: "center",
                        height: 180,
                        width: 541,
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
        //    console.log(`Profile image URL:  ${profileImageUrl}`);
        //       });
        //  if (response.confirm === response.password) {
        //    console.log("Success!");
        //  }
        //  else {
        //    console.log("You forgot your password already?!");
        //  }

    });
