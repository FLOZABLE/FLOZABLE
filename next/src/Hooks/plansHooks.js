import { getPlans, getPlansGoogle, getPlansPlanUsers } from "@/Api/plansApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";
import { DateTime } from "luxon";

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

function usePlansGoogle(date) {
  const { accountData } = useAccount();

  const dateTime = DateTime.fromJSDate(date)
    .startOf("day")
    .startOf("month")
    .toISODate();

  const queryResult = useQuery({
    queryKey: [`usePlansGoogle`, dateTime],
    queryFn: () => getPlansGoogle(dateTime),
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
    data: plansGoogle,
    isLoading: plansGoogleIsLoading,
    refetch: plansGoogleRefetch,
  } = queryResult;

  return {
    plansGoogle,
    plansGoogleIsLoading,
    plansGoogleRefetch,
    ...queryResult,
  };
}

function useCombinedPlans(date) {
  const { plans, plansIsLoading, plansRefetch } = usePlans();
  const { plansGoogle, plansGoogleIsLoading, plansGoogleRefetch } =
    usePlansGoogle(date);

  const combinedPlans = [...plans, ...plansGoogle].sort(
    (a, b) => a.start - b.start
  );

  const isLoading = plansIsLoading || plansGoogleIsLoading;

  const refetchPlans = async () => {
    await Promise.all([plansRefetch(), plansGoogleRefetch()]);
  };

  return {
    combinedPlans,
    isLoading,
    refetchPlans,
    plansIsLoading,
    plansGoogleIsLoading,
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

export { usePlans, usePlansGoogle, useCombinedPlans, usePlanUsers };
