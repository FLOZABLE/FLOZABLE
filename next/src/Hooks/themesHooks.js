import { getThemes } from "@/Api/themesApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useGetThemes() {
  const { userInfo } = useAccount();

  return useQuery({
    queryKey: [`getThemes`],
    queryFn: getThemes,
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });
}

export { useGetThemes };
