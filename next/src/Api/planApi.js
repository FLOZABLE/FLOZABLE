const { default: config } = require("@/app/utils/config");
const { useQuery } = require("@tanstack/react-query");

async function postPlanShare(users, planId, callback = () => {}) {
  /* const { data } = useQuery({
    queryKey: [`postPlanShare`, users, planId],
    enabled: users.length && planId !== null,
    queryFn: () => getGuestInformation(users, planId),
  });


  const response = await fetch(
    "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
    options
  )
    .then((response) => response.json())
    .catch((err) => console.error(err));

  return response; */
  console.log(users, planId);
  if (!users.length || !planId) return callback({ success: false });

  const response = await fetch(`${config.server}/plan/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ users, planId }),
  });
  const data = await response.json();

  return callback(data);
};

async function deletePlanShare(targetId, planId, callback = () => {}) {
  if (!targetId || !planId) return callback({ success: false });

  const response = await fetch(`${config.server}/plan/share`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ targetId, planId }),
  });
  const data = await response.json();

  return callback(data);
};

async function postPlanShareRespond(planId, accepted) {
  if (!planId) return ({ success: false });

  const response = await fetch(`${config.server}/plan/share/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ planId, accepted }),
  });
  const data = await response.json();

  console.log(data)

  return data;
}

export { postPlanShare, postPlanShareRespond, deletePlanShare };
