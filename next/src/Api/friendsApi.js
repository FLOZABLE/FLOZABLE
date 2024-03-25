const { config } = require("@fortawesome/fontawesome-svg-core");


async function fetchFriendsRanking () {
  const response = await fetch(`${config.server}/ranking/friends`, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    }
  });
  const data = response.json();
  return data;
};

export {fetchFriendsRanking};