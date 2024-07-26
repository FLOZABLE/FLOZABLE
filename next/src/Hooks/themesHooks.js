import { getThemes } from "@/Api/themesApi";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

function useGetThemes() {
  const userInfo = useContext(UserInfoContext);

  return useQuery({
    queryKey: [`getThemes`],
    queryFn: getThemes,
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });
}

export { useGetThemes };
