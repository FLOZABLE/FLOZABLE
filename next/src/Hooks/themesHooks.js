import { getThemes, getThemesUser } from "@/Api/themesApi";
import { useQuery } from "@tanstack/react-query";
import { UserInfoContext } from "@/app/utils/Contexts";
import { useContext } from "react";

function useThemes() {
  const queryResult = useQuery({
    queryKey: [`getThemes`],
    queryFn: getThemes,
    staleTime: 1000 * 60 * 10,
  });

  const { data: useThemesData } = queryResult;

  return { useThemesData, ...queryResult };
}

function useThemesUser() {
  const { userInfo } = useContext(UserInfoContext);

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
