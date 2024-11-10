import { getThemes, getThemesUser } from "@/Api/themesApi";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "./accountHooks";

function useThemes() {
  const queryResult = useQuery({
    queryKey: [`useThemes`],
    queryFn: getThemes,
    staleTime: 1000 * 60 * 10,
  });

  const { data: themesData } = queryResult;

  return { themesData, ...queryResult };
}

function useThemesUser() {
  const { accountData } = useAccount();

  const queryResult = useQuery({
    queryKey: [`getThemesUser`],
    queryFn: getThemesUser,
    staleTime: 1000 * 60 * 10,
    enabled: !!accountData,
  });

  const { data: themesUserData } = queryResult;

  return { themesUserData, ...queryResult };
}

export { useThemes, useThemesUser };
