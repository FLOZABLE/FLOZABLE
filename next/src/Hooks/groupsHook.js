import { getGroups } from "@/Api/groupsApi";
import { useQuery } from "@tanstack/react-query";

function useGetGroups() {
  return useQuery({
    queryKey: [`getGroups`],
    queryFn: getGroups,
    staleTime: 1000 * 60
  });
}

export { useGetGroups };
