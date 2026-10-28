import { Button } from "@/components/ui/controls";
import { Empty, Typography } from "@/components/ui/display";
import { Popover } from "@/components/ui/overlay";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import AppointmentPayment from "@/components/booking/appointment-payment";
import BookButton from "@/components/booking/book-button";
import SuccessAppointment from "@/components/booking/success-appointment";
import CalendarView from "@/components/profile/calendar-view";
import Loader from "@/components/ui/loader";
import PopUp from "@/components/ui/pop-up";
import { useSlotsContext } from "@/contexts/slots-context";
import { useUserContext } from "@/contexts/user-context";
import type { Id } from "@/types/user";
import type { PaymentStep } from "@/types/payment-step";
import type { Slot } from "@/types/appointment";
import getStripe from "@/utils/get-stripe";

const { Title } = Typography;

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage can be blocked (private mode).
    return null;
  }
}

// The last day the patient looked at, if it is later this month.
function storedDate() {
  const saved = readStorage("book_date");
  const day = saved ? dayjs(saved) : null;
  const today = dayjs();
  return day?.isValid() && day.isAfter(today) && day.isSame(today, "month")
    ? day
    : today;
}

// The payment's description holds the booked slot as JSON.
function parseSlot(description: string | null): Slot | null {
  if (!description) return null;
  try {
    const value: unknown = JSON.parse(description);
    if (
      typeof value === "object" &&
      value !== null &&
      "schedule_date" in value &&
      typeof value.schedule_date === "string" &&
      "slotTime" in value &&
      typeof value.slotTime === "string"
    )
      return value as Slot;
  } catch {
    // Not JSON: nothing to show.
  }
  return null;
}

