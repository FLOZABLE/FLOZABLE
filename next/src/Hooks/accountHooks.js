import {
  getAccount,
  getAccountGoogle,
  getAccountProfile,
  getAccountProfileSubjects,
} from "@/Api/accountApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

function useAccount() {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: [`useAccount`],
    queryFn: getAccount,
    staleTime: 1000 * 60 * 10,
    select: (response) => response?.data?.userInfo || false,
  });

  const {
    data: accountData,
    refetch: accountRefetch,
    isLoading: accountIsLoading,
  } = queryResult;

  const clearAccountData = useCallback(() => {
    queryClient.removeQueries({ queryKey: "useAccount" });
  }, []);

  const updateAccountUserInfo = useCallback(async (newData) => {
    await queryClient.setQueryData(["useAccount"], (oldData) => {
      if (!oldData?.success) return oldData;
      if (typeof newData === "function") {
        return {
          ...oldData,
          data: { ...oldData.data, userInfo: newData(oldData) },
        };
      }
      return { ...oldData, data: { ...oldData.data, userInfo: newData } };
    });
  }, []);

  return {
    accountData,
    accountRefetch,
    accountIsLoading,
    clearAccountData,
    updateAccountUserInfo,
    ...queryResult,
  };
}

function useAccountGoogle() {
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`useAccountGoogle`],
    queryFn: getAccountGoogle,
    staleTime: 1000 * 60 * 10,
    enabled: !!accountData,
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
