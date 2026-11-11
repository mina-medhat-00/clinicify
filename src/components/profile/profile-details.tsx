import { Contact, FileHeart } from "lucide-react";
import "react";
import type { SetProfileDrawer } from "@/types/profile-drawer";
import ProfileTable from "@/components/profile/profile-table";
import FeedbackContextProvider from "@/contexts/feedback-context";
import Feedbacks from "@/pages/feedbacks";
import type { ProfileValues, DetailsSection } from "@/types/profile";

function UserDetails({
  headers,
  data,
  userValues,
  headerColor,
  propColor,
}: DetailsSection & { userValues: ProfileValues }) {
  return (
    <div className="flex justify-between gap-2 flex-wrap items-center">
      <ProfileTable
        headerColor={headerColor}
        propColor={propColor}
        data={data.map(function ({ label, name }) {
          return {
            name: label,
            value: userValues[name],
          };
        })}
        headers={headers}
      />
    </div>
  );
}

export default function ProfileDetails({
  isAuth,
  isUser,
  userValues,
  username,
  setHandleDrawer,
  fetchFeedback,
}: {
  isAuth: boolean;
  // Patient or admin profile rather than a doctor's
  isUser: boolean;
  userValues: ProfileValues;
  username?: string;
  setHandleDrawer: SetProfileDrawer;
  fetchFeedback: number | null;
}) {
  const profileDetails: DetailsSection[] = [
    ...(!isUser
      ? [{ data: [{ label: "Specialty", name: "specialty" as const }] }]
      : []),
    {
      headers: ["Personal Details"],
      data: [
        {
          label: !isUser ? "Age" : "Birth Date",
          name: !isUser ? "age" : "bdate",
        },
        {
          label: "Phone Number",
          name: "pnumber",
        },
      ],
    },
    {
      headers: ["Address"],
      data: [
        {
          label: "City",
          name: "city",
        },
        {
          label: "Street",
          name: "street",
        },
      ],
    },
    {
      headers: ["Contact"],
      data: [
        {
          label: "Email",
          name: "email",
        },
      ],
    },
  ];
  return (
    <>
      {!isUser ? (
        <FeedbackContextProvider noDirectFetch>
          <Feedbacks
            noDirectFetch
            username={username}
            fetchFeedback={fetchFeedback}
          />
        </FeedbackContextProvider>
      ) : null}
      <div className="profile--wrapper--details my-5 rounded-xl">
        <div className="flex justify-center items-center gap-2 mt-4 mb-4 text-white font-medium text-lg sm:text-xl p-4 bg-blue-900">
          <Contact /> Personal Information
        </div>
        {profileDetails.map(function (section, i) {
          return <UserDetails key={i} {...section} userValues={userValues} />;
        })}
        {isAuth && (
          <div
            onClick={function () {
              setHandleDrawer(function (draw) {
                return {
                  ...draw,
                  isOpen: true,
                  type: "personal",
                  name: "My Personal Information",
                };
              });
            }}
            className="bg-gray-300/50 gap-2 hover:bg-gray-300/80 flex justify-center items-center h-24 text-center cursor-pointer text-gray-500 text-lg sm:text-xl xl:text-2xl font-medium rounded-lg hover:shadow-sm p-3 hover:text-gray-700 grow"
          >
            <FileHeart className="w-7 h-7" />
            Edit Personal Information
          </div>
        )}
      </div>
    </>
  );
}
