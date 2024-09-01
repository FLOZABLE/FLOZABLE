import { getGroupMembers, getGroups } from "@/Api/groupsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function useGetGroups() {
  return useQuery({
    queryKey: [`useGetGroups`],
    queryFn: getGroups,
    staleTime: 1000 * 60,
  });
}

function useGroupMembers(groupId, isActive) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useGroupMembers`, groupId],
    queryFn: () => getGroupMembers(groupId),
    staleTime: 1000 * 60 * 3,
    enabled: !!groupId && !!isActive,
  });

  const { data: groupMembersData, isLoading: groupMembersIsLoading } =
    queryResult;

  const clearGroupMembersData = () => {
    queryClient.removeQueries({ queryKey: ["useGroupMembers", groupId] });
  };

  return {
    groupMembersData,
    groupMembersIsLoading,
    clearGroupMembersData,
    ...queryResult,
  };
}

export { useGetGroups, useGroupMembers };
