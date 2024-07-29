import { getPlans } from "@/Api/plansApi";
import { useQuery } from "@tanstack/react-query";

function usePlan(userInfo) {
  return useQuery({
    queryKey: [`usePlan`],
    queryFn: getPlans,
    staleTime: 1000 * 60,
    enabled: !!userInfo
  });
}

export { usePlan };
