import { getAccount } from "@/Api/accountApi";
import { useQuery } from "@tanstack/react-query";

function useAccount() {
  const queryResult = useQuery({
    queryKey: [`useAccount`],
    queryFn: getAccount,
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: useAccountData,
    refetch: useAccountRefetch,
    isLoading: useAccountIsLoading,
  } = queryResult;

  const userInfo = useAccountData?.success ? useAccountData.userInfo : false;

  return {
    useAccountData,
    useAccountRefetch,
    useAccountIsLoading,
    userInfo,
    ...queryResult,
  };
}

export { useAccount };
