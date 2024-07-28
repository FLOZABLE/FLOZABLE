import { getExtensionUsage } from "@/Api/extensionApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useExtensionUsage(date, mode) {
  const { userInfo } = useAccount();
  return useQuery({
    queryKey: [`extensionUsage`, date, mode],
    queryFn: () => getExtensionUsage(date, mode),
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });
}

export { useExtensionUsage };
