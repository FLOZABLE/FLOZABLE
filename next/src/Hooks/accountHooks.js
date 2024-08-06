import {
  getAccount,
  getAccountProfile,
  getAccountProfileSubjects,
} from "@/Api/accountApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function useAccount() {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useAccount`],
    queryFn: getAccount,
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: useAccountData,
    refetch: useAccountRefetch,
    isLoading: useAccountIsLoading,
  } = queryResult;

  const userInfo = useAccountData?.success ? useAccountData.userInfo : false;

  const clearAccountData = () => {
    queryClient.resetQueries(["useAccount"]);
    queryClient.removeQueries(["useAccount"]);
  };

  return {
    useAccountData,
    useAccountRefetch,
    useAccountIsLoading,
    userInfo,
    clearAccountData,
    ...queryResult,
  };
}

function useAccountProfile(userId) {
  const queryResult = useQuery({
    queryKey: [`useAccountProfile`, userId],
    queryFn: () => getAccountProfile(userId),
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: useAccountProfileData,
    isLoading: useAccountProfileDataIsLoading,
  } = queryResult;

  return {
    useAccountProfileData,
    useAccountProfileDataIsLoading,
    ...queryResult,
  };
}

function useAccountProfileSubjects(userId) {
  const queryResult = useQuery({
    queryKey: [`useAccountProfileSubjects`, userId],
    queryFn: () => getAccountProfileSubjects(userId),
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: useAccountProfileSubjectsData,
    isLoading: useAccountProfileSubjectsIsLoading,
  } = queryResult;

  return {
    useAccountProfileSubjectsData,
    useAccountProfileSubjectsIsLoading,
    ...queryResult,
  };
}

export { useAccount, useAccountProfile, useAccountProfileSubjects };
