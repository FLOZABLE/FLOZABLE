const express = require('express');
const Router = express.Router();

const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


Router.post("/input", async (req, res) => {
    const { subjects } = req.body;
    let GPT_Query = `\nA user has ${subjects.length} subjects. The following are the subjects:\n`;

    subjects.splice(0, Math.min(10, subjects.length)).map((subject) => { //max 10 subjects
        GPT_Query += "\nSubject Name: " + subject.name;
        const recentWeekStudy = subject.weekly.grouped[subject.weekly.grouped.length - 1];
        GPT_Query += "\nThis user studied " + subject.name + " for the following times, formatted in [Seconds Unix of Start Time, Seconds Unix of Stop Time]:\n{";
        recentWeekStudy.map(([start, stop]) => {
            const duration = stop - start;
            if (duration > 0){ //is 0 for testing, change to > 5 min for production
                GPT_Query += "\n[" + start + "," + stop + "]";
            }
        });
        GPT_Query += "\n}\n";
    })
    GPT_Query += `\nFor the query above, please provide appropriate study plans with subject names. The plans should correspond the the user's study habbit`;
    console.log(GPT_Query);

    return;
    try {
        const completion = await (openai.chat.completions.create({
            messages: [{ role: "system", content: query }],
            model: "gpt-3.5-turbo",
        }));
        const GPTresponse = completion.choices[Math.floor(Math.random() * completion.choices.length)].message.content;
        console.log("===GPT Responded===");
        console.log(GPTresponse);
        res.send({ success: true, data: GPTresponse});
    } catch (err) {
        console.log(err);
        res.send({ success: false });
    }
   res.send({success: true});
})


module.exports = Router;