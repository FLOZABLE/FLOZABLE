import { getGroupMembers, getGroups } from "@/Api/groupsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

function useGroups() {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useGroups`],
    queryFn: getGroups,
    staleTime: 1000 * 60 * 5,
    select: (response) =>
      response?.data?.my_groups
        ? { my_groups: response.data.my_groups, groups: response.data.groups }
        : { my_groups: [], groups: [] },
    placeholderData: { my_groups: [], groups: [] },
  });

  const {
    data: groupsData,
    isLoading: groupsIsLoading,
    refetch: groupsRefetch,
  } = queryResult;

  const { groups, my_groups: myGroups } = groupsData;

  const updateGroupsData = useCallback(async (newData) => {
    await queryClient.setQueryData(["useGroups"], (oldData) => {
      if (!oldData) return newData;
      return typeof newData === "function"
        ? newData(oldData)
        : { ...oldData, ...newData };
    });
  }, []);

  return {
    groupsData,
    groups,
    myGroups,
    groupsIsLoading,
    groupsRefetch,
    updateGroupsData,
    ...queryResult,
  };
}

function useGroupMembers(groupId, isActive) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useGroupMembers`, groupId],
    queryFn: () => getGroupMembers(groupId),
    staleTime: 1000 * 5,
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

export { useGroups, useGroupMembers };
