import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
export default function cancelAppointment(
  selectedDate?: any,
  bookedSlot?: any,
  appointmentId?: any,
  messageApi?: any,
  fetchData?: any,
  doctorId?: any,
  setBookedSlot?: any,
  cancelFrom?: any,
  fetchUserData?: any,
  date?: any,
  setShowPop?: any,
  socket?: any,
) {
  const data = {
    data: {
      date: selectedDate?.format("YYYY-MM-DD"),
      bookedSlot: bookedSlot,
      doctorId,
      cancelFrom,
      appointmentId,
    },
  };
  messageApi.open({
    key: 1,
    type: "loading",
    content: "cancel your appointment...",
    duration: 8,
  });
  axios
    .post(apiUrl("/cancel/appointment"), data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("accessToken")}`,
      },
    })
    .then(function () {
      messageApi.open({
        key: 1,
        type: "success",
        content: "Your Appointment Canceled",
        duration: 3,
      });
      socket?.emit("update_appointments", {
        date: selectedDate?.format("YYYY-MM-DD"),
        doctorId,
      });
      setBookedSlot(null);
      if (cancelFrom == "doctor" || cancelFrom == "admin") {
        setShowPop(null);
        if (cancelFrom == "doctor" || cancelFrom == "admin")
          fetchData({
            date: selectedDate?.format("YYYY-MM-DD"),
            doctorId,
          });
      } else {
        setShowPop({ data: false, show: false });
        fetchData(true, new Cookies().get("accessToken"), null, null, {
          date,
        });
      }
    })
    .catch(function (err?: any) {
      if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else if (err?.response?.status == 400) {
        messageApi.open({
          key: 1,
          type: "error",
          content: "it's already canceled or there's missing information",
          duration: 3,
        });
      } else {
        messageApi.open({
          key: 1,
          type: "error",
          content: "there's some issues, please try again later",
          duration: 3,
        });
      }
    });
}
