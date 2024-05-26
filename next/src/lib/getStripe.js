import { loadStripe } from "@stripe/stripe-js";

let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE, {
      betas: ["custom_checkout_beta_2"],
    });
  }
  return stripePromise;
};

export default getStripe;
