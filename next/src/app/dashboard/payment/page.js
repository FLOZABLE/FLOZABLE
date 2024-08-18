"use client";

import styles from "./page.module.css";
import getStripe from "@/app/lib/getStripe";
import {
  CardElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import config from "@/app/utils/config";

const stripePromise = getStripe();

function PaymentForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      setError(error.message);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Handle successful subscription
      console.log("Subscription succeeded!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>
        Subscribe
      </button>
      {error && <div>{error}</div>}
    </form>
  );
}

export default function Payment() {
  const [priceId, setPriceId] = useState("");
  const [clientSecret, setClientSecret] = useState(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const priceId = searchParams.get("priceId");
    setPriceId(priceId);
  }, [searchParams]);

  useEffect(() => {
    console.log("price", priceId);

    const success_url = window.location.href;
    const cancel_url = window.location.href;

    if (!priceId) return;

    fetch(`${config.server}/payment/subscription/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ priceId, success_url, cancel_url }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((error) => console.error(error));
  }, [priceId]);

  return (
    <div className={styles.Payment}>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} />
        </Elements>
      ) : null}
    </div>
  );
}
