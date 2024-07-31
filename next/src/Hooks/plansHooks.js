import { getPlans, getPlansPlanUsers } from "@/Api/plansApi";
import { useQuery } from "@tanstack/react-query";

function usePlan(userInfo) {
  return useQuery({
    queryKey: [`usePlan`],
    queryFn: getPlans,
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });
}

function usePlansPlanUsers(planId) {
  const queryResult = useQuery({
    queryKey: [`usePlansPlanUsers`, planId],
    queryFn: () => getPlansPlanUsers(planId),
    staleTime: 1000 * 0,
    enabled: !!planId,
  });

  const { data: usePlansPlanUsersData, isLoading: usePlansPlanUsersIsLoading } =
    queryResult;

  return { usePlansPlanUsersData, usePlansPlanUsersIsLoading, ...queryResult };
}

export { usePlan, usePlansPlanUsers };
