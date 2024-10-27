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
    data: subjectsData,
    refetch: subjectsRefetch,
    isLoading: useSubjectsIsLoading,
  } = queryResult;

  return {
    subjectsData,
    subjectsRefetch,
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
