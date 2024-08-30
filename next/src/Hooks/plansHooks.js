import { getPlans, getPlansPlanUsers } from "@/Api/plansApi";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";

function usePlans() {
  const { userInfo } = useContext(UserInfoContext);

  const queryResult = useQuery({
    queryKey: [`usePlans`],
    queryFn: getPlans,
    staleTime: 1000 * 60 * 10,
    enabled: !!userInfo,
  });

  const {
    data: plansData,
    isLoading: plansIsLoading,
    refetch: plansRefetch,
  } = queryResult;

  return {
    plansData,
    plansIsLoading,
    plansRefetch,
    ...queryResult,
  };
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
    queryClient.removeQueries({ queryKey: ["usePlansPlanUsers", planId] });
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

export { usePlans, usePlansPlanUsers };
