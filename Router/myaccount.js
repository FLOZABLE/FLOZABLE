const express = require("express");
const Router = express.Router();
const fs = require("fs");
const pool = require('../model/pool');
const axios = require("axios");
const NodeCache = require('node-cache');
const cache = new NodeCache();

Router.get("/", async (req, res) => {
  if(!req.session.loggedin){
    return res.redirect("/account");
  }
  const t0 = performance.now();
  const connection = await (await pool).getConnection();
  const user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
  const accessToken = user_info[0].github_access_token;

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
    res.render("myaccount", {
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
      const [topicsResponse, languagesResponse, contributorsResponse, repoResponse] = await Promise.all([
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
        })
      ]);
      const contributorList = Array.isArray(contributorsResponse.data) ? contributorsResponse.data.map(c => c.login) : [contributorsResponse.data.login];
      const repoData = {
        name: repo.name,
        url: repo.html_url,
        description: repoResponse.data.description,
        topics: topicsResponse.data.names,
        languages: Object.entries(languagesResponse.data).map(([key, value]) => ({name: key, percentage: ((value / Object.values(languagesResponse.data).reduce((a,b) => a + b, 0)) * 100).toFixed(2)})),
        contributors: contributorList
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
  
  res.render("myaccount", {
    loggedin: true, 
    account: {
      name: user_info[0].name,
      email: user_info[0].email,
      myinfo: user_info[0].myinfo,
      image: base64Image,
      github_info: response.data,
      repoList: repoList
    }
  });
  const t1 = performance.now();
  console.log(`Time taken: ${t1 - t0} milliseconds`);
  

  connection.release();
})


Router.get("/edit", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
    user_info = user_info[0]
    let binaryData = user_info.profile_picture
    let base64Image
    console.log(binaryData, typeof binaryData)
    if(binaryData === null){
      console.log("null detected")
      binaryData = fs.readFileSync('./public/img/default_profile.jpg');
    }

    base64Image = binaryData.toString('base64');

    res.render("edit", {loggedin: true, account: {name: user_info.name, email: user_info.email, myinfo: user_info.myinfo, image: base64Image}});
    connection.release();
  } else {
    res.redirect("/account")
  }
})

Router.post("/update", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    const picture = req.body.picture;
    let binaryData;
    if(picture != null){
      binaryData = Buffer.from(picture, 'base64');
    }
    const name = req.body.name
    const email = req.body.email
    const aboutme = req.body.aboutme
    const programming_skills = JSON.stringify(req.body.programming_skills);
    const programming_lang_skills = JSON.stringify(req.body.programming_lang_skills);
    console.log(name, email, aboutme, programming_skills, programming_lang_skills)
    const update_info = [{name: name, email: email, myinfo: aboutme, profile_picture: binaryData, programming_skills: programming_skills, programming_language_skills: programming_lang_skills}, req.session.email];
    const updateProfile = await connection.query("UPDATE users SET ? WHERE email=?", update_info);
    
    connection.release();
  } else {
    res.redirect("/account")
  }
})

Router.post("/skills", async (req, res) => {
  if(req.session.loggedin == true){
    const connection = await (await pool).getConnection();
    let user_info = await connection.query('SELECT * FROM users WHERE email = ?', req.session.email);
    user_info = user_info[0]
    res.send({programming_skills: user_info.programming_skills, programming_language_skills: user_info.programming_language_skills});
    connection.release();
  } else {
    res.redirect("/account")
  }
})

module.exports = Router;