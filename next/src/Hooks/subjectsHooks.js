import { getSubjects, getSubjectUsers } from "@/Api/subjectsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";
import { useCallback } from "react";
import { calculateTimeToMidnight, updateQueryData } from "@/app/utils/Tool";

function useSubjects() {
  const queryClient = useQueryClient();

  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`useSubjects`],
    queryFn: getSubjects,
    staleTime: 1000 * 60 * 10,
    enabled: !!accountData,
    select: (response) =>
      response?.data
        ? {
            subjects: response.data.subjects,
            groupedSubjects: response.data.groupedSubjects,
          }
        : { subjects: [], groupedSubjects: {} },
    placeholderData: { subjects: [], groupedSubjects: {} },
    refetchIntervalInBackground: true,
    refetchInterval: calculateTimeToMidnight,
  });

  const {
    data: subjectsData,
    refetch: subjectsRefetch,
    isLoading: subjectsIsLoading,
  } = queryResult;

  const { subjects, groupedSubjects } = subjectsData;

  const updateSubjects = useCallback(async (newData) => {
    await queryClient.setQueryData(["useSubjects"], (oldData) => {
      return updateQueryData(oldData, newData, "subjects");
    });
  }, []);

  return {
    subjects,
    groupedSubjects,
    subjectsData,
    subjectsRefetch,
    subjectsIsLoading,
    updateSubjects,
    ...queryResult,
  };
}

function useSubjectUsers(subjectId) {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useSubjectUsers`, subjectId],
    queryFn: () => getSubjectUsers(subjectId),
    staleTime: 1000 * 60 * 10,
    enabled: !!false,
  });

  const clearSubjectUsers = () => {
    queryClient.resetQueries({ queryKey: ["useSubjectUsers", subjectId] });
  };

  const {
    data: subjectUsersData,
    refetch: subjectUsersRefetch,
    isLoading: subjectUsersIsLoading,
  } = queryResult;

  return {
    subjectUsersData,
    subjectUsersRefetch,
    subjectUsersIsLoading,
    clearSubjectUsers,
    ...queryResult,
  };
}

export { useSubjects, useSubjectUsers };
