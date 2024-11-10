import { useQuery } from "@tanstack/react-query";
import { getProduct, postSubscriptionInitialize } from "@/Api/payment";

function useSubscriptionInitialize(priceId) {
  const queryResult = useQuery({
    queryKey: [`useSubscriptionInitialize`],
    queryFn: () => postSubscriptionInitialize(priceId),
    staleTime: 1000 * 60 * 10,
    enabled: !!priceId,
  });

  const {
    data: subscriptionInitializeData,
    isLoading: subscriptionInitializeIsLoading,
  } = queryResult;

  const clientSecret = subscriptionInitializeData?.clientSecret;

  return {
    clientSecret,
    subscriptionInitializeData,
    subscriptionInitializeIsLoading,
    ...queryResult,
  };
}

function useProduct(priceId) {
  const queryResult = useQuery({
    queryKey: [`useProduct`],
    queryFn: () => getProduct(priceId),
    staleTime: 1000 * 60 * 10,
    enabled: !!priceId,
  });

  const { data: productData, isLoading: productIsLoading } = queryResult;

  return {
    productData,
    productIsLoading,
    ...queryResult,
  };
}

export { useSubscriptionInitialize, useProduct };
