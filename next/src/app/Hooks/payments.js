/* "use client"; */

import { useQuery } from "@tanstack/react-query";
import config from "../utils/config";

const useStripeClientSecret = () => {
  const { isPending, error, data } = useQuery({
    queryFn: () =>
      fetch(`${config.server}/payment/client-secret`).then((res) => res.json()),
  });

  return { isPending, error, data };
};

export {useStripeClientSecret};