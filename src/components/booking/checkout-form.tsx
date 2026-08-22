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

export default function CheckoutForm({
  bookedAppointment,
  doctorId,
  socket,
  selectedDate,
  messageApi,
  setBookedAppointment,
  setIsPayment,
}: any) {
  const stripe = useStripe();
  const { fetchSlotsData } = useSlotsContext();
  const { fetchUserData } = useUserContext();
  const elements = useElements();

  const [, setEmail] = useState<any>("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(
    function () {
      if (!stripe) {
        return;
      }

      const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret",
      );

      if (!clientSecret) {
        return;
      }
      stripe.retrievePaymentIntent(clientSecret).then(function ({
        paymentIntent,
      }: any) {
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
    },
    [stripe],
  );

  async function handleSubmit(e?: any) {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    const result = await new Promise(function (resolve?: any) {
      return bookAppointment(
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
      );
    });
    if (result === "err") return;
    stripe
      .confirmPayment({
        elements,
        redirect: "if_required",
      })
      .then(function (paymentIntent?: any) {
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
  }
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
        className="w-4/5 grow self-center rounded-md p-10 shadow-md"
        id="payment-form"
      >
        <LinkAuthenticationElement
          id="link-authentication-element"
          onChange={function (e?: any) {
            setEmail(e.value.email);
          }}
        />
        <PaymentElement
          id="payment-element"
          className="mb-6"
          options={paymentElementOptions as any}
        />
        <button
          className={`block w-full rounded border-0 bg-indigo-500 px-4 py-3 font-sans text-base font-semibold text-white shadow-sm transition-all duration-200 hover:contrast-125 disabled:cursor-default disabled:opacity-50 ${
            isLoading || !stripe || !elements
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
          disabled={isLoading || !stripe || !elements}
          id="submit"
          onClick={handleSubmit}
        >
          <span
            id="button-text"
            className={`${
              isLoading || !stripe || !elements ? "cursor-not-allowed" : ""
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
            className="pt-3 text-center text-base leading-5 text-slate-500"
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
