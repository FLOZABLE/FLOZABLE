import config from "@/app/utils/config";

async function getPlans() {
  const response = await fetch(`${config.server}/plans`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

async function patchPlan(planModal) {
  if (!planModal.editable) {
    return { success: false, reason: "This event is view only" };
  }

  planModal.start = Math.floor(planModal.start.getTime() / 1000);
  planModal.end = Math.floor(planModal.end.getTime() / 1000);
  planModal.completed = planModal.completed ? 1 : 0;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(`${config.server}/plans/plan`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ ...planModal, timezone }),
  });
  const data = await response.json();

  return data;
}

async function deletePlan(planId) {
  const response = await fetch(`${config.server}/plans/plan`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ planId }),
    credentials: "include",
  });

  const data = await response.json();

  return data;
}

async function patchPlanStatus(planId, completed) {
  const planInfo = {
    plan_id: planId,
    completed: completed ? 0 : 1,
  };
  const response = await fetch(`${config.server}/plans/plan/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(planInfo),
  });

  const data = await response.json();

  return data;
}

async function postPlanShare(users, planId) {
  if (!users.length || !planId) return { success: false };

  const response = await fetch(`${config.server}/plans/plan/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ users, planId }),
  });
  const data = await response.json();

  return data;
}

async function deletePlanShare(targetId, planId) {
  if (!targetId || !planId) return { success: false };

  const response = await fetch(`${config.server}/plans/plan/share`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ targetId, planId }),
  });
  const data = await response.json();

  return data;
}

async function postPlanShareRespond(notificationId, accepted) {
  if (!notificationId) return { success: false };

  const response = await fetch(`${config.server}/plans/plan/share/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ notificationId, accepted }),
  });
  const data = await response.json();

  return data;
}

async function getPlansPlanUsers(planId) {
  if (!planId) return { success: false };

  const response = await fetch(
    `${config.server}/plans/plan/users?planId=${planId}`,
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
