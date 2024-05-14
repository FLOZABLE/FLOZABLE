import {PaymentElement} from '@stripe/react-stripe-js';

export default function PaymentForm(){
  return (
    <form>
      <PaymentElement />
      <button>Submit</button>
    </form>
  );
};