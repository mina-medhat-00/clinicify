import {
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSlotsContext } from "@/contexts/slots-context";
import { useUserContext } from "@/contexts/user-context";
import bookAppointment from "@/services/book-appointment";

const CheckoutForm = ({
  bookedAppointment,
  doctorId,
  socket,
  selectedDate,
  messageApi,
  setBookedAppointment,
  setIsPayment,
}: any) => {
  const stripe = useStripe();
  const { fetchSlotsData } = useSlotsContext();
  const { fetchUserData } = useUserContext();
  const elements = useElements();

  const [, setEmail] = useState<any>("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret",
    );

    if (!clientSecret) {
      return;
    }
    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }: any) => {
        switch (paymentIntent.status) {
          case "processing":
            setMessage("Your payment is processing.");
            break;
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.");
            break;
          default:
            setMessage("Something went wrong.");
            break;
        }
      });
  }, [stripe]);

  const handleSubmit = async (e?: any, ..._args: any[]) => {
    e.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);
    const result = await new Promise((resolve?: any, ..._args: any[]) =>
      bookAppointment(
        selectedDate,
        bookedAppointment?.slotTime,
        bookedAppointment?.appointmentId,
        messageApi,
        fetchSlotsData,
        doctorId,
        setBookedAppointment,
        fetchUserData,
        null,
        true,
        setIsPayment,
        resolve,
      ),
    );
    if (result === "err") return;
    stripe
      .confirmPayment({
        elements,
        redirect: "if_required",
      })
      .then((paymentIntent?: any, ..._args: any[]) => {
        const pi = paymentIntent?.paymentIntent;
        if (pi) {
          bookAppointment(
            selectedDate,
            bookedAppointment?.slotTime,
            bookedAppointment?.appointmentId,
            messageApi,
            fetchSlotsData,
            doctorId,
            setBookedAppointment,
            fetchUserData,
            setIsLoading,
            null,
            setIsPayment,
            null,
            socket,
            pi,
            navigate,
          );
        } else {
          setMessage(paymentIntent?.error?.message);
          setIsLoading(false);
        }
      });
  };
  const paymentElementOptions = {
    layout: "tabs",
  };
  return (
    <div className="flex flex-wrap justify-between gap-2">
      {!(isLoading || !elements || !stripe) && (
        <div className="w-1/5 sm:w-1/6 flex gap-2 flex-wrap items-center justify-center grow bg-gray-700 p-1 shadow-md rounded-lg">
          <h1 className="text-4xl  text-gray-100">
            {bookedAppointment?.appointmentState?.toUpperCase()}
          </h1>
          <h1 className="text-lg p-1 bg-gray-500/70 rounded-md  text-gray-100">
            {bookedAppointment?.appointmentType?.toUpperCase()}
          </h1>
          <h1 className="text-2xl text-gray-100">
            {bookedAppointment?.appointmentFees} L.E
          </h1>
        </div>
      )}
      <form
        className="w-4/5 grow self-center rounded-1.75 p-10 shadow-[0_0_0_0.5px_rgba(50,50,93,0.1),0_2px_5px_rgba(50,50,93,0.1),0_1px_1.5px_rgba(0,0,0,0.07)]"
        id="payment-form"
      >
        <LinkAuthenticationElement
          id="link-authentication-element"
          onChange={(e?: any, ..._args: any[]) => {
            setEmail(e.value.email);
          }}
        />
        <PaymentElement
          id="payment-element"
          className="mb-6"
          options={paymentElementOptions as any}
        />
        <button
          className={`block w-full rounded border-0 bg-[#5469d4] px-4 py-3 font-sans text-base font-semibold text-white shadow-[0_4px_5.5px_rgba(0,0,0,0.07)] transition-all duration-200 hover:contrast-115 disabled:cursor-default disabled:opacity-50 ${
            isLoading || !stripe || !elements
              ? "!cursor-not-allowed"
              : "cursor-pointer"
          }`}
          disabled={isLoading || !stripe || !elements}
          id="submit"
          onClick={handleSubmit}
        >
          <span
            id="button-text"
            className={`${
              isLoading || !stripe || !elements ? "!cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <div
                className="mx-auto size-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                id="spinner"
              ></div>
            ) : (
              "Pay now"
            )}
          </span>
        </button>
        {message && (
          <div
            id="payment--message"
            className="pt-3 text-center text-base leading-5 text-[#697386]"
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
