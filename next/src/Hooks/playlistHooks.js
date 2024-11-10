import {
  getPlaylistsYoutube,
  getPlaylistsSpotify,
  getSpotifyInfo,
  getPlaylistsYoutubeItems,
} from "@/Api/playlistsApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useAccountGoogle } from "./accountHooks";

function usePlaylistsSpotify() {
  const { spotifyInfo } = useSpotifyInfo();

  const queryResult = useQuery({
    queryKey: [`usePlaylistsSpotify`],
    queryFn: getPlaylistsSpotify,
    staleTime: 1000 * 60 * 10,
    enabled: !!spotifyInfo,
  });

  const { data: playlistsSpotifyData, isLoading: playlistsSpotifyIsLoading } =
    queryResult;

  return {
    playlistsSpotifyData,
    playlistsSpotifyIsLoading,
    ...queryResult,
  };
}

function useSpotifyInfo() {
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`useSpotifyInfo`],
    queryFn: getSpotifyInfo,
    staleTime: 1000 * 60 * 10,
    enabled: !!accountData,
  });

  const { data: spotifyInfoData, isLoading: spotifyInfoIsLoading } =
    queryResult;

  const spotifyInfo = spotifyInfoData?.success
    ? spotifyInfoData?.data?.spotifyInfo
    : null;

  return {
    spotifyInfoData,
    spotifyInfoIsLoading,
    spotifyInfo,
    ...queryResult,
  };
}

function usePlaylistsYoutube() {
  const { accountGoogleData } = useAccountGoogle();

  const queryResult = useQuery({
    queryKey: [`usePlaylistsYoutube`],
    queryFn: getPlaylistsYoutube,
    staleTime: 1000 * 60 * 10,
    enabled: !!accountGoogleData?.success,
  });

  const { data: playlistsYoutubeData, isLoading: playlistsYoutubeIsLoading } =
    queryResult;

  return {
    playlistsYoutubeData,
    playlistsYoutubeIsLoading,
    ...queryResult,
  };
}

function usePlaylistsYoutubeItems(playlistId) {
  const queryResult = useQuery({
    queryKey: [`usePlaylistsYoutubeItems`, playlistId],
    queryFn: () => getPlaylistsYoutubeItems(playlistId),
    staleTime: 1000 * 60 * 10,
    enabled: !!playlistId,
  });

  const {
    data: playlistsYoutubeItemsData,
    isLoading: playlistsYoutubeItemsIsLoading,
  } = queryResult;

  return {
    playlistsYoutubeItemsData,
    playlistsYoutubeItemsIsLoading,
    ...queryResult,
  };
}

export {
  useSpotifyInfo,
  usePlaylistsSpotify,
  usePlaylistsYoutube,
  usePlaylistsYoutubeItems,
};
