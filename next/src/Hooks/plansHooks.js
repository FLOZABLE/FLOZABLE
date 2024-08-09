import { getPlans, getPlansPlanUsers } from "@/Api/plansApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function usePlan(userInfo) {
  return useQuery({
    queryKey: [`usePlan`],
    queryFn: getPlans,
    staleTime: 1000 * 60 * 10,
    enabled: !!userInfo,
  });
}

function usePlansPlanUsers(planId) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`usePlansPlanUsers`, planId],
    queryFn: () => getPlansPlanUsers(planId),
    staleTime: 1000 * 60 * 10,
    enabled: !!planId,
  });

  const clearPlanUsers = () => {
    queryClient.removeQueries({ queryKey: "usePlansPlanUsers" });
  };

  const { data: usePlansPlanUsersData, isLoading: usePlansPlanUsersIsLoading } =
    queryResult;

  return {
    usePlansPlanUsersData,
    usePlansPlanUsersIsLoading,
    clearPlanUsers,
    ...queryResult,
  };
}

export { usePlan, usePlansPlanUsers };
