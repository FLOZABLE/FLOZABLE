import {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsTrends,
} from "@/Api/friendsApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useGetFriendsSearch(searchQuery) {
  return useQuery({
    queryKey: [`getFriendsSearch`, searchQuery],
    queryFn: () => getFriendsSearch(searchQuery),
    staleTime: 1000 * 10,
    retryDelay: 1000 * 3,
  });
}

function useGetFriendsTrends() {
  const { userInfo } = useAccount();

  return useQuery({
    queryKey: [`getFriendsTrends`],
    queryFn: () => getFriendsTrends(),
    staleTime: 1000 * 1,
    enabled: !!userInfo,
  });
}

function useFriendsRecommended(refresh) {
  const { userInfo } = useAccount();
  
  return useQuery({
    queryKey: [`getFriendsRecommended`],
    queryFn: getFriendsRecommended,
    enabled: !!refresh || !!userInfo,
  });
}

export { useGetFriendsSearch, useGetFriendsTrends, useFriendsRecommended };
