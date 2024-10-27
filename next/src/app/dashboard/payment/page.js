"use client";

import styles from "./page.module.css";
import getStripe from "@/app/lib/getStripe";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProduct, useSubscriptionInitialize } from "@/Hooks/paymentHooks";
import { BackArrow } from "@/app/utils/Svg";
import BlobBtn from "@/app/components/Buttons/BlobBtn/BlobBtn";
import { toast } from "react-toastify";

const stripePromise = getStripe();

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Optionally, you can specify a return_url to redirect after confirmation.
        // return_url: 'https://your-website.com/order/complete',
      },
      redirect: "if_required",
    });

    if (error) {
      console.log(error);
      toast.error(error.message);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Handle successful subscription
      toast.success("Subscription succeeded!");
      router.push("/dashboard");
      console.log("Subscription succeeded!");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.PaymentForm}>
      <div className={styles.PaymentElement}>
        <PaymentElement />
      </div>
      <BlobBtn disabled={!stripe || loading} type={"submit"}>
        {loading ? "Processing..." : "Subscribe"}
      </BlobBtn>
    </form>
  );
}

export default function Payment() {
  const [priceId, setPriceId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [productInfo, setProductInfo] = useState({
    name: "",
    price: 0,
    interval: "",
  });

  const { subscriptionInitializeData, subscriptionInitializeIsLoading } =
    useSubscriptionInitialize(priceId);
  const { productData, productIsLoading } = useProduct(priceId);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;

    const priceId = searchParams.get("priceId");
    setPriceId(priceId);
  }, [searchParams]);

  useEffect(() => {
    if (!subscriptionInitializeData?.success) return;

    setClientSecret(subscriptionInitializeData.clientSecret);
  }, [subscriptionInitializeData]);

  useEffect(() => {
    if (!productData?.success) return;
    const name = productData.product.name;
    const interval = productData.price.recurring.interval;
    const price = productData.price.unit_amount / 100;
    setProductInfo({
      name,
      interval,
      price,
    });
  }, [productData]);

  return (
    <div className={styles.Payment}>
      <div className={styles.productInfo}>
        <div className={styles.contents}>
          <div className={styles.layer}>
            <i
              id={styles.backBtn}
              onClick={() => {
                router.back();
              }}
            >
              <BackArrow />
            </i>
          </div>
          <div className={styles.layer} id={styles.name}>
            <h2>Subscribe to {productInfo.name}</h2>
          </div>
          <div className={styles.layer} id={styles.price}>
            <p>
              ${productInfo.price} <strong>per {productInfo.interval}</strong>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.paymentInfo}>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm clientSecret={clientSecret} />
          </Elements>
        ) : null}
      </div>
    </div>
  );
}
