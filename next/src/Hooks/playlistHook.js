import { getPlaylistsSpotify, getSpotifyInfo } from "@/Api/playlistsApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useSpotifyInfo() {
  const { userInfo } = useAccount();
  const queryResult = useQuery({
    queryKey: [`useSpotifyInfo`],
    queryFn: getSpotifyInfo,
    staleTime: 1000 * 60 * 10,
    enabled: !!userInfo,
  });

  const { data: useSpotifyInfoData, isLoading: useSpotifyInfoIsLoading } =
    queryResult;

  const spotifyInfo = useSpotifyInfoData?.success
    ? useSpotifyInfoData.spotifyInfo
    : null;

  return {
    useSpotifyInfoData,
    useSpotifyInfoIsLoading,
    spotifyInfo,
    ...queryResult,
  };
}

function usePlaylistsSpotify() {
  const { spotifyInfo } = useSpotifyInfo();

  const queryResult = useQuery({
    queryKey: [`usePlaylistsSpotify`],
    queryFn: getPlaylistsSpotify,
    staleTime: 1000 * 60 * 10,
    enabled: !!spotifyInfo,
  });

  const {
    data: usePlaylistsSpotifyData,
    isLoading: usePlansPlanUsersIsLoading,
  } = queryResult;

  return {
    usePlaylistsSpotifyData,
    usePlansPlanUsersIsLoading,
    ...queryResult,
  };
}

export { useSpotifyInfo, usePlaylistsSpotify };
