import { getPlans, getPlansGoogle, getPlansPlanUsers } from "@/Api/plansApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function usePlans() {
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`usePlans`],
    queryFn: getPlans,
    staleTime: 1000 * 60 * 10,
    enabled: !!accountData,
    select: (response) => {
      if (!response?.data?.plans) {
        return [];
      }

      const plans = [...response.data.plans].map((plan) => {
        plan.start = new Date(plan.start);
        plan.end = new Date(plan.end);
        return plan;
      });
      return plans;
    },
    placeholderData: [],
  });

  const {
    data: plans,
    isLoading: plansIsLoading,
    refetch: plansRefetch,
  } = queryResult;

  return {
    plans,
    plansIsLoading,
    plansRefetch,
    ...queryResult,
  };
}

function usePlansGoogle() {
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`usePlansGoogle`],
    queryFn: getPlansGoogle,
    staleTime: 1000 * 60 * 10,
    enabled: !!accountData,
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
