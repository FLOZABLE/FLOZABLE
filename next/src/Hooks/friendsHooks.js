import {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsStatus,
  getFriendsTrends,
} from "@/Api/friendsApi";
import { useQuery } from "@tanstack/react-query";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useContext } from "react";

function useFriendsSearch(searchQuery) {
  const queryResult = useQuery({
    queryKey: [`getFriendsSearch`, searchQuery],
    queryFn: () => getFriendsSearch(searchQuery),
    staleTime: 1000 * 10,
    retryDelay: 1000 * 3,
    enabled: !!searchQuery && searchQuery !== "",
  });

  const { data: friendsSearchData } = queryResult;

  return { friendsSearchData, ...queryResult };
}

function useFriendsTrends() {
  const { userInfo } = useContext(UserInfoContext);

  const queryResult = useQuery({
    queryKey: [`getFriendsTrends`],
    queryFn: () => getFriendsTrends(),
    staleTime: 1000 * 60,
    enabled: !!userInfo,
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
  const { userInfo } = useContext(UserInfoContext);

  const queryResult = useQuery({
    queryKey: [`getFriendsStatus`],
    queryFn: getFriendsStatus,
    enabled: !!userInfo,
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
