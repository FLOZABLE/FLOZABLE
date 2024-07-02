import { getRankingUser } from "@/Api/rankingApi";
import { useQuery } from "@tanstack/react-query";

function useRankingUser(userId, mode, viewDate) {
  return useQuery({
    queryKey: [`extensionUsage`, userId, mode, viewDate],
    queryFn: () => getRankingUser(userId, mode, viewDate),
    staleTime: 1000 * 60,
    enabled: !!userId && !!mode && !!viewDate,
  });
}

export { useRankingUser };
