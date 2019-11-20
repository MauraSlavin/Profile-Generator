// Need axios for api queries
const axios = require("axios");


// Get repository names & data

// Query needed
const queryUrlRepos = `https://api.github.com/users/MauraSlavin`;

// from this query, can get image url, location, profile link, blog link, and bio
axios.get(queryUrlRepos).then(function (response) {
  //  console.log(response.data);   // ALL the results!!
    console.log(`Profile image url:  ${response.data.avatar_url}`);
    console.log(`Location:  ${response.data.location}`);
    console.log(`Github profile link:  ${response.data.html_url}`);
    console.log(`Blog link:  ${response.data.blog}`);
    console.log(`Bio:  ${response.data.bio}`);

})
    .then(function (response) {
        let queryUrlStars = "";
    });


const queryUrlFollowers = `https://api.github.com/users/MauraSlavin/followers`;
axios.get(queryUrlFollowers).then(function (response2) {
    // console.log(response2.data);
    const numFollowers = response2.data.length;
    console.log("Followers:  " + numFollowers);
})
    .then(function () {

    });

