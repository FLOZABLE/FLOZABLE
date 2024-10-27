import AxiosInstance from "@/app/utils/axiosInstance";
import { getTimezone } from "@/app/utils/Tool";

async function getPlans() {
  const response = await AxiosInstance.get(`/plans`);
  return response.data;
}

async function patchPlan(planModal) {
  planModal.start = Math.floor(planModal.start.getTime() / 1000);
  planModal.end = Math.floor(planModal.end.getTime() / 1000);
  planModal.completed = planModal.completed ? 1 : 0;
  const timezone = getTimezone();

  const response = await AxiosInstance.patch(`/plans/plan`, {
    ...planModal,
    timezone,
  });
  return response.data;
}

async function deletePlan(planId) {
  const response = await AxiosInstance.delete(`/plans/plan`, {
    plan_id: planId,
  });
  return response.data;
}

async function patchPlanStatus(planId, completed) {
  const response = await AxiosInstance.patch(`/plans/plan/status`, {
    plan_id: planId,
    completed: completed ? 0 : 1,
  });
  return response.data;
}

async function postPlanShare(users, planId) {
  const response = await AxiosInstance.post(`/plans/plan/share`, {
    users,
    planId,
  });
  return response.data;
}

async function postPlanShareRespond(notificationId, accepted) {
  const response = await AxiosInstance.post(`/plans/plan/share/respond`, {
    notification_id: notificationId,
    accepted,
  });
  return response.data;
}

async function deletePlanShare(targetId, planId) {
  const response = await AxiosInstance.delete(`/plans/plan/share`, {
    target_id: targetId,
    plan_id: planId,
  });
  return response.data;
}

async function getPlansPlanUsers(planId) {
  const response = await AxiosInstance.get(`/plans/plan/users`, {
    params: { plan_id: planId },
  });
  return response.data;
}

export {
  getPlans,
  patchPlan,
  deletePlan,
  patchPlanStatus,
  postPlanShare,
  postPlanShareRespond,
  deletePlanShare,
  getPlansPlanUsers,
};
