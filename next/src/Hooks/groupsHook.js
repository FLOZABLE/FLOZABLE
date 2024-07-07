import { getGroups } from "@/Api/groupsApi";
import { useQuery } from "@tanstack/react-query";

function useGroups() {
  return useQuery({
    queryKey: [`useGroups`],
    queryFn: getGroups,
    staleTime: 1000 * 60
  });
}

export { useGroups };
