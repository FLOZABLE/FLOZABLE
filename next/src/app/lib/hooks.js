const { getRecommendedFriends } = require("@/Api/friendsApi");
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

export { useRecommendedFriends };
