/* "use client"; */

import { useQuery } from "@tanstack/react-query";
import config from "../utils/config";

const useStripeClientSecret = (priceId) => {
  const { isPending, error, data } = useQuery({
    queryFn: () =>
      fetch(`${config.server}/payment/create-checkout-session`, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: {
          priceId
        }
      }).then((res) => res.json()),
  });

  return { isPending, error, data };
};

export { useStripeClientSecret };
