import AxiosInstance from "@/app/utils/axiosInstance";

async function getSubjects() {
  const response = await AxiosInstance.get(`/subjects`);
  return response.data;
}

async function putSubjectsSubject({ name, color }) {
  const response = await AxiosInstance.put(`/subjects/subject`, {
    name,
    color,
  });
  return response.data;
}

async function patchSubjectsSubject({ subjectId, name, color }) {
  const response = await AxiosInstance.patch(`/subjects`, {
    subject_id: subjectId,
    name,
    color,
  });
  return response.data;
}

async function deleteSubjectsSubject(subjectId) {
  const response = await AxiosInstance.delete(`/subjects/subject`, {
    data: { subject_id: subjectId },
  });
  return response.data;
}

async function getSubjectUsers(subjectId) {
  const response = await AxiosInstance.get(`/subjects/subject/users`, {
    params: { subject_id: subjectId },
  });
  return response.data;
}

async function postSubjectShare({ subjectId, users }) {
  const response = await AxiosInstance.post(`/subjects/subject/share`, {
    subject_id: subjectId,
    users,
  });
  return response.data;
}

async function deleteSubjectShare({ subjectId, targetId }) {
  const response = await AxiosInstance.delete(`/subjects/subject/share`, {
    data: { subject_id: subjectId, target_id: targetId },
  });
  return response.data;
}

export {
  getSubjects,
  putSubjectsSubject,
  patchSubjectsSubject,
  deleteSubjectsSubject,
  getSubjectUsers,
  postSubjectShare,
  deleteSubjectShare,
};
