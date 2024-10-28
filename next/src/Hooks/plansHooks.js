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

function usePlanUsers({ plan_id, isEditable, type }) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`usePlanUsers`, plan_id],
    queryFn: () => getPlansPlanUsers(plan_id),
    staleTime: 1000 * 60 * 10,
    enabled:
      !!plan_id && plan_id !== "0000000000" && isEditable && type !== "google",
  });

  const clearPlanUsers = () => {
    queryClient.removeQueries({ queryKey: ["usePlanUsers", plan_id] });
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
