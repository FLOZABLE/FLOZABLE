import { getGroupMembers, getGroups } from "@/Api/groupsApi";
import { useQuery } from "@tanstack/react-query";

function useGetGroups() {
  return useQuery({
    queryKey: [`getGroups`],
    queryFn: getGroups,
    staleTime: 1000 * 60,
  });
}

function useGroupMembers(groupId, isActive) {
  const queryResult = useQuery({
    queryKey: [`getGroups`, groupId],
    queryFn: () => getGroupMembers(groupId),
    staleTime: 1000 * 60 * 3,
    enabled: !!groupId && !!isActive
  });

  const { data: groupMembersData, isLoading: groupMembersIsLoading } =
    queryResult;

  return {
    groupMembersData,
    groupMembersIsLoading,
    ...queryResult,
  };
}

export { useGetGroups, useGroupMembers };
