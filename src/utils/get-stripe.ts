import { loadStripe } from "@stripe/stripe-js";

export default function getStripe() {
  return loadStripe(
    import.meta.env.STRIPE_KEY || import.meta.env.VITE_STRIPE_KEY,
  );
}
