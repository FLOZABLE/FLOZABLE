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

async function putSubjectsSubject({ name, color }) {
  const response = await fetch(`${config.server}/subjects/subject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, color }),
  });
  const data = await response.json();
  return data;
}

async function patchSubjectsSubject({ subjectId, name, color }) {
  const response = await fetch(`${config.server}/subjects/subject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ subjectId, name, color }),
  });
  const data = await response.json();
  return data;
}

async function deleteSubjectsSubject(subjectId) {
  const response = await fetch(`${config.server}/subjects/subject`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({subjectId})
  });
  const data = await response.json();
  return data;
}

export {
  getSubjects,
  putSubjectsSubject,
  patchSubjectsSubject,
  deleteSubjectsSubject,
};
