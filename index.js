// axios is used for api queries
const axios = require("axios");
// inquirer is used to prompt the user for the Github username and favorite color
const inquirer = require("inquirer");
// pdfkit is used to create the PDF file
const PDFDocument = require("pdfkit");
// fs is used for writing to files when creating the PDF
const fs = require("fs");
// to get image from github profile image url
const request = require("request");
// needed to get pdf to browser
const open = require("open");

// shades to use for primary background when colors are picked
const colors = {
  blue: "#0066ff",
  red: "#bf0404",
  yellow: "#ffff99", // pale yellow
  orange: "#ff6600",
  purple: "#9900cc",
  green: "#009933",
  pink: "#ff00ff"
};

// complimentary colors to use for background
const complimentaryColors = {
  blue: "#accbfa", // light blue with blue
  red: "#ff9191", // light red with red
  yellow: "#ffff00", // bright yello with pale yellow
  orange: "#ffae78", // light orange with orange
  purple: "#ffb3ff", // pink with purple
  green: "#b3ffcc", // light green with green
  pink: "#ffccff" // light pink with pink
};

// complimentary border colors for around profile picture
const borderColors = {
  blue: "#000080", // dark blue
  red: "#660000", // dark red
  yellow: "#b32400", // dark orange
  orange: "#b32400", // dark orange
  purple: "#ff00ff", // hot pink
  green: "#ffff00", // yellow
  pink: "#9900cc" // purple
};

