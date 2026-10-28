import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Socket } from "socket.io-client";
import CheckoutForm from "@/components/booking/checkout-form";
import Loader from "@/components/ui/loader";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import getStripe from "@/utils/get-stripe";
import { api, errorStatus } from "@/services/client";
import type { Id } from "@/types/user";
import type { PaymentStep } from "@/types/payment-step";
import type { Slot } from "@/types/appointment";

const stripePromise = getStripe();
export default function AppointmentPayment({
  bookedAppointment,
  doctorId,
  setBookedAppointment,
  setIsPayment,
  socket,
}: {
  bookedAppointment: Slot;
  doctorId: Id;
  setBookedAppointment: Dispatch<SetStateAction<Slot | null>>;
  setIsPayment: Dispatch<SetStateAction<PaymentStep>>;
  socket: Socket;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  useEffect(
    function () {
      {
        // This endpoint answers { clientSecret } without the usual wrapper.
        api
          .post<{ clientSecret: string }>("/create/payment", {
            data: { doctorId, ...bookedAppointment },
          })
          .then(function ({ data }) {
            setClientSecret(data.clientSecret);
          })
          .catch(function (err: unknown) {
            setIsPayment(null);
            if (errorStatus(err) === 401) {
              void fetchUserData({ silent: true });
            } else if (errorStatus(err) === 400) {
              messageApi.open({
                key: 1,
                type: "error",
                content: "this slot is no longer available, choose another one",
                duration: 5,
              });
            } else
              messageApi.open({
                key: 1,
                type: "error",
                content: "there's some issues, please try again later",
                duration: 5,
              });
          });
      }
    },
    [bookedAppointment, doctorId, fetchUserData, messageApi, setIsPayment],
  );

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: "stripe" },
  };

  return (
    <div className="App--payment">
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            socket={socket}
            setIsPayment={setIsPayment}
            setBookedAppointment={setBookedAppointment}
            bookedAppointment={bookedAppointment}
            doctorId={doctorId}
            selectedDate={bookedAppointment.schedule_date}
            messageApi={messageApi}
          />
        </Elements>
      ) : (
        <Loader />
      )}
    </div>
  );
}
