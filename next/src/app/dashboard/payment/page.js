"use client";

import PaymentForm from "@/app/components/Payment/PaymentForm/PaymentForm";
import styles from "./page.module.css";
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE);

export default function Payment() {
  return (
    <div>
      <p>sdfsd</p>
      <Elements stripe={stripePromise} options={{}}>
        <PaymentForm />
    </Elements>
    </div>
  )
}