import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import CheckoutForm from "@/components/booking/checkout-form";
import Loader from "@/components/ui/loader";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import getStripe from "@/utils/get-stripe";
import { api } from "@/services/client";

const stripePromise = getStripe();
export default function AppointmentPayment({
  bookedAppointment,
  doctorId,
  setBookedAppointment,
  setIsPayment,
  socket,
}: any) {
  const [clientSecret, setClientSecret] = useState<any>("");
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  useEffect(
    function () {
      if (bookedAppointment?.appointmentId && doctorId) {
        api
          .post("/create/payment", {
            data: { doctorId, ...bookedAppointment },
          })
          .then(function ({ data }: any) {
            setClientSecret(data.clientSecret);
          })
          .catch(function (err?: any) {
            setIsPayment(null);
            if (err?.response?.status == 401) {
              fetchUserData({ silent: true });
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
    [
      bookedAppointment,
      bookedAppointment?.appointmentId,
      doctorId,
      fetchUserData,
      messageApi,
      setIsPayment,
    ],
  );

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="App--payment">
      {clientSecret ? (
        <Elements options={options as any} stripe={stripePromise}>
          <CheckoutForm
            socket={socket}
            setIsPayment={setIsPayment}
            setBookedAppointment={setBookedAppointment}
            bookedAppointment={bookedAppointment}
            doctorId={doctorId}
            selectedDate={bookedAppointment?.schedule_date}
            messageApi={messageApi}
          />
        </Elements>
      ) : (
        <Loader />
      )}
    </div>
  );
}
