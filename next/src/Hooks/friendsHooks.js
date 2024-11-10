import {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsStatus,
  getFriendsTrends,
} from "@/Api/friendsApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useFriendsSearch(searchQuery) {
  const queryResult = useQuery({
    queryKey: [`getFriendsSearch`, searchQuery],
    queryFn: () => getFriendsSearch(searchQuery),
    staleTime: 1000 * 10,
    retryDelay: 1000 * 3,
    enabled: searchQuery?.length >= 2,
  });

  const { data: friendsSearchData } = queryResult;

  return { friendsSearchData, ...queryResult };
}

function useFriendsTrends() {
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`getFriendsTrends`],
    queryFn: () => getFriendsTrends(),
    staleTime: 1000 * 60,
    enabled: !!accountData,
  });

  const {
    data: friendsTrendData,
    isLoading: friendsTrendsIsLoading,
    refetch: friendsTrendRefetch,
  } = queryResult;

  return {
    ...queryResult,
    friendsTrendData,
    friendsTrendsIsLoading,
    friendsTrendRefetch,
  };
}

function useFriendsRecommended() {
  const queryResult = useQuery({
    queryKey: [`friendsRecommended`],
    queryFn: getFriendsRecommended,
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
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`getFriendsStatus`],
    queryFn: getFriendsStatus,
    enabled: !!accountData,
  });

  const {
    data: friendsStatusData,
    isLoading: friendsStatusIsLoading,
    refetch: friendsStatusRefetch,
  } = queryResult;

  return {
    ...queryResult,
    friendsStatusData,
    friendsStatusIsLoading,
    friendsStatusRefetch,
  };
}

export {
  useFriendsSearch,
  useFriendsTrends,
  useFriendsRecommended,
  useFriendsStatus,
};
