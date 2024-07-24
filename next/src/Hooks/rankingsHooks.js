import { getRankings, getRankingsFriends, getRankingsUser } from "@/Api/rankingsApi";
import { useQuery } from "@tanstack/react-query";

function useGetRankings(mode, viewDate) {
  return useQuery({
    queryKey: [`getRankings`, mode, viewDate],
    queryFn: () => getRankings(mode, viewDate),
    staleTime: 1000 * 60,
    enabled: !!mode && !!viewDate,
  });
}

function useGetRankingsUser(userId, mode, viewDate) {
  return useQuery({
    queryKey: [`getRankingsUser`, userId, mode, viewDate],
    queryFn: () => getRankingsUser(userId, mode, viewDate),
    staleTime: 1000 * 60,
    enabled: !!userId && !!mode && !!viewDate,
  });
}

function useGetRankingsFriends(mode) {
  return useQuery({
    queryKey: [`getRankingsFriends`, mode],
    queryFn: () => getRankingsFriends(mode),
    staleTime: 1000 * 60,
    enabled: !!mode,
  });
}

export { useGetRankings, useGetRankingsUser, useGetRankingsFriends };
