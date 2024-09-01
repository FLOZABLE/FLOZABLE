import config from "@/app/utils/config";

async function getGroups() {
  const response = await fetch(`${config.server}/groups`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

async function getGroupMembers(groupId) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(
    `${config.server}/groups/group/members?groupId=${groupId}&timezone=${timezone}`,
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

async function putGroup(newGroup) {
  const response = await fetch(`${config.server}/groups/group`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newGroup),
  });
  const data = await response.json();

  return data;
}

async function patchGroup(newGroup) {
  const response = await fetch(`${config.server}/groups/group`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(newGroup),
  });
  const data = await response.json();

  return data;
}

async function postGroupLeave(groupId) {
  const response = await fetch(
    `${config.server}/groups/group/leave?groupId=${groupId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();

  return data;
}

export { getGroups, getGroupMembers, putGroup, patchGroup, postGroupLeave };
