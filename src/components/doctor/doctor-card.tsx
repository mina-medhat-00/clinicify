import { Card, Rate } from "@/components/ui/display";
import { Popover } from "@/components/ui/overlay";
import { Ban, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";
import BookCard from "@/components/doctor/book-card";
import UserAvatar from "@/components/ui/user-avatar";
import SlotsContextProvider from "@/contexts/slots-context";
import type { Doctor, User } from "@/types/user";

export default function DoctorCard({
  doctor,
  user,
  socket,
  timeZone,
  isLast,
}: {
  doctor: Doctor;
  user: User | null;
  socket: Socket;
  timeZone: string;
  isLast?: boolean;
}) {
  const {
    img_urls: profileImage,
    rate,
    specialty,
    fees,
    about,
    user_name: username,
    nick_name: doctorName,
    doctor_id: doctorId,
    clinic_city: city,
    clinic_street: street,
    clinic_pnumber: phone,
  } = doctor;
  const navigate = useNavigate();
  const cardDetails = [
    {
      data: [
        {
          label: "Specialty",
          value: specialty,
        },
        {
          label: "Fees",
          value: fees,
        },
      ],
    },
    {
      data: [
        {
          label: "Clinic Location",
          value: city,
        },
        {
          label: "Clinic Street",
          value: street,
        },
      ],
    },
    {
      data: [
        {
          label: "About",
          value: about,
        },
        {
          label: "Clinic Phone",
          value: phone,
        },
      ],
    },
  ];

  return (
    <div
      className={`${isLast ? "" : "grow xl:w-1/3"} cursor-default my-2 sm:m-2`}
    >
      <Card
        className="flex flex-col rounded p-2 h-full"
        hoverable
        title={
          <Link
            to={
              user?.user_name === username
                ? "/dashboard"
                : `/profile/${username}`
            }
            className="w-full text-gray-700"
            onClick={function () {
              window.localStorage.setItem("dashType", "profile");
            }}
          >
            <div className="flex gap-3 items-center">
              <div className="grow text-center whitespace-nowrap text-xl">
                Dr. {doctorName || "Doctor"}
              </div>
            </div>
          </Link>
        }
        classNames={{
          body: "p-1 grow",
        }}
        actions={[]}
      >
        <div className="h-full flex flex-col sm:flex-row sm:justify-between gap-2">
          <SlotsContextProvider>
            <BookCard doctorId={doctorId} socket={socket} timeZone={timeZone} />
          </SlotsContextProvider>
          <div className="doctor--details mt-2 flex flex-col justify-between gap-2 grow">
            <div className="doctor--image text-center">
              <UserAvatar
                className="select-none"
                size={200}
                src={profileImage}
                userType="doctor"
                onClick={function (event) {
                  event.stopPropagation();
                  event.preventDefault();
                }}
              />
              <div className="text-center">
                <Rate value={Number(rate)} disabled />
                <hr className="border m-2 border-gray-300 shadow-lg" />
              </div>
            </div>
            <div className="grow flex flex-col justify-center">
              {cardDetails.map(function ({ data }, i) {
                return (
                  <div key={i}>
                    {i !== 0 ? (
                      <hr className="border m-2 border-gray-300 shadow-lg" />
                    ) : null}
                    <div className="flex flex-wrap justify-between gap-2 font-bold">
                      {data.map(function ({ label, value }) {
                        return (
                          <div key={label}>
                            <span>{label}: </span>
                            {value ? (
                              <span className="text-blue-800">{value}</span>
                            ) : (
                              <Ban />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <Popover
              trigger="click"
              open={user ? false : null}
              content={
                <span className="font-medium">
                  you must signup/signin first
                </span>
              }
            >
              <div
                className="flex justify-center items-center hover:bg-yellow-700 bg-yellow-500 hover:text-black gap-2 rounded w-full text-gray-700 h-9"
                onClick={function (event) {
                  event.stopPropagation();
                  event.preventDefault();
                  if (user) {
                    window.localStorage.setItem("chatTo", String(doctorId));
                    void navigate("/chat");
                  }
                }}
              >
                <MessageCircle className="hover:text-black rounded py-2 text-gray-700" />
                <span className="font-medium">Ask your Question</span>
              </div>
            </Popover>
          </div>
        </div>
      </Card>
    </div>
  );
}
