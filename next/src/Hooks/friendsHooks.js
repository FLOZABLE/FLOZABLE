import {
  getFriendsRecommended,
  getFriendsSearch,
  getFriendsStatus,
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

function useFriendsStatus() {
  const { userInfo } = useAccount();

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
  useGetFriendsTrends,
  useFriendsRecommended,
  useFriendsStatus,
};
