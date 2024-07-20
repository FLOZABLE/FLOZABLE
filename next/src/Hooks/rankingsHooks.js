import { getRankings, getRankingsUser } from "@/Api/rankingsApi";
import { useQuery } from "@tanstack/react-query";

function useRankings(mode, viewDate) {
  console.log(mode, viewDate)
  return useQuery({
    queryKey: [`useRankings`, mode, viewDate],
    queryFn: () => getRankings(mode, viewDate),
    staleTime: 1000 * 1,
    enabled: !!mode && !!viewDate,
  });
}

function useRankingsUser(userId, mode, viewDate) {
  return useQuery({
    queryKey: [`useRankingsUser`, userId, mode, viewDate],
    queryFn: () => getRankingsUser(userId, mode, viewDate),
    staleTime: 1000 * 60,
    enabled: !!userId && !!mode && !!viewDate,
  });
}

export { useRankings, useRankingsUser };
