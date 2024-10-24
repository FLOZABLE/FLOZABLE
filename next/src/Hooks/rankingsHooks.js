import {
  getRankings,
  getRankingsFriends,
  getRankingsUser,
} from "@/Api/rankingsApi";
import { useQuery } from "@tanstack/react-query";

function useRankings(mode, viewDate) {
  const queryClient = useQuery({
    queryKey: [`getRankings`, mode, viewDate],
    queryFn: () => getRankings(mode, viewDate),
    staleTime: 1000 * 60 * 5,
    enabled: !!mode && !!viewDate,
  });

  const { data: useRankingsData, isLoading: useRankingsIsLoading } =
    queryClient;

  return { useRankingsData, useRankingsIsLoading, ...queryClient };
}

function useGetRankingsUser(userId, mode, viewDate) {
  return useQuery({
    queryKey: [`getRankingsUser`, userId, mode, viewDate],
    queryFn: () => getRankingsUser(userId, mode, viewDate),
    staleTime: 1000 * 60,
    enabled: !!userId && !!mode && !!viewDate,
  });
}

function useRankingsFriends(mode) {
  return useQuery({
    queryKey: [`getRankingsFriends`, mode],
    queryFn: () => getRankingsFriends(mode),
    staleTime: 1000 * 60,
    enabled: !!mode,
  });
}

export { useRankings, useGetRankingsUser, useRankingsFriends };
