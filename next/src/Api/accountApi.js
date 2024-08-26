import config from "@/app/utils/config";

async function getAccount() {
  const response = await fetch(`${config.server}/account`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

async function getAccountProfile(userId) {
  const response = await fetch(
    `${config.server}/account/profile?userId=${userId}`,
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

async function getAccountProfileSubjects(userId) {
  const response = await fetch(
    `${config.server}/account/profile/subjects?userId=${userId}`,
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

async function getAccountGoogle() {
  const response = await fetch(`${config.server}/account/google`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

async function patchAccountInfo({ name, email, confirmEmail }) {
  const response = await fetch(`${config.server}/account/info`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, email, confirmEmail }),
  });
  const data = await response.json();
  return data;
}

async function patchAccountPassword({ password, confirmPassword }) {
  const response = await fetch(`${config.server}/account/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ password, confirmPassword }),
  });
  const data = await response.json();
  return data;
}

export {
  getAccount,
  getAccountProfile,
  getAccountProfileSubjects,
  getAccountGoogle,
  patchAccountInfo,
  patchAccountPassword,
};
