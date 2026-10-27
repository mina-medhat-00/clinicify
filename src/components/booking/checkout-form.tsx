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
import { toQuery } from "@/utils/query";

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
        switch (paymentIntent?.status) {
          case "succeeded":
            setMessage("Payment succeeded!");
            break;
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
    const booking = {
      date: selectedDate,
      slotTime: bookedAppointment?.slotTime,
      appointmentId: bookedAppointment?.appointmentId,
      doctorId,
      messageApi,
      fetchUserData,
    };
    function refreshSlots() {
      fetchSlotsData({ date: selectedDate, doctorId }, { silent: true });
    }
    function dropSelection() {
      refreshSlots();
      setBookedAppointment(null);
      setIsPayment(null);
    }

    setIsLoading(true);
    // Make sure the slot is still free before charging the card.
    const check = await bookAppointment({ ...booking, check: true });
    if (check !== "booked") {
      setIsLoading(false);
      if (check === "unavailable") dropSelection();
      return;
    }
    let paymentIntent;
    try {
      const payment = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      paymentIntent = payment.paymentIntent;
      if (!paymentIntent) throw payment.error;
    } catch (err: any) {
      setMessage(err?.message || "Payment failed, please try again.");
      setIsLoading(false);
      return;
    }
    const result = await bookAppointment({
      ...booking,
      paymentIntentId: paymentIntent.id,
    });
    setIsLoading(false);
    if (result === "unavailable") return dropSelection();
    if (result !== "booked") return;
    refreshSlots();
    socket?.emit("update_appointments", {
      date: selectedDate,
      doctorId,
      appointmentId: booking.appointmentId,
    });
    setBookedAppointment(null);
    setTimeout(function () {
      navigate(
        `/profile/${doctorId}${toQuery({
          payment_intent_client_secret: paymentIntent.client_secret,
        })}`,
      );
    }, 500);
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
          onLoadError={function () {
            setMessage(
              "The payment form failed to load, please try again later.",
            );
          }}
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
