import { getExtensionSettings, getExtensionUsage } from "@/Api/extensionApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useExtensionSettings() {
  const { userInfo } = useAccount();
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
  const { userInfo } = useAccount();
  return useQuery({
    queryKey: [`extensionUsage`, date, mode],
    queryFn: () => getExtensionUsage(date, mode),
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });
}

export { useExtensionSettings, useExtensionUsage };
