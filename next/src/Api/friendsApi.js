import config from "@/app/utils/config";

async function getFriendsRecommended() {
  const response = await fetch(`${config.server}/friends/recommended`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

async function getFriendsSearch(searchQuery) {
  if (!searchQuery || !searchQuery.length) return { success: true, users: [] };

  const response = await fetch(
    `${config.server}/friends/search?query=${searchQuery}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();

  return data;
}

async function getFriendsTrends() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(
    `${config.server}/friends/trends?timezone=${timezone}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();

  return data;
}

async function getFriendsStatus() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(
    `${config.server}/friends/status?timezone=${timezone}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();

  return data;
}

export {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsTrends,
  getFriendsStatus,
};
