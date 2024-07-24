import {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsTrends,
} from "@/Api/friendsApi";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

function useGetFriendsSearch(searchQuery) {
  return useQuery({
    queryKey: [`getFriendsSearch`, searchQuery],
    queryFn: () => getFriendsSearch(searchQuery),
    staleTime: 1000 * 10,
    retryDelay: 1000 * 3,
  });
}

function useGetFriendsTrends() {
  const { userInfo } = useContext(UserInfoContext);

  return useQuery({
    queryKey: [`getFriendsTrends`],
    queryFn: () => getFriendsTrends(),
    staleTime: 1000 * 1,
    enabled: !!userInfo,
  });
}

function useGetFriendsRecommended() {
  return useQuery({
    queryKey: [`getFriendsRecommended`],
    queryFn: getFriendsRecommended,
  });
}

export { useGetFriendsSearch, useGetFriendsTrends, useGetFriendsRecommended };