// ask the user for the Github username and color
inquirer
  .prompt([
    {
      type: "input",
      name: "username",
      message:
        "What is the Github username of the person whose profile you would like?"
    },
    {
      type: "list",
      name: "favColor",
      message: "Click on your favorite color.",
      choices: ["blue", "green", "pink", "purple", "red", "orange", "yellow"],
      filter: function(val) {
        return val.toLowerCase();
      }
    }
  ]) // end of inquirer prompt

  .then(promptResponses => {
    // get username & color from response
    const { username, favColor } = promptResponses;

    // set colors for PDF based on favorite color chosen: primary & secondary background colors, border, text and icon colors
    const backgroundColor = complimentaryColors[favColor];
    const mainColor = colors[favColor];
    const borderColor = borderColors[favColor];

    // set text and icon colors based on favColor
    let textColor, locationIcon, githubIcon, blogIcon;

    if (favColor === "yellow") {
      // if the color is yellow, use dark grey font color so it can be seen
      textColor = "#696463"; // dark grey
      locationIcon = "locationIconGrey.png";
      githubIcon = "githubIconGrey.png";
      blogIcon = "blogIconGrey.png";
    } else {
      // white is good on any other color choice.
      textColor = "#ffffff"; // white
      locationIcon = "locationIconWhite.png";
      githubIcon = "githubIconWhite.png";
      blogIcon = "blogIconWhite.png";
    }

    //  can now query Github...for user's profile information
    const queryUrlOwner = `https://api.github.com/users/${username}`;

    axios.get(queryUrlOwner).then(function(responseOwner) {
      //get information needed
      // profile profile link, profile image link, location, bio, blog link, # repositories
      const githubProfileUrl = responseOwner.data.html_url;
      // check if github profile found
      if (githubProfileUrl === null || githubProfileUrl == "") {
        console.log(`No GitHub Profile for ${username} found.`);
        return; // end program
      }

      // get needed data from the response.
      const name = responseOwner.data.name;
      const profileImageUrl = responseOwner.data.avatar_url; // use image with error message if no profile image found.
      let location = responseOwner.data.location; // may change if none found
      let bio = responseOwner.data.bio; // may change if none found
      const blogUrl = responseOwner.data.blog; // use boolean to change text (easier with link processing)
      let blogText = "Blog"; // may change if none found
      const numRepos = responseOwner.data.public_repos;
      const followers = responseOwner.data.followers;
      const numFollowing = responseOwner.data.following;
      let company = responseOwner.data.company; // may change if none found

      // error checking - if some items not found...
      // default text if no bio
      if (bio === null || bio == "") {
        bio = "No bio entered.";
      }

      // default text if no company
      if (company === null || company == "") {
        company = "No company listed.";
      } else {
        company = `Currently at ${company}.`;
      }

      // build url for google.maps
      let locationExists;
      if (location === null || location == "") {
        locationExists = false; // use this to determine whether to create a link or not
        location = "No location found.";
      } else {
        locationExists = true; // use this to determine whether to create a link or not
      }

      // check for blog
      let blogExists; // use this to determine whether to create a link or not
      if (blogUrl === null || blogUrl == "") {
        blogExists = false; // use this to determine whether to create a link or not
        blogText = "No blog found.";
      } else {
        blogExists = true;
      }

      // Download actual profile image, save to file called profile.jpg.
      // It will be overwritten if it already exists
      const imageJpg = "profile.jpg"; // copies profile image to this file if it exists
      async function streamProfileImage(profileImageUrl) {
        try {
          response = await request(profileImageUrl).pipe(
            fs.createWriteStream("profile.jpg")
          );
          // end of try
        } catch (err) {
          imageJpg = "noProfileImage.jpg"; // image with "No Profile Image Found" in it; used if profile image not found.
        } // end of catch
      } // end of asynch block

      // call async function
      streamProfileImage(profileImageUrl);

      // query Github for user's repositories to get star counts
      const queryUrlRepositories = `https://api.github.com/users/${username}/repos?per_page=100`;

      axios.get(queryUrlRepositories).then(function(responseRepositories) {
        // Get star counts for each repository, and add them.
        count = 0;
        const repositoryStars = responseRepositories.data.map(function(
          repository
        ) {
          count += repository.stargazers_count;
          return repository.stargazers_count;
        });

        // determine where things should go on line with location, github and blog links
        const charFactor = 5; // ~ points / character
        const iconWidth = 8; // space for icon
        const linkSpace = charFactor * 5; // ~5 spaces between links
        const iconSpace = charFactor; // 1 space after the icons
        const pageWidth = 611; // how wide the PDF page is

        // length of all text on line is sum of:
        //       location text, "github" (6), blog text;
        //       3 * iconWidth for each of the 3 icons;
        //       2 * linkSpace for space between each link;
        //       3 * iconSpace after each icon
        // ...all * charFactor
        const locationTextLength = location.length * charFactor;
        const githubTextLength = 6 * charFactor; // 6 characters in "Github"
        const blogTextLength = blogText.length * charFactor;
        const lineLength =
          locationTextLength +
          githubTextLength +
          blogTextLength +
          3 * iconWidth +
          2 * linkSpace +
          3 * iconSpace;

        // location start:  start where whole line will be centered
        // calc location start (icon & text) & length of link
        const locationIconStart = pageWidth / 2 - lineLength / 2; // to center entire line
        const locationTextStart = locationIconStart + iconWidth + iconSpace;
        const locationLinkLength = iconWidth + iconSpace + locationTextLength;

        // github start:  add location width & linkSpace to locationTextStart
        const githubIconStart =
          locationTextStart +
          locationTextLength +
          linkSpace;
        // github text starts the icon width and icon spacer after the github icon
        const githubTextStart = githubIconStart + iconWidth + iconSpace;
        const githubLinkLength = iconWidth + iconSpace + githubTextLength;

        // blog icon start:  add github width & linkSpace to githubTextStart
        const blogIconStart =
          githubTextStart +
          githubTextLength +
          linkSpace;
        // blog text starts the icon width and icon spacer after the github icon
        const blogTextStart = blogIconStart + iconWidth + iconSpace;
        const blogLinkLength = iconWidth + iconSpace + blogTextLength;

        // create the PDF file
        const doc = new PDFDocument();

        // pipe the document to username.pdf.  It will get overwritten if it already exists.
        const usernamePDF = username + ".pdf";
        let writeStream = doc.pipe(fs.createWriteStream(usernamePDF));

        // draw the background rectangles in complimentary color
        // pdf file is 611 x 761
        doc // at the top
          .save()
          .rect(0, 0, 611, 204)
          .fill(backgroundColor);

        doc // at the bottom
          .save()
          .rect(0, 557, 611, 234)
          .fill(backgroundColor);

        // draw primary rectangle in preferred color; offset down a bit from the top background rectangle
        doc
          .save()
          .roundedRect(15, 45, 581, 175, 60)
          .fill(mainColor);

        // draw boxes for stats
        doc
          .save()
          .roundedRect(35, 320, 260, 70, 60) // for repositories
          .fill(mainColor);

        doc
          .save()
          .roundedRect(315, 320, 260, 70, 60) // for followers
          .fill(mainColor);

        doc
          .save()
          .roundedRect(35, 410, 260, 70, 60) //for stars
          .fill(mainColor);

        doc
          .save()
          .roundedRect(315, 410, 260, 70, 60) // for following
          .fill(mainColor);

        // add profile picture with complimentary border color
        doc
          .image(imageJpg, 255, 20, { fit: [100, 100] })
          .rect(255, 20, 100, 100)
          .lineWidth(3)
          .stroke(borderColor);

        // add "Hi!"
        doc.moveDown(4);
        doc
          .save()
          .font("Helvetica-Bold", textColor, 25)
          .fillAndStroke(textColor)
          .text("Hi!", {
            align: "center"
          });

        // and introduction w/name
        doc
          .save()
          .fontSize(20)
          .text(`My name is ${name}!`, {
            align: "center"
          });

        // company
        doc
          .save()
          .fontSize(10)
          .text(company, {
            // will state "No company" if none found.
            align: "center"
          });

        // link to location, if it exists w/ leading icon
        doc.moveDown();

        if (locationExists) {
          // location icon first
          doc.image(locationIcon, locationIconStart, 205, {
            fit: [iconWidth, 8], // same as fonstSize
            continue: true // don't go to next line
          }); // end of icon block
          // then location text and link
          doc
            .save()
            .fontSize(8)
            .link(
              locationIconStart,
              205,
              locationLinkLength,
              8,
              `https://www.google.com/maps/place/${location.replace(/ /g, "+")}`
            )
            .text(location, locationTextStart, 205, {
              width: locationTextLength,
              align: "left",
              continue: true
            });
        }
        // no location found - print text saying so
        else {
          doc
            .save()
            //  .fontSize(8)
            .text(location, locationIconStart, 205, {
              // location was changed to error message.
              align: "left",
              width: locationTextLength,
              continue: true
            });
        }

        // link to github profile with icon
        // github icon first
        
        doc.image(githubIcon, githubIconStart, 205, {
          fit: [iconWidth, 8], // same as fontSize
          continue: true // don't go to next line yet
        }); // end of icon block

        doc
          .save()
          .link(githubIconStart, 205, githubLinkLength, 8, githubProfileUrl) // link starts where icon is & goes for 20
          .text("GitHub", githubTextStart, 205, {
            align: "left",
            width: githubTextLength,
            link: githubProfileUrl,
            continue: true // don't go to next line yet
          });

        // link to blog
       
        if (blogExists) {
          // blog icon first
          doc.image(blogIcon, blogIconStart, 205, {
            fit: [iconWidth, 8], // same as fonstSize
            continue: true // don't go to next line yet
          }); // end of icon block
          doc
            .save()
            .link(
              blogIconStart,
              205,
              blogLinkLength,
              8
            )
            .text(blogText, blogTextStart, 205, {
              align: "left",
              width: blogTextLength,
              link: blogUrl
            });
        } else {
          doc
            .save()
            .text(blogText, blogIconStart, 205, {
              align: "left",
              width: blogTextLength
            });
        }

        // bio
        doc.moveDown(2);
        doc
          .save()
          .fontSize(15)
          .fillAndStroke("#696463") // bio color always dark grey - background is white here
          .text(bio, 35, 240, {
            align: "center",
            height: 180,
            width: 541
          });

        // text for repositories & followers
        doc.moveDown();
        doc
          .save()
          .fontSize(15)
          .fillAndStroke(textColor)
          .text("Public Repositories", 35, 340, {
            width: 260,
            height: 15,
            align: "center"
          });

        doc.save().text("Followers", 315, 340, {
          width: 260,
          height: 15,
          align: "center"
        });

        // data for repositories & followers
        doc.save().text(numRepos, 35, 365, {
          width: 260,
          height: 10,
          align: "center"
        });

        doc.save().text(followers, 315, 365, {
          width: 260,
          height: 10,
          align: "center"
        });

        // text for stars & following
        doc.moveDown();
        doc
          .save()
          .fontSize(15)
          .fillAndStroke(textColor)
          .text("GitHub Stars", 35, 430, {
            width: 260,
            height: 15,
            align: "center"
          });

        doc.save().text("Following", 315, 430, {
          width: 260,
          height: 15,
          align: "center"
        });

        // data for stars & following
        doc.save().text(count, 35, 455, {
          width: 260,
          height: 10,
          align: "center"
        });

        doc.save().text(numFollowing, 315, 455, {
          width: 260,
          height: 10,
          align: "center"
        });

        // Finalize PDF file
        doc.end();

        // open the PDF
        writeStream.on("finish", function() {
          //  wait until document is free to display
          async function displayPDF(pdfFile) {
            // Opens the image in the default image viewer and waits for the opened app to quit.
            await open(pdfFile, { wait: true });
            return; // end program
          }

          // call async function
          displayPDF(usernamePDF);
        }); // end of writeStream.on("finish")
      }); // end of axios call to queryUrlRepositories
    }); // end of queryUrlOwner
  }); // end of inquirer then block
