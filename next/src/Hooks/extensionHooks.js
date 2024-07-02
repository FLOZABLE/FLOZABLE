import { getExtensionUsage } from "@/Api/extensionApi";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

function useExtensionUsage(date, mode) {
  const userInfo = useContext(UserInfoContext);
  return useQuery({
    queryKey: [`extensionUsage`, date, mode],
    queryFn: () => getExtensionUsage(date, mode),
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });
}

export { useExtensionUsage };
