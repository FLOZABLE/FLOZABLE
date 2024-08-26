import config from "@/app/utils/config";

async function getAuthLogout() {
  const response = await fetch(`${config.server}/auth/logout`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

async function postAuthVerify() {
  const response = await fetch(`${config.server}/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

export { getAuthLogout, postAuthVerify };
