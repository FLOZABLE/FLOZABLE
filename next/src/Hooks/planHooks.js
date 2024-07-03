import { getPlan } from "@/Api/planApi";
import { useQuery } from "@tanstack/react-query";

function usePlan(userInfo) {
  return useQuery({
    queryKey: [`usePlan`],
    queryFn: getPlan,
    staleTime: 1000 * 60,
    enabled: !!userInfo
  });
}

export { usePlan };