export default function BookAppointment({
  userid,
  doctorId,
  socket,
  timeZone,
}: {
  userid?: Id;
  doctorId: Id;
  socket: Socket;
  timeZone: string;
}) {
  const { slotsData, isLoading, fetchSlotsData } = useSlotsContext();
  const [bookedAppointment, setBookedAppointment] = useState<Slot | null>(null);
  const { messageApi } = useUserContext();
  const [isPayment, setIsPayment] = useState<PaymentStep>(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState<Slot | null>(
    null,
  );
  const [now] = useState(Date.now);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(storedDate);
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret",
  );
  // A slot picked on the doctors page, to open straight away.
  const [appointmentId] = useState(function () {
    return readStorage("book_appointment");
  });
  const day = selectedDate.format("YYYY-MM-DD");
  const freeSlots = slotsData?.freeSlots ?? null;
  if (appointmentId && !bookedAppointment && !isPayment && !isLoading) {
    const appDetails = freeSlots?.find(function (slot) {
      return String(slot.appointmentId) === appointmentId;
    });
    if (appDetails) {
      setIsPayment("payment_processing");
      setBookedAppointment(appDetails);
    }
  }
  useEffect(
    function () {
      if (appointmentId && !isLoading)
        window.localStorage.removeItem("book_appointment");
    },
    [appointmentId, isLoading],
  );

  // Back from a Stripe redirect: show the booked slot once it succeeded.
  useEffect(
    function () {
      if (!clientSecret || isLoading) return;
      let active = true;
      void getStripe()
        .then(function (stripe) {
          return stripe?.retrievePaymentIntent(clientSecret);
        })
        .then(function (result) {
          const paymentIntent = result?.paymentIntent;
          if (!active || paymentIntent?.status !== "succeeded") return;
          const record = parseSlot(paymentIntent.description);
          if (!record) return;
          if (record.schedule_date === day) {
            setIsPayment("payment_success");
            setAppointmentSuccess(record);
          } else setSelectedDate(dayjs(record.schedule_date));
        });
      return function () {
        active = false;
      };
    },
    [clientSecret, isLoading, day],
  );
  useEffect(
    function () {
      socket.emit("join_doctor", doctorId);
    },
    [socket, doctorId],
  );
  useEffect(
    function () {
      function getSlots(data?: { date?: string }) {
        if (day === data?.date)
          void fetchSlotsData({ date: day, doctorId }, { silent: true });
      }
      socket.on("update_slots", getSlots);
      void fetchSlotsData({ date: day, doctorId });
      return function () {
        socket.off("update_slots", getSlots);
      };
    },
    [day, doctorId, fetchSlotsData, socket],
  );
  function handleDate(value: Dayjs | null) {
    if (!value) return;
    setSelectedDate(value);
    try {
      window.localStorage.setItem("book_date", value.format("YYYY-MM-DD"));
    } catch {
      // Storage can be blocked (private mode).
    }
  }
  // True when the slot starts at least a minute from now.
  function isUpcoming(slotTime: string) {
    return (
      new Date(`${day} ${slotTime}${timeZone}`).getTime() > now + 1000 * 60
    );
  }
  const isUpToDate = !selectedDate.isBefore(dayjs(), "day");
  const isUser = userid !== undefined && userid !== doctorId;
  const upcomingSlots =
    freeSlots?.filter(function ({ slotTime }) {
      return isUpcoming(slotTime);
    }) ?? [];
  return (
    <div>
      <div className="schedule--wrapper m-2 p-3 rounded">
        <Title className="text-gray-700 text-center text-lg sm:text-2xl lg:text-3xl 2xl:text-4xl">
          Book Your Appointment
        </Title>
        <CalendarView selectedDate={selectedDate} handleDate={handleDate} />
        {isUpToDate && !isLoading ? (
          <>
            {!freeSlots ? (
              <Empty
                className="mt-3"
                description={
                  <span className="font-medium text-gray-400">
                    there's no Appointments available yet
                  </span>
                }
              />
            ) : (
              <>
                <div className="flex flex-wrap gap-2 justify-center">
                  {upcomingSlots.map(function (slot) {
                    const value = slot.slotTime;
                    return (
                      <div
                        className={`flex cursor-pointer flex-col relative sm:w-1/3 lg:w-1/4 2xl:w-1/5 grow justify-between rounded-lg ${
                          bookedAppointment?.slotTime === value
                            ? "bg-gray-700"
                            : "bg-blue-800/80"
                        } p-2`}
                        onClick={function () {
                          setBookedAppointment(function (current) {
                            return current?.slotTime === value ? null : slot;
                          });
                        }}
                        key={value}
                      >
                        <BookButton
                          slotTime={value}
                          schedule_date={slot.schedule_date}
                          timeZone={timeZone}
                          appointmentState={slot.appointmentState}
                          appointmentType={slot.appointmentType}
                          appointmentFees={slot.appointmentFees}
                        />
                      </div>
                    );
                  })}
                </div>
                {upcomingSlots.length ? (
                  <Popover
                    color={isUser && bookedAppointment ? "green" : "red"}
                    placement="topLeft"
                    trigger="click"
                    open={!isUser ? null : false}
                    content={
                      <span className="text-white font-medium">
                        {!isUser
                          ? userid !== undefined
                            ? "it's already your profile"
                            : "you need to signup or login"
                          : bookedAppointment === null
                            ? "select one Appointment"
                            : "Book now"}
                      </span>
                    }
                  >
                    <Button
                      onClick={function () {
                        if (!isUser || !bookedAppointment) return;
                        if (isUpcoming(bookedAppointment.slotTime)) {
                          setIsPayment("payment_processing");
                        } else {
                          messageApi.open({
                            content: "choose a recent date",
                            duration: 3,
                            type: "warning",
                          });
                        }
                      }}
                      type="primary"
                      className={`my-4 m-auto sm:font-medium h-12 w-full sm:w-2/3 2xl:w-1/2 block ${
                        !isUser || !bookedAppointment
                          ? "bg-gray-100 text-gray-400 border-gray-400"
                          : "hover:bg-gray-800 bg-gray-700"
                      } rounded-lg`}
                    >
                      book your appointment
                    </Button>
                  </Popover>
                ) : (
                  <Empty
                    className="mt-3"
                    description={
                      <span className="font-medium text-gray-400">
                        all Appointments booked
                      </span>
                    }
                  />
                )}
              </>
            )}
            <PopUp
              show={isPayment !== null}
              mt="20px"
              customWidth="w-5/6 sm:w-4/5 lg:w-3/4"
              handleClose={function () {
                if (isPayment === "payment_success") {
                  void navigate(`/profile/${String(doctorId)}`);
                }
                setAppointmentSuccess(null);
                setIsPayment(null);
              }}
            >
              {isPayment === "payment_processing" && bookedAppointment ? (
                <AppointmentPayment
                  setIsPayment={setIsPayment}
                  bookedAppointment={bookedAppointment}
                  doctorId={doctorId}
                  setBookedAppointment={setBookedAppointment}
                  socket={socket}
                />
              ) : isPayment === "payment_success" || appointmentSuccess ? (
                <SuccessAppointment bookedAppointment={appointmentSuccess} />
              ) : null}
            </PopUp>
          </>
        ) : isLoading ? (
          <Loader />
        ) : (
          <Empty
            className="mt-3"
            description={
              <span className="font-medium text-gray-400">
                choose a recent date
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}
