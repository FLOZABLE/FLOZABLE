import { getThemes, getThemesUser } from "@/Api/themesApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useThemes() {
  const { userInfo } = useAccount();

  const queryResult = useQuery({
    queryKey: [`getThemes`],
    queryFn: getThemes,
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });

  const { data: useThemesData } = queryResult;

  return { useThemesData, ...queryResult };
}

function useThemesUser() {
  const { userInfo } = useAccount();

  const queryResult = useQuery({
    queryKey: [`getThemesUser`],
    queryFn: getThemesUser,
    staleTime: 1000 * 60,
    enabled: !!userInfo,
  });

  const { data: useThemesUserData } = queryResult;

  return { useThemesUserData, ...queryResult };
}

export { useThemes, useThemesUser };
