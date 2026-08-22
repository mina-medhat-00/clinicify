import { loadStripe } from "@stripe/stripe-js";

function getStripe() {
  return loadStripe(
    import.meta.env.STRIPE_KEY || import.meta.env.VITE_STRIPE_KEY,
  );
}

export default getStripe;
