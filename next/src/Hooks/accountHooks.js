import { getAccount } from "@/Api/accountApi";
import { useQuery } from "@tanstack/react-query";

function useAccount() {
  return useQuery({
    queryKey: [`useAccount`],
    queryFn: getAccount,
    staleTime: 1000 * 60
  });
}

export { useAccount };
