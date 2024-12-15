import {
  getFriends,
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsStatus,
  getFriendsTrends,
} from "@/Api/friendsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";
import { useCallback } from "react";
import { updateQueryData } from "@/app/utils/Tool";

function useFriends() {
  const queryClient = useQueryClient();

  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`useFriends`],
    queryFn: () => getFriends(),
    staleTime: 1000 * 10,
    enabled: !!accountData,
    select: (response) => response?.data?.friends || [],
    placeholderData: [],
  });

  const { data: friendsData } = queryResult;

  const updateFriendsData = useCallback(async (newData) => {
    await queryClient.setQueryData(["useFriends"], (oldData) => {
      return updateQueryData(oldData, newData, "friends");
    });
  }, []);

  return { friendsData, updateFriendsData, ...queryResult };
}

function useFriendsSearch(searchQuery) {
  const queryResult = useQuery({
    queryKey: [`getFriendsSearch`, searchQuery],
    queryFn: () => getFriendsSearch(searchQuery),
    staleTime: 1000 * 10,
    retryDelay: 1000 * 3,
    enabled: searchQuery?.length >= 2,
    select: (response) => response?.data?.users || [],
    placeholderData: [],
  });

  const {
    data: friendsSearchData,
    isLoading: friendsSearchIsLoading,
    error: friendsSearchError,
  } = queryResult;

  return {
    friendsSearchData,
    friendsSearchIsLoading,
    friendsSearchError,
    ...queryResult,
  };
}

function useFriendsTrends() {
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`getFriendsTrends`],
    queryFn: () => getFriendsTrends(),
    staleTime: 1000 * 60,
    enabled: !!accountData,
    select: (response) => response?.data?.trends || [],
    placeholderData: [],
  });

  const {
    data: friendsTrendData,
    isLoading: friendsTrendsIsLoading,
    refetch: friendsTrendRefetch,
    error: friendsTrendError,
  } = queryResult;

  return {
    ...queryResult,
    friendsTrendData,
    friendsTrendsIsLoading,
    friendsTrendError,
    friendsTrendRefetch,
  };
}

function useFriendsRecommended() {
  const queryResult = useQuery({
    queryKey: [`friendsRecommended`],
    queryFn: getFriendsRecommended,
    select: (response) => response?.data?.users ?? [],
    placeholderData: [],
  });

  const {
    data: friendsRecommendedData,
    isLoading: friendsRecommendedIsLoading,
    refetch: friendsRecommendedRefetch,
  } = queryResult;

  return {
    friendsRecommendedData,
    friendsRecommendedIsLoading,
    friendsRecommendedRefetch,
    ...queryResult,
  };
}

function useFriendsStatus() {
  const queryClient = useQueryClient();
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`useFriendsStatus`],
    queryFn: getFriendsStatus,
    staleTime: 60 * 30,
    enabled: !!accountData,
    select: (response) => response?.data?.friends ?? [],
    placeholderData: [],
  });

  const {
    data: friendsStatus,
    isLoading: friendsStatusIsLoading,
    error: friendsStatusError,
    refetch: friendsStatusRefetch,
  } = queryResult;

  const updateFriendsStatus = useCallback(async (newData) => {
    await queryClient.setQueryData(["useFriendsStatus"], (oldData) => {
      return updateQueryData(oldData, newData, "friends");
    });
  }, []);

  return {
    ...queryResult,
    friendsStatus,
    friendsStatusError: accountData ? true : true,
    friendsStatusIsLoading,
    updateFriendsStatus,
    friendsStatusRefetch,
  };
}

export {
  useFriends,
  useFriendsSearch,
  useFriendsTrends,
  useFriendsRecommended,
  useFriendsStatus,
};
