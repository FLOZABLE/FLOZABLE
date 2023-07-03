const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const axios = require("axios");
const NodeCache = require('node-cache');
const cache = new NodeCache();
const sharp = require("sharp");
const multer = require("multer");

Router.get("/", async (req, res) => {
  if(!req.session.loggedin){
    return res.redirect("/account");
  }
  const t0 = performance.now();
  const connection = await (await pool).getConnection();
  const user_info = await connection.query('SELECT * FROM users WHERE user_id = ?', req.session.user_id);
  const accessToken = user_info[0].github_access_token;
  connection.release();
  let binaryData = user_info[0].profile_picture;
  let base64Image;

  if(!binaryData){
    binaryData = fs.readFileSync('./public/img/default_profile.jpg');
  }

  base64Image = binaryData.toString('base64');
  
  try {
    var response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
  } catch (error){
    res.render("account/myaccount", {
      loggedin: true, 
      account: {
        name: user_info[0].name,
        email: user_info[0].email,
        myinfo: user_info[0].myinfo,
        image: base64Image,
        github_info: null,
        repoList: null
      }
    });
    return 0
  }
  
  const getRepoList = async (accessToken, reposUrl, refreshTime = 60 * 10) => {
    const cacheKey = `repoList:${reposUrl}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("cached")
      return cachedData;
    }
  
    const reposResponse = await axios.get(reposUrl, {
      headers: {
        Authorization: `token ${accessToken}`
      }
    });
  
    const repoList = [];
  
    const promises = reposResponse.data.map(async repo => {
      if (!repo.topics.includes('lhs-programmers')) {
        return null;
      }
      const [topicsResponse, languagesResponse, contributorsResponse, repoResponse, readmeResponse] = await Promise.all([
        axios.get(`https://api.github.com/repos/${repo.full_name}/topics`, {
          headers: {
            Accept: "application/vnd.github.mercy-preview+json",
            Authorization: `token ${accessToken}`
          }
        }),
        axios.get(`https://api.github.com/repos/${repo.full_name}/languages`, {
          headers: {
            Authorization: `token ${accessToken}`
          }
        }),
        axios.get(`https://api.github.com/repos/${repo.full_name}/contributors`, {
          headers: {
            Authorization: `token ${accessToken}`
          }
        }),
        axios.get(`https://api.github.com/repos/${repo.full_name}`, {
          headers: {
            Authorization: `token ${accessToken}`
          }
        }),
        axios.get(`https://api.github.com/repos/${repo.full_name}/readme`, {
          headers: {
            Authorization: `token ${accessToken}`
          }
        })
      ]);
      const contributorList = Array.isArray(contributorsResponse.data) ? contributorsResponse.data.map(c => c.login) : [contributorsResponse.data.login];
      const repoData = {
        name: repo.name,
        url: repo.html_url,
        description: repoResponse.data.description,
        topics: topicsResponse.data.names,
        languages: Object.entries(languagesResponse.data).map(([key, value]) => ({name: key, percentage: ((value / Object.values(languagesResponse.data).reduce((a,b) => a + b, 0)) * 100).toFixed(2)})),
        contributors: contributorList,
        readme: readmeResponse.data.content ? Buffer.from(readmeResponse.data.content, 'base64').toString() : null
      };
      if (repoData.topics.includes('lhs-programmers')) {
        repoList.push(repoData);
      }
    });
  
    await Promise.all(promises);
  
    cache.set(cacheKey, repoList, refreshTime);
  
    return repoList;
  };
  
  const repoList = await getRepoList(accessToken, response.data.repos_url);

  console.log(repoList)
  
  res.render("account/myaccount", {
    loggedin: true, 
    account: {
      name: user_info[0].name,
      email: user_info[0].email,
      myinfo: user_info[0].myinfo,
      image: base64Image,
      github_info: response.data,
      repoList: repoList,
    }
  });
  const t1 = performance.now();
  console.log(`Time taken: ${t1 - t0} milliseconds`);
  

  connection.release();
})


Router.get("/edit", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE user_id = ?', req.session.user_id);
    user_info = user_info[0]

    res.render("account/edit", {loggedin: true, account: {name: user_info.name, email: user_info.email, myinfo: user_info.myinfo}});
    connection.release();
  } else {
    res.redirect("/account")
  }
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/profiles');
  },
  filename: function (req, file, cb) {
    const fileName = `${req.session.user_id}-profile.jpeg`;
    cb(null, fileName);
  }
});

// Create the multer upload instance
const upload = multer({ storage: storage });

// Handle the file upload and processing
Router.post("/update", async (req, res) => {
  if (req.session.loggedin == true) {
    const connection = await (await pool).getConnection();
    console.log(req.body)
    try {
      const imageBuffer = Buffer.from(req.body.picture, 'base64');
      await sharp(imageBuffer)
        .toFormat('jpeg')
        .resize({ width: 800, height: 800 })
        .jpeg({ quality: 40 })
        .toFile(`./public/img/profiles/${req.session.user_id}.jpeg`);

      console.log('Image format converted successfully!');
    } catch (error) {
      console.error('Error converting image format:', error);
    }

    const name = req.body.name;
    const email = req.body.email;
    const aboutme = req.body.aboutme;
    console.log(name, email, aboutme);

    const update_info = [{ name: name, email: email, myinfo: aboutme }, req.session.user_id];
    const updateProfile = await connection.query("UPDATE users SET ? WHERE user_id=?", update_info);

    connection.release();
  } else {
    res.redirect("/account");
  }
});


Router.post("/skills", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE user_id = ?', req.session.user_id);
    user_info = user_info[0]
    res.send({programming_skills: user_info.programming_skills, programming_language_skills: user_info.programming_language_skills});
    connection.release();
  } else {
    res.redirect("/account")
  }
})

module.exports = Router;