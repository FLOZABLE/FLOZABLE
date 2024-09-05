import { getExtensionSettings, getExtensionUsage } from "@/Api/extensionApi";
import { useQuery } from "@tanstack/react-query";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useContext } from "react";

function useExtensionSettings() {
  const { userInfo } = useContext(UserInfoContext);
  const queryResult = useQuery({
    queryKey: [`getExtensionSettings`],
    queryFn: getExtensionSettings,
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });

  const {
    data: useExtensionSettingsData,
    isLoading: useExtensionSettingsIsLoading,
  } = queryResult;

  return {
    useExtensionSettingsData,
    useExtensionSettingsIsLoading,
    ...queryResult,
  };
}

function useExtensionUsage(date, mode) {
  const { userInfo } = useContext(UserInfoContext);

  return useQuery({
    queryKey: [`extensionUsage`, date, mode],
    queryFn: () => getExtensionUsage(date, mode),
    staleTime: 1000 * 0,
    enabled: !!userInfo,
    refetchOnWindowFocus: true,
  });
}

export { useExtensionSettings, useExtensionUsage };
