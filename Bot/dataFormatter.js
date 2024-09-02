
/**create a new file and add id */
function addId() {
  const newData = originalData.map(data => {
    const userId = generateRandomId(10);
    return { ...data, userId };
  });

  fs.writeFileSync('./data/DatasetsWithId.json', JSON.stringify(newData, null, 2), 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
};

/**convert csv to json add add more values*/
const csvFilePath = "./data/originalnames.csv";
const fileOutputName = "./data/realName.json";
async function csvIdToJsonDatasets() {
  /* csv()
  .fromFile(fileInputName)
  .then((jsonObj)=>{
      console.log(jsonObj);
  }) */
  const jsonArray = await csv().fromFile(csvFilePath);
  fs.writeFileSync(fileOutputName, JSON.stringify(jsonArray));
}

//csvIdToJsonDatasets();
const realNames = require("../data/realName.json");
async function addValues() {
  const newData = realNames.map(data => {
    const userId = generateRandomId(10);
    const gender = randomIntInRange(0, 1) ? 'Female' : 'Male';
    const timeZone = timeZones[randomIntInRange(0, timeZones.length - 1)];
    return { ...data, userId, timeZone, gender };
  });

  fs.writeFileSync('./data/RealUserIdWithData.json', JSON.stringify(newData, null, 2), 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
};

//write combinedNames.json with 50/50 chess and realNames
const CountryTimezones = require('countries-and-timezones');
const chessData = require("../data/ChessInfo.json");
const { profile } = require('console');
const { connect } = require('http2');
//and fullNameData
async function addChessAndReal() {
  const fullNameUsers = fullNameData.map(data => {
    return { ...data };
  });

  const chessNameUsers = chessData.map(data => {
    let countryInfo = CountryTimezones.getCountry(data.countryCode.toUpperCase());
    if (!!!countryInfo) {
      countryInfo = CountryTimezones.getCountry("US")
    }
    const timeZone = countryInfo.timezones[randomIntInRange(0, countryInfo.timezones.length - 1)];

    const userId = generateRandomId(10);
    const gender = randomIntInRange(0, 1) ? 'Female' : 'Male';
    const name = data.name;
    const profileImage = data.imgUrl;
    return { name, userId, timeZone, gender, profileImage };
  });

  const newData = fullNameUsers.concat(chessNameUsers);

  fs.writeFileSync('./data/combinedNames.json', JSON.stringify(newData, null, 2), 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  });
}

//addChessAndReal();

//create combined datasets
function createCombinedUserList(percentage, length = realisticNameData.length + fullNameData.length - 2) {
  let fullNameIndex = 0;
  let realisticNameIndex = 0;
  const newData = [];
  for (let i = 0; i < length; i++) {
    const type = randomIntInRange(0, 100) > percentage;
    if (type && fullNameData[fullNameIndex]) {
      newData.push(fullNameData[fullNameIndex]);
      fullNameIndex += 1;
    } else {
      newData.push(realisticNameData[realisticNameIndex]);
      realisticNameIndex += 1;
    };
  }

  fs.writeFileSync('./data/combinedNames.json', JSON.stringify(newData, null, 2), 'utf-8', (err) => {
    if (err) {
      console.log(err)
    }
  })
};

//createCombinedUserList(30);

//addValues();