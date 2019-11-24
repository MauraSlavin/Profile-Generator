# Profile-Generator
https://mauraslavin.github.io/Profile-Generator/
  
## Creates a developer profile PDF file based on a given person's Github page.

The user is prompted for a github user name and color.  
A PDF file is created and opened with information from the appropriate github user's profile, with the color scheme chosen.  The PDF file is saved with the username as the filename (and .pdf as the extension).

The following information is included:
-   Profile picture
-   Name
-   Company name
-   Location (and link to Google maps for that location)
-   Link to GitHub profile
-   Link to Blog
-   Biography
-   Number of GitHub repositories
-   Number of GitHub stars
-   Number GitHub follower
-   Number of developers following on GitHub

[Click here to see an example of a PDF created](./Assets/Images/example.png)

[Click here to see a short GIF demonstration](.Assets/../Assets/Images/demonstration.gif)

Errors checked for include:
- No github page found (a CMD line error message is returned with no PDF created)
- No profile picture found ("No Profile Picture Found") where the image would have been
- No company found ("No company listed." where company would ahve been)
- No location found ("No location found." displayed where the location would have been; no link)
- No blog found ("No blog found." displayed where the blog would have been; no link)
- No bio found ("NO bio found." displapyed where the bio would have been)


