import config from "@/app/utils/config";

async function getSubjects() {
  const response = await fetch(`${config.server}/subjects`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
}

export { getSubjects };
