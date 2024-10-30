import AxiosInstance from "@/app/utils/axiosInstance";
import { getTimezone } from "@/app/utils/Tool";

async function getGroups() {
  const response = await AxiosInstance.get(`/groups`);
  return response.data;
}

async function getGroupMembers(groupId) {
  const timezone = getTimezone();

  const response = await AxiosInstance.get(`/groups/group/members`, {
    params: {
      group_id: groupId,
      timezone,
    },
  });
  return response.data;
}

async function putGroup(newGroup) {
  const response = await AxiosInstance.put(`/groups/group`, newGroup);
  return response.data;
}

async function patchGroup(newGroup) {
  const response = await AxiosInstance.patch(`/groups/group`, newGroup);
  return response.data;
}

async function deleteGroup(groupId) {
  const response = await AxiosInstance.delete(`/groups/group`, {
    data: { group_id: groupId },
  });
  return response.data;
}

async function postGroupJoin(groupId, password) {
  const response = await AxiosInstance.post(`/groups/group/join`, {
    group_id: groupId,
    password,
  });
  return response.data;
}

async function postGroupLeave(groupId) {
  const response = await AxiosInstance.post(`/groups/group/leave`, {
    group_id: groupId,
  });
  return response.data;
}

async function postGroupLike({ groupId, like }) {
  const response = await AxiosInstance.post(`/groups/group/like`, {
    group_id: groupId,
    like,
  });
  return response.data;
}

export {
  getGroups,
  getGroupMembers,
  putGroup,
  patchGroup,
  deleteGroup,
  postGroupJoin,
  postGroupLeave,
  postGroupLike,
};
