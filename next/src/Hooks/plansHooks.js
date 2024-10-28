import { getPlans, getPlansGoogle, getPlansPlanUsers } from "@/Api/plansApi";
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

function usePlansGoogle() {
  const { userInfo } = useContext(UserInfoContext);

  const queryResult = useQuery({
    queryKey: [`usePlansGoogle`],
    queryFn: getPlansGoogle,
    staleTime: 1000 * 60 * 10,
    enabled: !!userInfo,
  });

  const {
    data: plansGoogleData,
    isLoading: plansDataIsLoading,
    refetch: plansGoogleRefetch,
  } = queryResult;

  return {
    plansGoogleData,
    plansDataIsLoading,
    plansGoogleRefetch,
    ...queryResult,
  };
}

function usePlanUsers(planId, isEditable) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`usePlanUsers`, planId],
    queryFn: () => getPlansPlanUsers(planId),
    staleTime: 1000 * 60 * 10,
    enabled: !!planId && planId !== "0000000000" && isEditable,
  });

  const clearPlanUsers = () => {
    queryClient.removeQueries({ queryKey: ["usePlanUsers", planId] });
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

export { usePlans, usePlansGoogle, usePlanUsers };
