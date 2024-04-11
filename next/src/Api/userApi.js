const { config } = require("@/app/utils/config");

async function fetchUserData () {
  const response = await fetch(`${config.server}/account/accountinfo`);
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  };

  const data = await response.json();
  return data;
};

export {fetchUserData};