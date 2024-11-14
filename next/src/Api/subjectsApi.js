import AxiosInstance from "@/app/utils/axiosInstance";
import { requestHandler } from "@/app/utils/Tool";

async function getSubjects() {
  return requestHandler(AxiosInstance.get(`/subjects`));
}

async function putSubjectsSubject({ name, color }) {
  return requestHandler(
    AxiosInstance.put(`/subjects/subject`, {
      name,
      color,
    })
  );
}

async function patchSubjectsSubject({ subjectId, name, color }) {
  return requestHandler(
    AxiosInstance.patch(`/subjects/subject`, {
      subject_id: subjectId,
      name,
      color,
    })
  );
}

async function deleteSubjectsSubject(subjectId) {
  return requestHandler(
    AxiosInstance.delete(`/subjects/subject`, {
      data: { subject_id: subjectId },
    })
  );
}

async function getSubjectUsers(subjectId) {
  return requestHandler(
    AxiosInstance.get(`/subjects/subject/users`, {
      params: { subject_id: subjectId },
    })
  );
}

async function postSubjectShare({ subjectId, users }) {
  return requestHandler(
    AxiosInstance.post(`/subjects/subject/share`, {
      subject_id: subjectId,
      users,
    })
  );
}

async function deleteSubjectShare({ subjectId, targetId }) {
  return requestHandler(
    AxiosInstance.delete(`/subjects/subject/share`, {
      data: { subject_id: subjectId, target_id: targetId },
    })
  );
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
