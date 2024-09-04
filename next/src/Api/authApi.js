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

async function postAuthSignin({ email, password }) {
  const response = await fetch(`${config.server}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  return data;
}

async function postAuthSignup({ name, email, password, timeZone }) {
  const response = await fetch(`${config.server}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, email, password, timeZone }),
  });
  const data = await response.json();
  return data;
}

export { getAuthLogout, postAuthVerify, postAuthSignin, postAuthSignup };
