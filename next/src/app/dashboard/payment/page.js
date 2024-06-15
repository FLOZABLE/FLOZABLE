"use client";

import PaymentForm from "@/app/components/Payment/PaymentForm/PaymentForm";
import styles from "./page.module.css";
import { CustomCheckoutProvider, Elements } from "@stripe/react-stripe-js";
import { useStripeClientSecret } from "@/app/Hooks/payments";
import { useEffect, useState } from "react";
import config from "@/app/utils/config";
import getStripe from "@/lib/getStripe";

const stripePromise = getStripe();

const appearance = {
  theme: "stripe",
};

export default function Payment() {
  const [priceId, setPriceId] = useState(null);

  const [stripeSecret, setStripeSecret] = useState(null);


  /* useEffect(() => {
    if (!searchParams) return;

    const priceId = searchParams.get("priceId");
    setPriceId(priceId);
  }, [searchParams]); */

    
  useEffect(() => {
    try {
    const searchParams = new URLSearchParams(document.location.search);
      const priceId = searchParams.get("priceId");
      setPriceId(priceId);
    } catch (err) {
      console.log(err);
    }
  }, []);
 

  useEffect(() => {
    console.log("price", priceId);

    const success_url = window.location.href;
    const cancel_url = window.location.href;

    if (!priceId) return;

    fetch(`${config.server}/payment/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ priceId, success_url, cancel_url }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.client_secret);
        if (data.success) {
          setStripeSecret(data.client_secret);
        }
      })
      .catch((error) => console.error(error));
  }, [priceId]);

  console.log(stripeSecret);

  return (
    <div className={styles.Payment}>
      {stripeSecret}
      <div className={styles.paymentContainer}>
        {stripeSecret}
        {/* {stripeSecret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: stripeSecret, appearance }}
          >
            <PaymentForm />
          </Elements>
        ) : null} */}
        {stripeSecret ? (
          <CustomCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret: stripeSecret }}
          >
            <PaymentForm />
          </CustomCheckoutProvider>
        ) : null}
      </div>
    </div>
  );
}
