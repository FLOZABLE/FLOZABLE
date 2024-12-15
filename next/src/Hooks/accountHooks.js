import {
  getAccount,
  getAccountGoogle,
  getAccountProfile,
} from "@/Api/accountApi";
import { updateQueryData } from "@/app/utils/Tool";
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
    error: accountError,
  } = queryResult;

  const clearAccountData = useCallback(() => {
    queryClient.removeQueries({ queryKey: "useAccount" });
  }, []);

  const updateUserInfo = useCallback(async (newData) => {
    await queryClient.setQueryData(["useAccount"], (oldData) => {
      return updateQueryData(oldData, newData, "userInfo");
    });
  }, []);

  return {
    accountData,
    accountRefetch,
    accountError,
    accountIsLoading,
    clearAccountData,
    updateUserInfo,
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
    select: (response) => response?.data?.googleInfo ?? false,
  });

  const {
    data: accountGoogleData,
    refetch: accountGoogleRefetch,
    error: accountGoogleError,
    isLoading: accountGoogleIsLoading,
  } = queryResult;

  return {
    accountGoogleData,
    accountGoogleRefetch,
    accountGoogleError,
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
    select: (response) => response?.data ?? false,
  });

  const {
    data: accountProfileData,
    isLoading: accountProfileIsLoading,
    error: accountProfileError,
  } = queryResult;

  return {
    accountProfileData,
    accountProfileIsLoading,
    accountProfileError,
    ...queryResult,
  };
}

export { useAccount, useAccountGoogle, useAccountProfile };
