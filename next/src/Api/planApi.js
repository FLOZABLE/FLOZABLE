import config from "@/app/utils/config";

async function postPlanShare(users, planId) {
  if (!users.length || !planId) return { success: false };

  const response = await fetch(`${config.server}/plan/share`, {
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

  const response = await fetch(`${config.server}/plan/share`, {
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

async function postPlanShareRespond(planId, accepted) {
  if (!planId) return { success: false };

  const response = await fetch(`${config.server}/plan/share/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ planId, accepted }),
  });
  const data = await response.json();

  return data;
}

export { postPlanShare, postPlanShareRespond, deletePlanShare };
