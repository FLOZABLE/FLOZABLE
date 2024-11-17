import { getExtensionSettings, getExtensionUsage } from "@/Api/extensionApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useExtensionSettings() {
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`getExtensionSettings`],
    queryFn: getExtensionSettings,
    staleTime: 1000 * 60,
    enabled: !!accountData,
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
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`extensionUsage`, date, mode],
    queryFn: () => getExtensionUsage(date, mode),
    staleTime: 1000 * 5,
    enabled: !!accountData,
    refetchOnWindowFocus: true,
  });

  const { data: extensionUsageData, isLoading: extensionUsageIsLoading } =
    queryResult;

  return { extensionUsageData, extensionUsageIsLoading, ...queryResult };
}

export { useExtensionSettings, useExtensionUsage };
