import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      import.meta.env.STRIPE_KEY || import.meta.env.VITE_STRIPE_KEY,
    );
  }
  return stripePromise;
};
export default getStripe;
