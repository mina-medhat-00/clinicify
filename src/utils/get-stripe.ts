import { loadStripe } from "@stripe/stripe-js";

export default function getStripe() {
  // The first key that is set; an empty STRIPE_KEY falls back to VITE_STRIPE_KEY.
  const key = [
    import.meta.env.STRIPE_KEY,
    import.meta.env.VITE_STRIPE_KEY,
  ].find(Boolean);
  return loadStripe(key ?? "");
}
