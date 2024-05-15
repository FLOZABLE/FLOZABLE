"use client";

import PaymentForm from "@/app/components/Payment/PaymentForm/PaymentForm";
import styles from "./page.module.css";
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import { useStripeClientSecret } from "@/app/Hooks/payments";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE);

export default function Payment() {
  const {data} = useStripeClientSecret();
  
  console.log('gdddd' ,data);
  return (
    <div>
      <p>sdfsd</p>
      <Elements stripe={stripePromise} options={{clientSecret: data?.secret}}>
        <PaymentForm />
    </Elements>
    </div>
  )
}