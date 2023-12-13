const express = require('express');
const Router = express.Router();

const { OpenAI } = require("openai");

/*
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
*/


Router.post("/input", async (req, res) => {
    const { subjects } = req.body;

    
    /*
    try {
        const completion = await (openai.chat.completions.create({
            messages: [{ role: "system", content: query }],
            model: "gpt-3.5-turbo",
        }));
        res.send({ success: true, data: completion.choices[Math.floor(Math.random() * completion.choices.length)].message.content});
    } catch (err) {
        console.log(err);
        res.send({ success: false });
    }
    */
   res.send({success: true});
})


module.exports = Router;