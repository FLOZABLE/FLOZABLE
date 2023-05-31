const fs = require('fs');
const { PythonShell } = require('python-shell');

// Path to the input data file
const inputDataPath = './test/input_data.json';

// Read the input data from the file
fs.readFile(inputDataPath, 'utf8', function (err, data) {
  if (err) {
    console.error('Error reading input data:', err);
    return;
  }

  // Parse the input data as JSON
  const inputData = JSON.parse(data);

  // Perform data preparation steps here
  let preparedData = inputData; // Placeholder for the data preparation logic

  // Convert the prepared data back to JSON
  const preparedDataJson = JSON.stringify(preparedData);

  // Set the path to your Python script
  const scriptPath = 'C:\Users\junja\Code\programming-club\AI\deep_learning_model.py';

  // Set the options for executing the Python script
  const options = {
    pythonPath: 'python3', // Path to the Python interpreter
    scriptPath: scriptPath,
    args: [preparedDataJson], // Pass the prepared data as a command-line argument
  };

  // Execute the Python script
  PythonShell.run(scriptPath, options, function (err, results) {
    if (err) {
      console.error('Error executing Python script:', err);
    } else {
      // Process the results returned from the Python script
      console.log(results);
    }
  });
});
