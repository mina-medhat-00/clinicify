import { Alert, Empty, Rate, Typography } from "@/components/ui/display";
import { Button, Input } from "@/components/ui/controls";
import { Drawer } from "@/components/ui/overlay";
import { Form } from "@/components/ui/form";
import dayjs from "dayjs";
import { Ban, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClinicDetails from "@/components/profile/clinic-details";
import ClinicForm from "@/components/profile/clinic-form";
import ClinicRegister from "@/components/profile/clinic-register";
import MedicalForm from "@/components/profile/medical-form";
import PatientRecords from "@/components/profile/patient-records";
import PersonalForm from "@/components/profile/personal-form";
import ProfileDetails, {
  type ProfileValues,
} from "@/components/profile/profile-details";
import AccountVerify from "@/components/schedule/account-verify";
import Loader from "@/components/ui/loader";
import ServerError from "@/components/ui/server-error";
import UserAvatar from "@/components/ui/user-avatar";
import SlotsContextProvider from "@/contexts/slots-context";
import { useProfileContext } from "@/contexts/profile-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import BookAppointment from "@/pages/book-appointment";
import submitFeedback from "@/services/submit-feedback";
import type { ProfileData } from "@/types/clinic";
import type { ProfileDrawer } from "@/types/profile-drawer";

const { Title } = Typography;

// Empty strings count as missing too.
function filled(value: string | null | undefined): value is string {
  return Boolean(value);
}

// Missing values show as a "none" icon.
function orBan(value: string | null | undefined) {
  return filled(value) ? value : <Ban />;
}

function profileValues({ user, doctor }: ProfileData): ProfileValues {
  return {
    nickname: user.nick_name,
    about: doctor?.about,
    specialty: orBan(doctor?.specialty),
    age: user.age ? `${String(user.age)} years` : <Ban />,
    bdate: orBan(user.bdate),
    pnumber: user.prefix
      ? `${user.prefix} ${user.pnumber ?? ""}`
      : user.pnumber,
    email: orBan(user.email),
    city: user.city,
    street: orBan(user.street),
    images: user.img_urls,
  };
}

const closedDrawer: ProfileDrawer = {
  isOpen: false,
  type: "",
  name: "",
  className: "",
};

export default function UserProfile() {
  const { username } = useParams();
  const { socket, timeZone, messageApi } = useUtilsContext();
  const {
    isLoading: isUserLoading,
    fetchUserData,
    userData: user,
  } = useUserContext();
  const [rateValue, setRateValue] = useState(0);
  // Counts submitted reviews, so the review list reloads after each one.
  const [fetchFeedback, setFetchFeedback] = useState<number | null>(null);
  const { isLoading, profileData, fetchProfileData, isError } =
    useProfileContext();
  const userid = user?.user_id;
  // The URL names the profile; dashboards (no URL param) show the user's own.
  const profileKey = username ?? userid;
  useEffect(
    function () {
      if (profileKey !== undefined) void fetchProfileData(profileKey);
    },
    [fetchProfileData, profileKey],
  );
  const [handleDrawer, setHandleDrawer] = useState<ProfileDrawer>(closedDrawer);
  if (isLoading || isUserLoading) return <Loader />;
  else if (isError) return <ServerError />;
  if (!profileData)
    return (
      <div className="profile--wrapper">
        <div className="h-80 flex justify-center items-center">
          <Empty
            className="my-4 font-medium text-black"
            description="cannot find any profile"
          />
        </div>
      </div>
    );

  const { user: profileUser, doctor, patientRecords } = profileData;
  const userValues = profileValues(profileData);
  const profileId = profileUser.user_id;
  const isVisitor = !userid;
  const isAdmin = profileUser.user_type === "admin";
  const isUser = profileUser.user_type !== "doctor";
  const isAuth = userid !== undefined && profileId === userid;
  function openDrawer(
    type: ProfileDrawer["type"],
    name: string,
    className = "",
  ) {
    setHandleDrawer({ isOpen: true, type, name, className });
  }
  return (
    <div className="profile--wrapper">
      {isVisitor ? (
        <div className="flex justify-center">
          <Alert
            className="my-2"
            closable={{}}
            description={
              <span className="text-blue-900 font-medium w-full inline-block text-center">
                You need to login or signup to use our features
              </span>
            }
            type="info"
          />
        </div>
      ) : null}
      <div className="profile--intro--wrapper mt-2 2xl:w-1/2 lg:w-2/3 w-full">
        <div className="flex flex-wrap sm:flex-nowrap p-4 bg-slate-800/90 rounded-r-2xl">
          <div className="text-center w-full sm:w-1/4">
            <UserAvatar
              src={userValues.images[0]?.img_url}
              userType={isUser ? "user" : "doctor"}
              size={130}
            />
          </div>
          <div className="profile--intro ml-5 grow">
            <div className="profile--intro--name flex flex-wrap sm:flex-nowrap items-center justify-between">
              <Title className="whitespace-nowrap p-2 text-lg lg:text-xl 2xl:text-2xl m-0 text-white">
                {!isUser ? "Dr. " : ""}
                {userValues.nickname}
              </Title>
              {!isAuth ? (
                <div>
                  <Link
                    to="/chat"
                    onClick={function () {
                      window.localStorage.setItem("chatTo", String(profileId));
                    }}
                  >
                    <Button
                      icon={
                        <MessageCircle
                          className={`size-7 ${
                            isVisitor ? "text-gray-500" : "text-yellow-400"
                          }`}
                        />
                      }
                      className={`w-full rounded-lg text-xs lg:text-sm text-white mt-2 p-4 flex items-center ${
                        isVisitor
                          ? "bg-gray-300 text-gray-500 border border-gray-700"
                          : "hover:bg-gray-800 bg-gray-700"
                      }`}
                      disabled={isVisitor}
                    >
                      &nbsp;Message me
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <Button
                    onClick={function () {
                      openDrawer("personal", "My Personal Information");
                    }}
                    className="w-full rounded-lg text-white font-medium text-xs lg:text-sm mt-2 p-4 flex items-center hover:bg-gray-800 bg-gray-700"
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
            <div className="profile--about text-white p-2 my-2 text-xs md:text-sm rounded bg-gray-200/50">
              <Title className="text-xs text-gray-100">
                {!isUser ? (
                  filled(doctor?.about) ? (
                    doctor.about
                  ) : !isAuth ? (
                    <>
                      <Ban /> there's no introduction yet
                    </>
                  ) : (
                    <span className="text-gray-200">about me...</span>
                  )
                ) : filled(patientRecords?.current_issue) ? (
                  patientRecords.current_issue
                ) : !isAuth ? (
                  <>
                    <Ban /> there's no issues described
                  </>
                ) : (
                  <span className="text-gray-200">
                    describe any current issues...
                  </span>
                )}
              </Title>
            </div>
            {!isUser ? (
              <div className="profile--rating flex justify-evenly items-center flex-wrap p-2 rounded bg-gray-300">
                <div>
                  <Rate value={doctor?.rate ?? 0} disabled allowHalf />
                  <Title className="inline-block relative -top-2 text-xs text-gray-700">
                    &nbsp;&nbsp;{doctor?.num_rate ?? 0} users rate
                  </Title>
                </div>
                {!isAuth ? (
                  <Button
                    className={`rounded-lg text-xs lg:text-sm text-white bg-orange-800 p-4 flex items-center ${
                      isVisitor
                        ? "border border-gray-500 bg-gray-400 text-gray-600"
                        : "hover:bg-orange-600"
                    }`}
                    onClick={function () {
                      openDrawer("rate", "Your Feedback");
                    }}
                    disabled={isVisitor}
                  >
                    Place Your Feedback
                  </Button>
                ) : null}
              </div>
            ) : null}
            <Drawer
              title={
                <span className="text-lg font-black">{handleDrawer.name}</span>
              }
              className={handleDrawer.className}
              placement="right"
              classNames={{
                wrapper:
                  handleDrawer.type === "medical" ||
                  handleDrawer.type === "personal" ||
                  handleDrawer.type === "clinic"
                    ? "w-full"
                    : "",
              }}
              open={handleDrawer.isOpen}
              onClose={function () {
                setHandleDrawer(function (current) {
                  return { ...current, isOpen: false };
                });
              }}
            >
              {handleDrawer.type === "rate" ? (
                <>
                  <Title className="text-xs mt-4 font-medium">
                    Submit Your Rate
                  </Title>
                  <Rate onChange={setRateValue} allowHalf defaultValue={0} />
                  <Title className="text-xs mt-4 font-medium">
                    Write Any feedback About your experince with Dr.{" "}
                    {userValues.nickname}
                  </Title>
                  <Form<{ feedback: string }>
                    onFinish={function (values) {
                      if (!rateValue) {
                        messageApi.open({
                          key: 1,
                          type: "warning",
                          content: "please choose a rating first",
                          duration: 3,
                        });
                        return;
                      }
                      void submitFeedback({
                        rate: rateValue,
                        feedback: values.feedback,
                        doctorId: profileId,
                        messageApi,
                        fetchUserData,
                      }).then(function (sent) {
                        if (sent)
                          setFetchFeedback(function (count) {
                            return (count ?? 0) + 1;
                          });
                      });
                    }}
                  >
                    <Form.Item
                      name="feedback"
                      rules={[
                        {
                          required: true,
                          message: "please, type any feedback",
                        },
                      ]}
                    >
                      <Input.TextArea
                        maxLength={300}
                        placeholder="place your feedback here"
                      />
                    </Form.Item>
                    <Form.Item className="flex justify-center">
                      <Button
                        className="rounded-lg text-xs lg:text-sm text-white bg-gray-700 p-4 m-4 flex items-center hover:bg-gray-600"
                        htmlType="submit"
                      >
                        Submit Your Feedback
                      </Button>
                    </Form.Item>
                  </Form>
                </>
              ) : handleDrawer.type === "medical" ? (
                <MedicalForm
                  isEdit={Boolean(patientRecords?.current_issue)}
                  initialValues={{
                    currentIssue: patientRecords?.current_issue,
                    immunizations: patientRecords?.immunizations,
                    allergies: patientRecords?.allergies,
                    surgeries: patientRecords?.surgeries,
                    illnessesHistory: patientRecords?.illnesses_history,
                    testResults: patientRecords?.test_results,
                  }}
                  fetchProfileData={fetchProfileData}
                  fetchUserData={fetchUserData}
                  userName={profileId}
                  messageApi={messageApi}
                />
              ) : handleDrawer.type === "personal" ? (
                <PersonalForm
                  initialValues={{
                    nickname: profileUser.nick_name,
                    gender: profileUser.gender,
                    birth: dayjs(profileUser.bdate),
                    address: {
                      city: profileUser.city,
                      street: profileUser.street,
                    },
                    phone: profileUser.pnumber,
                    prefix: profileUser.prefix,
                    email: profileUser.email,
                  }}
                  fetchProfileData={fetchProfileData}
                  fetchUserData={fetchUserData}
                  userName={profileId}
                  messageApi={messageApi}
                />
              ) : handleDrawer.type === "clinic" ? (
                <ClinicForm
                  initialValues={{
                    address: {
                      city: doctor?.clinic_city,
                      street: doctor?.clinic_street,
                    },
                    phone: doctor?.clinic_pnumber,
                    telephone: doctor?.clinic_tnumber,
                    prefix: doctor?.clinic_prefix,
                  }}
                  fetchProfileData={fetchProfileData}
                  fetchUserData={fetchUserData}
                  userName={profileId}
                  messageApi={messageApi}
                />
              ) : null}
            </Drawer>
          </div>
        </div>
      </div>
      {!isUser && isAuth ? (
        <div className="mx-1 sm:mx-0">
          <div className="mt-2 sm:w-4/5 lg:w-3/4 m-auto">
            <AccountVerify isVerified={doctor?.is_verified} />
          </div>
          {doctor?.clinic_city ? (
            <ClinicDetails
              setHandleDrawer={setHandleDrawer}
              clinicValues={doctor}
            />
          ) : (
            <ClinicRegister />
          )}
        </div>
      ) : null}
      <div className="mt-2">
        {isUser && !isAdmin ? (
          <div>
            <PatientRecords
              isAuth={isAuth}
              setHandleDrawer={setHandleDrawer}
              records={{
                currentIssue: patientRecords?.current_issue,
                immunizations: patientRecords?.immunizations,
                allergies: patientRecords?.allergies,
                surgeries: patientRecords?.surgeries,
                illnessesHistory: patientRecords?.illnesses_history,
                testResults: patientRecords?.test_results,
              }}
            />
          </div>
        ) : null}
        {!isUser && !isAuth && (
          <SlotsContextProvider>
            <BookAppointment
              userid={userid}
              doctorId={profileId}
              socket={socket}
              timeZone={timeZone}
            />
          </SlotsContextProvider>
        )}
      </div>
      <ProfileDetails
        fetchFeedback={fetchFeedback}
        setHandleDrawer={setHandleDrawer}
        isAuth={isAuth}
        isUser={isUser}
        userValues={userValues}
        username={
          username ?? (userid === undefined ? undefined : String(userid))
        }
      />
    </div>
  );
}
