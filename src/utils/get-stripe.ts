import { loadStripe } from "@stripe/stripe-js";

export default function getStripe() {
  const key = [
    import.meta.env.STRIPE_KEY,
    import.meta.env.VITE_STRIPE_KEY,
  ].find(Boolean);
  return loadStripe(key ?? "");
}
