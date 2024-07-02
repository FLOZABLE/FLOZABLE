import config from "@/app/utils/config";
import { useQuery } from "@tanstack/react-query";

async function getFriendsRanking() {
  const response = await fetch(`${config.server}/ranking/friends`, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = response.json();
  return data;
}

async function getRecommendedFriends() {
  const response = await fetch(`${config.server}/friend/recommended`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();

  return data;
}

async function getSearchedUsers(searchQuery) {
  if (!searchQuery || !searchQuery.length) return { success: true, users: [] };

  const response = await fetch(
    `${config.server}/friend/search?query=${searchQuery}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );
  const data = await response.json();

  return data;
};

function useSearchedUsers(searchQuery) {
  return useQuery({
    queryKey: [`searchedUsers`, searchQuery],
    queryFn: () => getSearchedUsers(searchQuery),
    staleTime: 1000 * 10,
    retryDelay: 1000 * 3,
  });
}

export { getFriendsRanking, getRecommendedFriends, getSearchedUsers, useSearchedUsers };
