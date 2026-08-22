import { Button, Empty, Popover, Typography } from "@/components/ui";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentPayment from "@/components/booking/appointment-payment";
import BookButton from "@/components/booking/book-button";
import SuccessAppointment from "@/components/booking/success-appointment";
import CalendarView from "@/components/profile/calendar-view";
import Loader from "@/components/ui/loader";
import PopUp from "@/components/ui/pop-up";
import { useSlotsContext } from "@/contexts/slots-context";
import { useUserContext } from "@/contexts/user-context";
import getStripe from "@/utils/get-stripe";

const { Title } = Typography;

export default function BookAppointment({
  userid,
  doctorId,
  socket,
  timeZone,
}: any) {
  const { slotsData, isLoading, fetchSlotsData } = useSlotsContext();
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const { messageApi } = useUserContext();
  const [isBookLoading] = useState(false);
  const [isPayment, setIsPayment] = useState<any>(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState<any>(null);
  const [freeSlots, setFreeSlots] = useState(null);
  const [now] = useState(Date.now);
  const navigate = useNavigate();
  const bDate = window?.localStorage?.getItem("book_date");
  const [selectedDate, setSelectedDate] = useState(function () {
    return bDate
      ? dayjs(bDate) > dayjs() &&
        dayjs(bDate).month() == dayjs().month() &&
        dayjs(bDate).year() == dayjs().year()
        ? dayjs(bDate)
        : dayjs()
      : dayjs();
  });
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret",
  );
  const appointmentId = window?.localStorage?.getItem("book_appointment");
  const selectedDateKey = selectedDate?.format("YYYY-MM-DD");
  const [prevSlotsData, setPrevSlotsData] = useState(slotsData);
  const [prevSelectedDateKey, setPrevSelectedDateKey] =
    useState(selectedDateKey);
  if (slotsData !== prevSlotsData || selectedDateKey !== prevSelectedDateKey) {
    setPrevSlotsData(slotsData);
    setPrevSelectedDateKey(selectedDateKey);
    setFreeSlots(slotsData?.freeSlots);
  }
  if (appointmentId && !bookedAppointment && !isPayment && !isLoading) {
    const appDetails = freeSlots?.filter(function ({
      appointmentId: appointment_id,
    }: any) {
      return appointmentId == appointment_id;
    });
    if (appDetails) {
      setIsPayment("payment_processing");
      setBookedAppointment(appDetails?.[0]);
    }
  }
  useEffect(
    function () {
      if (appointmentId && !isLoading)
        window.localStorage.removeItem("book_appointment");
    },
    [appointmentId, isLoading],
  );

  useEffect(
    function () {
      async function handleBook() {
        const stripe = await getStripe();
        if (!stripe || !clientSecret || isLoading) {
          return;
        }
        stripe.retrievePaymentIntent(clientSecret).then(function ({
          paymentIntent,
        }: any) {
          switch (paymentIntent.status) {
            case "succeeded": {
              const appointmentRecord = JSON.parse(paymentIntent?.description);
              if (
                appointmentRecord?.schedule_date ==
                selectedDate?.format("YYYY-MM-DD")
              ) {
                setIsPayment("payment_success");
                setAppointmentSuccess(appointmentRecord);
              } else {
                setSelectedDate(
                  dayjs(
                    appointmentRecord?.schedule_date ||
                      appointmentRecord?.selected_date,
                  ),
                );
              }
            }
          }
        });
      }
      handleBook();
    },
    [clientSecret, isLoading, selectedDate],
  );
  useEffect(
    function () {
      socket.emit("join_doctor", doctorId);
    },
    [socket, doctorId],
  );
  useEffect(
    function () {
      function getSlots(data?: any) {
        if (selectedDate.format("YYYY-MM-DD") == data?.date)
          fetchSlotsData(
            {
              date: selectedDate.format("YYYY-MM-DD"),
              doctorId,
            },
            true,
          );
      }
      if (doctorId && selectedDate.format("YYYY-MM-DD")) {
        socket.on("update_slots", getSlots);
        fetchSlotsData({
          date: selectedDate.format("YYYY-MM-DD"),
          doctorId,
        });
      }
      return function () {
        socket.off("update_slots", getSlots);
      };
    },
    [selectedDate, doctorId, fetchSlotsData, socket],
  );
  function handleDate(val?: any) {
    setSelectedDate(val);
    window?.localStorage?.setItem("book_date", val?.format("YYYY-MM-DD"));
  }
  function isToday(val?: any) {
    return (
      new Date(
        selectedDate.format("YYYY-MM-DD") + " " + val + timeZone,
      ).getTime() >
      now + 1000 * 60
    );
  }
  const isUpToDate =
    selectedDate?.toDate()?.setHours(0, 0, 0, 0) >=
    new Date().setHours(0, 0, 0, 0);
  const isUser = userid && userid != doctorId;
  const title = "Book Your Appointment";
  const buttonLabel = "book your appointment";
  return (
    <div>
      <div className={`schedule--wrapper m-2 p-3 rounded`}>
        <Title className="text-gray-700 text-center text-lg sm:text-2xl lg:text-3xl 2xl:text-4xl">
          {title}
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
                  {freeSlots?.map(function (
                    {
                      slotTime: value,
                      appointmentType,
                      appointmentFees,
                      appointmentState,
                      schedule_date,
                    },
                    i,
                  ) {
                    return (
                      isToday(value) && (
                        <div
                          className={`flex cursor-pointer flex-col relative sm:w-1/3 lg:w-1/4 2xl:w-1/5 grow justify-between rounded-lg 
                          ${
                            bookedAppointment?.slotTime == value
                              ? "bg-gray-700"
                              : "bg-blue-800/80"
                          } p-2`}
                          onClick={function () {
                            setBookedAppointment(function (val) {
                              return val?.slotTime == value
                                ? null
                                : freeSlots?.[i];
                            });
                          }}
                          key={value}
                        >
                          <BookButton
                            slotTime={value}
                            schedule_date={schedule_date}
                            timeZone={timeZone}
                            appointmentState={appointmentState}
                            appointmentType={appointmentType}
                            appointmentFees={appointmentFees}
                          />
                        </div>
                      )
                    );
                  })}
                </div>
                {freeSlots.length ? (
                  <Popover
                    arrow={false}
                    color={isUser && bookedAppointment ? "green" : "red"}
                    placement="topLeft"
                    trigger={"click"}
                    open={!isUser ? null : false}
                    content={
                      !isUser ? (
                        userid ? (
                          <span className="text-white font-medium">
                            it's already your profile
                          </span>
                        ) : (
                          <span className="text-white font-medium">
                            you need to signup or login
                          </span>
                        )
                      ) : bookedAppointment == null ? (
                        <span className="text-white font-medium">
                          select one Appointment
                        </span>
                      ) : (
                        <span className="text-white font-medium">Book now</span>
                      )
                    }
                  >
                    <Button
                      onClick={function () {
                        if (isToday(bookedAppointment?.slotTime)) {
                          setIsPayment("payment_processing");
                        } else {
                          messageApi?.open({
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
                      }  rounded-lg`}
                    >
                      {buttonLabel}
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
              show={
                isPayment == "payment_processing" ||
                isPayment == "payment_success"
              }
              mt="20px"
              customWidth={"w-5/6 sm:w-4/5 lg:w-3/4"}
              handleClose={function () {
                if (isPayment == "payment_success") {
                  navigate(`/profile/${doctorId}`);
                }
                setAppointmentSuccess(null);
                setIsPayment(null);
              }}
            >
              {isPayment == "payment_processing" ? (
                <AppointmentPayment
                  setIsPayment={setIsPayment}
                  bookedAppointment={bookedAppointment}
                  selectedDate={selectedDate}
                  doctorId={doctorId}
                  setBookedAppointment={setBookedAppointment}
                  messageApi={messageApi}
                  socket={socket}
                />
              ) : isPayment == "payment_success" || appointmentSuccess ? (
                <SuccessAppointment
                  isBookLoading={isBookLoading}
                  bookedAppointment={appointmentSuccess}
                />
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
