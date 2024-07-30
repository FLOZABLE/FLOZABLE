import { getAccount } from "@/Api/accountApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function useAccount() {
  const queryClient = useQueryClient();

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

  const clearAccountData = () => {
    queryClient.resetQueries(["useAccount"]);
    queryClient.removeQueries(['useAccount']);
  };

  return {
    useAccountData,
    useAccountRefetch,
    useAccountIsLoading,
    userInfo,
    clearAccountData,
    ...queryResult,
  };
}

export { useAccount };
