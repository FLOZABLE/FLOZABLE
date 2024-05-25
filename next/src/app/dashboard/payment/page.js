"use client";

import PaymentForm from "@/app/components/Payment/PaymentForm/PaymentForm";
import styles from "./page.module.css";
import { CustomCheckoutProvider, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useStripeClientSecret } from "@/app/Hooks/payments";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import config from "@/app/utils/config";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE);

const appearance = {
  theme: "stripe",
};

export default function Payment() {
  const [priceId, setPriceId] = useState(null);

  const [stripeSecret, setStripeSecret] = useState(null);

  const searchParams = useSearchParams();

  useState(() => {
    if (!searchParams) return;

    const priceId = searchParams.get("priceId");
    setPriceId(priceId);
  }, [searchParams]);

  useEffect(() => {
    console.log('price', priceId);

    const success_url = window.location.href;
    const cancel_url = window.location.href;

    if (!priceId) return;

    fetch(`${config.server}/payment/create-checkout-session`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ priceId, success_url, cancel_url }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data.success) {
          setStripeSecret(data.client_secret);
        }
      })
      .catch((error) => console.error(error));
  }, [priceId]);

  return (
    <div className={styles.Payment}>
      <div className={styles.paymentContainer}>
        {stripeSecret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: stripeSecret, appearance }}
          >
            <PaymentForm />
          </Elements>
        ) : null}
        {/* <CustomCheckoutProvider>

        </CustomCheckoutProvider> */}
      </div>
    </div>
  );
}
