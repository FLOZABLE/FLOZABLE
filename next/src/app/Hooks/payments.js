/* "use client"; */

import { useQuery } from "@tanstack/react-query";
import config from "../utils/config";

const useStripeClientSecret = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ['stripeClientSecret'],
    queryFn: () =>
      fetch(`${config.server}/payment/create-checkout-session`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
/*         body: JSON.stringlify({priceId}), */
      }).then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      }),
      staleTime: 0,  // Data is considered stale immediately
      cacheTime: 0,  // Cache data is discarded immediately
      refetchOnWindowFocus: true,  // Refetch data when window is refocused
  });

  return { isPending, error, data };
};

export { useStripeClientSecret };
