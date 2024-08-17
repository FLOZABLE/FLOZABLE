import { getSubjects, getSubjectUsers } from "@/Api/subjectsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useContext } from "react";

function useSubjects() {
  const { userInfo } = useContext(UserInfoContext);

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
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useSubjectUsers`, subjectId],
    queryFn: () => getSubjectUsers(subjectId),
    staleTime: 1000 * 60 * 10,
    enabled: !!subjectId,
  });

  const clearSubjectUsers = () => {
    queryClient.resetQueries({ queryKey: ["useSubjectUsers", subjectId] });
  };

  const {
    data: useSubjectUsersData,
    refetch: useSubjectUsersRefetch,
    isLoading: useSubjectUsersIsLoading,
  } = queryResult;

  return {
    useSubjectUsersData,
    useSubjectUsersRefetch,
    useSubjectUsersIsLoading,
    clearSubjectUsers,
    ...queryResult,
  };
}

export { useSubjects, useSubjectUsers };
