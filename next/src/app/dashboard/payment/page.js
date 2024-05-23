"use client";

import PaymentForm from "@/app/components/Payment/PaymentForm/PaymentForm";
import styles from "./page.module.css";
import { CustomCheckoutProvider, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useStripeClientSecret } from "@/app/Hooks/payments";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE);

const appearance = {
  theme: "stripe",
};

export default function Payment() {
  const [priceId, setPriceId] = useState(null);

  const stripeClientSecretQuery = useStripeClientSecret(priceId);

  const { data, error, isLoading } = stripeClientSecretQuery;

  console.log('err', error)

  const searchParams = useSearchParams();


  useState(() => {
    if (!searchParams) return;

    const priceId = searchParams.get('priceId');
    setPriceId(priceId);
  }, [searchParams]);

  return (
    <div className={styles.Payment}>
      <div className={styles.paymentContainer}>
        {/* {data?.secret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: data?.secret, appearance }}
          >
            <PaymentForm />
          </Elements>
        ) : null} */}
        {/* <CustomCheckoutProvider>

        </CustomCheckoutProvider> */}
      </div>
    </div>
  );
}
