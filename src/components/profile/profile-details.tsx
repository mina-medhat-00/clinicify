import { Contact, FileHeart } from "lucide-react";
import ProfileTable from "@/components/profile/profile-table";
import { FeedbackContextProvider } from "@/contexts";
import Feedbacks from "@/pages/feedbacks";

function UserDetails({
  headers,
  data,
  userValues,
  headerColor,
  propColor,
}: any) {
  return (
    <div className="flex justify-between gap-2 flex-wrap items-center">
      <ProfileTable
        headerColor={headerColor}
        propColor={propColor}
        data={data?.map(function ({ label, name }: any) {
          return {
            name: label,
            value: userValues?.[name],
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
  showEdit,
  setUserValues,
  userValues,
  username,
  setHandleDrawer,
  fetchFeedback,
}: any) {
  const profileDetails = [
    !isUser
      ? {
          data: [
            {
              label: "Specialty",
              name: "specialty",
            },
          ],
        }
      : {},
    {
      headerColor: "bg-blue-800/80",
      headers: ["Personal Details"],
      data: [
        {
          label: !isUser ? "Age" : "Birh Date",
          name: !isUser ? "age" : "bdate",
        },
        {
          label: "Phone Number",
          name: "pnumber",
        },
      ],
    },
    {
      headerColor: "bg-blue-700/80",
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
      headerColor: "bg-blue-600/80",
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
      ) : (
        <></>
      )}
      <div
        className="profile--wrapper--details 
my-5 rounded-xl"
      >
        <div className="flex justify-center items-center gap-2 mt-4 mb-4 text-white font-medium text-lg sm:text-xl p-4 bg-blue-600">
          <Contact /> Personal Information
        </div>
        {profileDetails?.map(function (
          { data, headers, headerColor, propColor }: any,
          i?: any,
          ..._args: any[]
        ) {
          return (
            <UserDetails
              key={i + 1}
              isAuth={isAuth}
              data={data}
              headerColor={headerColor}
              propColor={propColor}
              headers={headers}
              showEdit={showEdit}
              setUserValues={setUserValues}
              userValues={userValues}
            />
          );
        })}
        {!isUser && (
          <UserDetails
            isAuth={isAuth}
            showEdit={showEdit}
            setUserValues={setUserValues}
            userValues={userValues}
            data={[
              {
                label: "Specialty",
                name: "specialty",
              },
            ]}
          />
        )}
        {isAuth && (
          <div
            onClick={function () {
              setHandleDrawer(function (draw?: any, ..._args: any[]) {
                return {
                  ...draw,
                  isOpen: true,
                  type: "personal",
                  name: "My Personal Information",
                };
              });
            }}
            className="bg-gray-300/50 gap-2 hover:bg-gray-300/80 flex justify-center items-center h-24 text-center cursor-pointer text-gray-500
           text-lg sm:text-xl xl:text-2xl font-medium rounded-lg hover:shadow-sm p-3 hover:text-gray-700 grow"
          >
            <FileHeart className="w-7 h-7" />
            Edit Personal Information
          </div>
        )}
      </div>
    </>
  );
}
