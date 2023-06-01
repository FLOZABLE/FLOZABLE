const tf = require('@tensorflow/tfjs-node');
const express = require('express');
const Router = express.Router();
const pool = require('../model/pool');

Router.post('/activity', async (req, res) => {
  try {
    // Extract user activity data from the request
    const { userId, activities } = req.body;

    // Get user activity data from the database
    const userInfo = await getUserInfo(userId);

    // Process user activity data and generate recommendations
    const recommendations = generateRecommendations(userId, activities, userInfo);

    // Send recommendations as the response
    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

async function getUserInfo(userId) {
  const connection = await (await pool).getConnection();
  let userInfo = await connection.query(`SELECT subjects FROM users WHERE user_id = '${userId}'`);
  userInfo = userInfo[0];
  userInfo.subjects = userInfo.subjects ? JSON.parse(userInfo.subjects) : [];
  return userInfo;
}

function generateRecommendations(userId, activities, userInfo) {
  // Determine the number of unique activities
  const numActivities = calculateNumActivities(activities);

  // Build the collaborative filtering model
  const model = buildModel(numActivities);

  // Prepare training data
  const trainingData = prepareTrainingData(userId, activities, numActivities);

  // Train the model
  trainModel(model, trainingData);

  // Generate recommendations
  const recommendations = generateUserRecommendations(model, userId);

  // Return the recommendations
  return {
    userId,
    recommendations
  };
}

function calculateNumActivities(activities) {
  // Determine the number of unique activities
  const uniqueActivities = new Set(activities.map((activity) => activity.name));
  return uniqueActivities.size;
}

function buildModel(numActivities) {
  // Define the model architecture
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 32, activation: 'relu', inputShape: [numActivities] }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: numActivities, activation: 'softmax' }));

  // Compile the model
  model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });

  return model;
}

async function prepareTrainingData(userId, activities, numActivities) {
  // Prepare the training data based on user activities
  // Each activity is converted into a one-hot encoded vector

  const trainingData = [];
  if (Array.isArray(activities)) {
    for (const activity of activities) {
      const activityVector = createActivityVector(activity, numActivities);
      trainingData.push({ userId, activity: activityVector });
    }
  }

  return trainingData;
}

function createActivityVector(activity, numActivities) {
  // Create a one-hot encoded vector for the activity

  const activityVector = Array(numActivities).fill(0);
  const activityIndex = activity.name.charCodeAt(0) % numActivities;
  activityVector[activityIndex] = 1;

  return activityVector;
}

function trainModel(model, trainingData) {
  // Train the model using the training data
  // Convert the training data into TensorFlow tensors

  const xs = tf.tensor2d(trainingData.map((data) => data.userId), [trainingData.length, 1]);
  const ys = tf.tensor2d(trainingData.map((data) => data.activity), [trainingData.length, trainingData[0].activity.length]);

  // Train the model
  model.fit(xs, ys, { epochs: 10 });
}

function generateUserRecommendations(model, userId) {
  // Generate recommendations for the user
  // Use the trained model to predict user preferences

  const userVector = tf.tensor2d([[userId]]);
  const predictions = model.predict(userVector);
  const recommendations = predictions.arraySync()[0];

  return recommendations;
}

module.exports = Router;
