const { getRecommendedFriends, getFriendsRanking } = require("@/Api/friendsApi");
const { useQuery } = require("@tanstack/react-query");

const useRecommendedFriends = (refresh) => {
  const data =  useQuery({
    queryKey: ["recommendedFriends", refresh],
    queryFn: getRecommendedFriends,
    enabled: !!refresh,
  });
  console.log(data)
  return data;
};

async function useFriendsRanking() {
  const { data, isLoading } = useQuery({
    queryKey: [`friendTrend`],
    queryFn: () => getFriendsRanking(),
  });

  return {data, isLoading};
};

export { useRecommendedFriends, useFriendsRanking };
