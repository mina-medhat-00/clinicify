import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
export default function bookAppointment(
  selectedDate?: any,
  bookedSlot?: any,
  appointmentId?: any,
  messageApi?: any,
  fetchSlotsData?: any,
  profileId?: any,
  setBookedAppointment?: any,
  fetchUserData?: any,
  setIsLoading?: any,
  isCheck?: any,
  setIsPayment?: any,
  resolve?: any,
  socket?: any,
  pi?: any,
  navigate?: any,
) {
  if (appointmentId) {
    const data = {
      data: {
        date: selectedDate,
        appointmentId,
        bookedSlot,
        doctorId: profileId,
      },
    };
    axios
      .post(
        apiUrl(
          `/book/appointment${isCheck ? "?check=true" : ""}${
            pi ? `&pi=${pi?.id}` : ""
          }`,
        ),
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies.get("accessToken")}`,
          },
        },
      )
      .then(function () {
        fetchSlotsData(
          {
            date: selectedDate,
            doctorId: profileId,
          },
          true,
        );
        if (!isCheck) {
          socket.emit("update_appointments", {
            date: selectedDate,
            doctorId: profileId,
            appointmentId,
          });
        }
        if (!isCheck) setBookedAppointment(null);

        if (pi) {
          setIsLoading(false);
          setTimeout(function () {
            navigate(
              `/profile/${profileId}?payment_intent_client_secret=${pi?.client_secret}`,
            );
          }, 500);
        }
        if (isCheck) resolve("done");
      })
      .catch(function (err?: any, ..._args: any[]) {
        if (pi) setIsLoading(false);
        if (isCheck) resolve("err");
        if (err?.response?.status == 400) {
          const data = err?.response?.data?.data;
          if (data?.isCanceled) {
            messageApi.open({
              key: 1,
              type: "error",
              content: "these slot has been canceled",
              duration: 5,
            });
            fetchSlotsData(
              {
                date: selectedDate,
                doctorId: profileId,
              },
              true,
            );
            setBookedAppointment(null);
            setIsPayment(null);
          } else if (data?.isBooked) {
            messageApi.open({
              key: 1,
              type: "error",
              content: "these slot already booked, try with another slot",
              duration: 5,
            });
            fetchSlotsData(
              {
                date: selectedDate,
                doctorId: profileId,
              },
              true,
            );
            setBookedAppointment(null);
            setIsPayment(null);
          }
        } else if (err?.response?.status == 401) {
          fetchUserData(true, cookies.get("accessToken"));
        } else
          messageApi.open({
            key: 1,
            type: "error",
            content: "there's some issues, please try again later",
            duration: 5,
          });
      });
  }
}
