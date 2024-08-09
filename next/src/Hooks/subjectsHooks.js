import { getSubjects, getSubjectUsers } from "@/Api/subjectsApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useSubjects() {
  const { userInfo } = useAccount();

  const queryResult = useQuery({
    queryKey: [`useSubjects`],
    queryFn: getSubjects,
    staleTime: 1000 * 60 * 10,
    enabled: !!userInfo,
  });

  const {
    data: useSubjectsData,
    refetch: useSubjectsRefetch,
    isLoading: useSubjectsIsLoading,
  } = queryResult;

  return {
    useSubjectsData,
    useSubjectsRefetch,
    useSubjectsIsLoading,
    ...queryResult,
  };
}

function useSubjectUsers(subjectId) {
  const queryResult = useQuery({
    queryKey: [`useSubjectUsers`, subjectId],
    queryFn: () => getSubjectUsers(subjectId),
    staleTime: 1000 * 60 * 0,
    enabled: !!subjectId,
  });

  const {
    data: useSubjectUsersData,
    refetch: useSubjectUsersRefetch,
    isLoading: useSubjectUsersIsLoading,
  } = queryResult;

  return {
    useSubjectUsersData,
    useSubjectUsersRefetch,
    useSubjectUsersIsLoading,
    ...queryResult,
  };
}

export { useSubjects, useSubjectUsers };
