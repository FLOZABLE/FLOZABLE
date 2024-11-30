import { getGroupMembers, getGroups } from "@/Api/groupsApi";
import { updateQueryData } from "@/app/utils/Tool";
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

  const updateGroupsData = useCallback(async (newData, type = "groups") => {
    await queryClient.setQueryData(["useGroups"], (oldData) => {
      return updateQueryData(oldData, newData, type);
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
    staleTime: 1000 * 10,
    enabled: !!groupId && !!isActive,
    select: (response) => response?.data?.members ?? [],
    placeholderData: [],
  });

  const { data: groupMembersData, isLoading: groupMembersIsLoading } =
    queryResult;

  const updateGroupMembers = useCallback(async (newData, groupId) => {
    console.log(groupId);
    await queryClient.setQueryData(["useGroupMembers", groupId], (oldData) => {
      return updateQueryData(oldData, newData, "members");
    });
  }, []);

  return {
    groupMembersData,
    groupMembersIsLoading,
    updateGroupMembers,
    ...queryResult,
  };
}

export { useGroups, useGroupMembers };
