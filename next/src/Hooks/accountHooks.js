import {
  getAccount,
  getAccountGoogle,
  getAccountProfile,
  getAccountProfileSubjects,
} from "@/Api/accountApi";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";

function useAccount() {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useAccount`],
    queryFn: getAccount,
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: accountData,
    refetch: accountRefetch,
    isLoading: accountIsLoading,
  } = queryResult;

  const clearAccountData = () => {
    queryClient.removeQueries({ queryKey: "useAccount" });
  };

  return {
    accountData,
    accountRefetch,
    accountIsLoading,
    clearAccountData,
    ...queryResult,
  };
}

function useAccountGoogle() {
  const { userInfo } = useContext(UserInfoContext);

  const queryResult = useQuery({
    queryKey: [`useAccountGoogle`],
    queryFn: getAccountGoogle,
    staleTime: 1000 * 60 * 10,
    enabled: !!userInfo,
  });

  const {
    data: accountGoogleData,
    refetch: accountGoogleRefetch,
    isLoading: accountGoogleIsLoading,
  } = queryResult;

  const googleInfo = accountGoogleData?.data?.googleInfo;

  return {
    googleInfo,
    accountGoogleData,
    accountGoogleRefetch,
    accountGoogleIsLoading,
    ...queryResult,
  };
}

function useAccountProfile(userId) {
  const queryResult = useQuery({
    queryKey: [`useAccountProfile`, userId],
    queryFn: () => getAccountProfile(userId),
    staleTime: 1000 * 60 * 10,
    enabled: !!userId,
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

export {
  useAccount,
  useAccountGoogle,
  useAccountProfile,
  useAccountProfileSubjects,
};
