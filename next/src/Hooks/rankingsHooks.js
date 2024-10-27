import {
  getRankings,
  getRankingsFriends,
  getRankingsUser,
} from "@/Api/rankingsApi";
import { useQuery } from "@tanstack/react-query";

function useRankings(mode, viewDate) {
  const queryResult = useQuery({
    queryKey: [`getRankings`, mode, viewDate],
    queryFn: () => getRankings(mode, viewDate),
    staleTime: 1000 * 60 * 5,
    enabled: !!mode && !!viewDate,
  });

  const { data: rankingsData, isLoading: rankingsIsLoading } = queryResult;

  return { rankingsData, rankingsIsLoading, ...queryResult };
}

function useRankingsUser(userId, mode, viewDate) {
  const queryResult = useQuery({
    queryKey: [`getRankingsUser`, userId, mode, viewDate],
    queryFn: () => getRankingsUser(userId, mode, viewDate),
    staleTime: 1000 * 60,
    enabled: !!userId && !!mode && !!viewDate,
  });

  const { data: rankingsUserData, isLoading: rankingsUserIsLoading } =
    queryResult;

  return { rankingsUserData, rankingsUserIsLoading, ...queryResult };
}

function useRankingsFriends(mode) {
  return useQuery({
    queryKey: [`getRankingsFriends`, mode],
    queryFn: () => getRankingsFriends(mode),
    staleTime: 1000 * 60,
    enabled: !!mode,
  });
}

export { useRankings, useRankingsUser, useRankingsFriends };
