import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const scheduleAppointments = (
  activeDate?: any,
  addedAppointments?: any,
  tAppointments?: any,
  messageApi?: any,
  fetchSlotsData?: any,
  userid?: any,
  fetchUserData?: any,
  setIsDone?: any,
  deletedAppointments?: any,
  isEdit?: any,
  editSlot?: any,
  socket?: any,
  doctorId?: any,
) => {
  messageApi.open({
    key: 1,
    type: "loading",
    content: deletedAppointments
      ? "deleting your appointment ...."
      : isEdit
        ? "editing your appointment ..."
        : "scheduling your appointments ...",
    duration: 8,
  });
  const data = {
    data: {
      date: activeDate?.format("YYYY-MM-DD"),
      totalSlots: tAppointments,
      deletedAppointments,
      addedAppointments,
      editSlot: editSlot,
      doctorId,
    },
  };
  if (!deletedAppointments) setIsDone(false);
  const host = window?.location?.hostname;
  axios
    .post(
      `http://${host}:5000/${
        isEdit ? "edit/appointment" : "schedule/appointments"
      }`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.get("accessToken")}`,
        },
      },
    )
    .then(() => {
      messageApi.open({
        key: 1,
        type: "success",
        content: deletedAppointments
          ? "your schedule Appointment deleted"
          : isEdit
            ? "your appointment edited successfull ..."
            : "Your schedule Appointments updated",

        duration: 3,
      });
      socket?.emit("update_appointments", {
        date: activeDate?.format("YYYY-MM-DD"),
        doctorId: userid,
      });
      fetchSlotsData(
        {
          date: activeDate?.format("YYYY-MM-DD"),
          doctorId: userid,
        },
        true,
      );
    })
    .catch((err?: any, ..._args: any[]) => {
      if (err?.response?.status == 400) {
        const timeSlots = err?.response?.data?.data?.timeSlots;
        if (timeSlots) {
          messageApi.open({
            key: 1,
            type: "error",
            content: `there's slot${
              timeSlots.length > 1 ? "s" : ""
            } booked in ${timeSlots?.join(" | ")}`,
            duration: 3,
          });
          fetchSlotsData({
            date: activeDate?.format("YYYY-MM-DD"),
            doctorId: userid,
          });
        }
      } else if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else {
        messageApi.open({
          key: 1,
          type: "error",
          content: "there's some issues, please try again later",
          duration: 3,
        });
        if (!deletedAppointments) setIsDone(true);
      }
    });
};

export default scheduleAppointments;
