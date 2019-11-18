const PDFDocument = require('pdfkit');
const fs = require('fs');
const inquirer = require("inquirer");
const axios = require("axios");


inquirer
.prompt([
    {
        type: "input",
        message: "What is the Github username of the person whose profile you want?",
        name: "username"
    },
    {
        type: "input",
        message: "What is your favorite color?",
        name: "color"
    }
    
])
.then(function (response) {
    console.log(`Username entered: ${response.username}`);
    console.log(`Color entered: ${response.color}`);
        const queryUrl = `https://api.github.com/users/${response.username}/repos?per_page=100`;

        axios.get(queryUrl).then(function (res) {
            console.log(res.data);
            const repoNames = res.data.map(function (repo) {
                return repo.name;
            });

            const repoNamesStr = repoNames.join("\n");

            fs.writeFile("repos.txt", repoNamesStr, function (err) {
                if (err) {
                    throw err;
                }

                console.log(`Saved ${repoNames.length} repos`);
            });
        });
        //  if (response.confirm === response.password) {
        //    console.log("Success!");
        //  }
        //  else {
        //    console.log("You forgot your password already?!");
        //  }





        // Create a document
        const doc = new PDFDocument;

        // Pipe its output somewhere, like to a file or HTTP response
        // See below for browser usage
        doc.pipe(fs.createWriteStream('output.pdf'));

        // Embed a font, set the font size, and render some text
        // to set font  doc.font('fonts/PalatinoBold.ttf')
        doc.fontSize(25)
            .text('Some text with an embedded font!', 100, 100);

        // Add an image, constrain it to a given size, and center it vertically and horizontally
        doc.image('maura.jpg', {
            fit: [250, 300],
            align: 'center',
            valign: 'center'
        });

        // Add another page
        doc.addPage()
            .fontSize(25)
            .text('Here is some vector graphics...', 100, 100);

        // Draw a triangle
        doc.save()
            .moveTo(100, 150)
            .lineTo(100, 250)
            .lineTo(200, 250)
            .fill("#FF3300");

        // Apply some transforms and render an SVG path with the 'even-odd' fill rule
        doc.scale(0.6)
            .translate(470, -380)
            .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
            .fill('red', 'even-odd')
            .restore();

        // Add some text with annotations
        doc.addPage()
            .fillColor("blue")
            .text('Here is a link!', 100, 100)
            .underline(100, 100, 160, 27, { color: "#0000FF" })
            .link(100, 100, 160, 27, 'http://google.com/');

        // Finalize PDF file
        doc.end();
    });