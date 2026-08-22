import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import CheckoutForm from "@/components/booking/checkout-form";
import Loader from "@/components/ui/loader";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import getStripe from "@/utils/get-stripe";
import { apiUrl } from "@/utils/api";

const stripePromise = getStripe();
function AppointmentPayment({
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
        axios
          .request({
            url: apiUrl("/create/payment"),
            ...{
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${new Cookies()?.get("accessToken")}`,
              },
              data: JSON.stringify({
                data: {
                  doctorId,
                  ...bookedAppointment,
                },
              }),
            },
          })
          .then(function ({ data }: any) {
            setClientSecret(data.clientSecret);
          })
          .catch(function (err?: any, ..._args: any[]) {
            setIsPayment(null);
            if (err?.response?.status == 401) {
              fetchUserData(true, new Cookies().get("accessToken"));
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
    [bookedAppointment?.appointmentId, doctorId],
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

export default AppointmentPayment;
