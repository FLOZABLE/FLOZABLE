import { getRankingsUser } from "@/Api/rankingsApi";
import { useQuery } from "@tanstack/react-query";

function useRankingsUser(userId, mode, viewDate) {
  return useQuery({
    queryKey: [`rankingsUser`, userId, mode, viewDate],
    queryFn: () => getRankingsUser(userId, mode, viewDate),
    staleTime: 1000 * 60,
    enabled: !!userId && !!mode && !!viewDate,
  });
}

export { useRankingsUser };
