"use client";

import PaymentForm from "@/app/components/Payment/PaymentForm/PaymentForm";
import styles from "./page.module.css";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useStripeClientSecret } from "@/app/Hooks/payments";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE);

const appearance = {
  theme: "stripe",
};

export default function Payment() {
  const { data } = useStripeClientSecret(priceId);

  const searchParams = useSearchParams();

  const [priceId, setPriceId] = useState(null);


  useState(() => {
    if (!searchParams) return;

    const priceId = searchParams.get('priceId');
    setPriceId(priceId);
  }, [searchParams]);

  return (
    <div className={styles.Payment}>
      <div className={styles.paymentContainer}>
        {data?.secret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: data?.secret, appearance }}
          >
            <PaymentForm />
          </Elements>
        ) : null}
      </div>
    </div>
  );
}
