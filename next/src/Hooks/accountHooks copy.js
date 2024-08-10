import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";
import { getSpotifyInfo } from "@/Api/playlistsApi";

function useSpotifyInfo() {
  const { userInfo } = useAccount();

  const queryResult = useQuery({
    queryKey: [`useSpotifyInfo`],
    queryFn: getSpotifyInfo,
    staleTime: 1000 * 60 * 20,
    enabled: !!userInfo,
  });

  const { data: useSpotifyInfoData, isLoading: useSpotifyInfoDataIsLoading } =
    queryResult;

  return {
    useSpotifyInfoData,
    useSpotifyInfoDataIsLoading,
    ...queryResult,
  };
}

export { useSpotifyInfo };
