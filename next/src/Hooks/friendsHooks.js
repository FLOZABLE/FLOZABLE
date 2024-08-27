import {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsStatus,
  getFriendsTrends,
} from "@/Api/friendsApi";
import { useQuery } from "@tanstack/react-query";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useContext } from "react";

function useGetFriendsSearch(searchQuery) {
  return useQuery({
    queryKey: [`getFriendsSearch`, searchQuery],
    queryFn: () => getFriendsSearch(searchQuery),
    staleTime: 1000 * 10,
    retryDelay: 1000 * 3,
  });
}

function useFriendsTrends() {
  const { userInfo } = useContext(UserInfoContext);

  const queryResult = useQuery({
    queryKey: [`getFriendsTrends`],
    queryFn: () => getFriendsTrends(),
    staleTime: 1000 * 60 ,
    enabled: !!userInfo,
  });

  const { refetch: friendsTrendRefetch } = queryResult;

  return { ...queryResult, friendsTrendRefetch };
}

function useFriendsRecommended(refresh) {
  const { userInfo } = useContext(UserInfoContext);

  return useQuery({
    queryKey: [`getFriendsRecommended`],
    queryFn: getFriendsRecommended,
    enabled: !!refresh || !!userInfo,
  });
}

function useFriendsStatus() {
  const { userInfo } = useContext(UserInfoContext);

  const queryResult = useQuery({
    queryKey: [`getFriendsStatus`],
    queryFn: getFriendsStatus,
    enabled: !!userInfo,
  });

  const { data: useFriendsStatusData, isLoading: useFriendsStatusIsLoading } =
    queryResult;

  return { useFriendsStatusData, useFriendsStatusIsLoading, ...queryResult };
}

export {
  useGetFriendsSearch,
  useFriendsTrends,
  useFriendsRecommended,
  useFriendsStatus,
};
