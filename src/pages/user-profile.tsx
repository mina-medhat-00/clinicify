import {
  Alert,
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  Rate,
  Typography,
} from "@/components/ui";
import dayjs from "dayjs";
import { Ban, MessageCircle, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClinicDetails from "@/components/profile/clinic-details";
import ClinicForm from "@/components/profile/clinic-form";
import ClinicRegister from "@/components/profile/clinic-register";
import MedicalForm from "@/components/profile/medical-form";
import PatientRecords from "@/components/profile/patient-records";
import PersonalForm from "@/components/profile/personal-form";
import ProfileDetails from "@/components/profile/profile-details";
import AccountVerify from "@/components/schedule/account-verify";
import Loader from "@/components/ui/loader";
import ServerError from "@/components/ui/server-error";
import UserAvatar from "@/components/ui/user-avatar";
import { SlotsContextProvider } from "@/contexts";
import { useProfileContext } from "@/contexts/profile-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import BookAppointment from "@/pages/book-appointment";
import submitFeedback from "@/services/submit-feedback";

function editingObject(
  value?: any,
  setValue?: any,
  name?: any,
  ..._args: any[]
) {
  return {
    onChange: function (newValue?: any, ..._args: any[]) {
      setValue(function (val?: any, ..._args: any[]) {
        return { ...val, [name]: newValue };
      });
    },
    icon: <Pencil className="text-white size-4" />,
    tooltip: false,
    text: value,
    enterIcon: null,
  };
}

export default function UserProfile(_props?: any) {
  const { username } = useParams();
  const { socket, timeZone, messageApi } = useUtilsContext();
  const {
    isLoading: isUserLoading,
    fetchUserData,
    userData: user,
  } = useUserContext();
  const [rateValue, setRateValue] = useState(0);
  const [showEdit] = useState(false);
  const [fetchFeedback, setFetchFeedback] = useState<any>(null);
  const { isLoading, profileData, fetchProfileData, isError } =
    useProfileContext();
  const userid = user?.user_id;
  useEffect(function () {
    fetchProfileData({ path: "profile", username: username || userid });
  }, []);
  const [handleDrawer, setHandleDrawer] = useState({
    isOpen: false,
    type: "",
    name: "",
    className: "",
  });
  const [userValues, setUserValues] = useState<any>({
    nickname: null,
    about: null,
    specialty: null,
    age: null,
    bdate: null,
    pnumber: null,
    email: null,
    city: null,
    street: null,
    images: [],
  });
  useEffect(
    function () {
      if (profileData?.["user"]) {
        const bdate = profileData?.["user"]?.bdate;
        setUserValues({
          nickname: profileData?.["user"]?.nick_name,
          about: profileData?.["doctor"]?.about,
          specialty: profileData?.["doctor"]?.specialty || <Ban />,
          age: profileData?.["user"]?.age ? (
            profileData?.["user"]?.age + " years"
          ) : (
            <Ban />
          ),
          bdate: bdate || <Ban />,
          pnumber: profileData?.["user"]?.prefix
            ? `${profileData?.["user"]?.prefix} ${profileData?.["user"]?.pnumber}`
            : profileData?.["user"]?.pnumber,
          email: profileData?.["user"]?.email || <Ban />,
          city: profileData?.["user"]?.city,
          street: profileData?.["user"]?.street || <Ban />,
          images: profileData?.["user"]?.img_urls || [],
        });
      }
    },
    [profileData],
  );
  const { Title } = Typography;
  if (isLoading || isUserLoading) return <Loader />;
  else if (isError) return <ServerError />;

  const profileId = profileData?.["user"]?.user_id;
  const isVisitor = userid ? false : true;
  const isAdmin = profileData?.["user"]?.user_type == "admin";
  const isUser = profileData?.["user"]?.user_type == "doctor" ? false : true;
  const isAuth = userid && profileId == userid ? true : false;
  const isProfile = profileData?.["user"];
  const isVerified = profileData?.["doctor"]?.is_verified;
  function showDrawer(
    type?: any,
    name?: any,
    className?: any,
    ..._args: any[]
  ) {
    setHandleDrawer(function () {
      return { isOpen: true, type, name, className };
    });
  }
  return (
    <div className="profile--wrapper">
      {isProfile ? (
        <>
          {isVisitor ? (
            <div className="flex justify-center">
              <Alert
                className="my-2"
                closable
                title={
                  <span className="text-blue-900 font-medium w-full inline-block text-center">
                    You need to login or signup to use our features
                  </span>
                }
                type="info"
              />
            </div>
          ) : null}
          <div
            className="profile--intro--wrapper mt-2
      2xl:w-1/2 lg:w-2/3 w-full"
          >
            <div className="flex flex-wrap sm:flex-nowrap p-4 bg-slate-800/90 rounded-r-2xl">
              <div className="text-center w-full sm:w-1/4">
                <UserAvatar
                  src={
                    userValues?.images?.[0]?.img_url ||
                    userValues?.images?.img_url
                  }
                  userType={isUser ? "user" : "doctor"}
                  size={130}
                />
              </div>
              <div className="profile--intro ml-5 grow">
                <div
                  className="profile--intro--name
              flex flex-wrap sm:flex-nowrap items-center justify-between"
                >
                  <Title
                    editable={
                      isAuth && showEdit
                        ? editingObject(
                            userValues?.nickname,
                            setUserValues,
                            "nickname",
                          )
                        : false
                    }
                    className="whitespace-nowrap p-2 text-lg lg:text-xl 2xl:text-2xl m-0 text-white"
                  >
                    {!isUser ? "Dr. " : ""}
                    {userValues?.nickname}
                  </Title>
                  {!isAuth ? (
                    <div>
                      <Link
                        to="/chat"
                        onClick={function () {
                          window?.localStorage?.setItem("chatTo", profileId);
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
                          className={`w-full rounded-lg text-xs lg:text-sm text-white
            mt-2 p-4 flex items-center ${
              isVisitor
                ? "bg-gray-300 text-gray-500 border border-gray-700"
                : "hover:bg-gray-800 bg-gray-700"
            }
           `}
                          disabled={!userid ? true : false}
                        >
                          &nbsp;Message me
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <Button
                        onClick={function () {
                          setHandleDrawer(function (
                            draw?: any,
                            ..._args: any[]
                          ) {
                            return {
                              ...draw,
                              isOpen: true,
                              type: "personal",
                              name: "My Personal Information",
                            };
                          });
                        }}
                        className={`w-full rounded-lg text-white font-medium text-xs lg:text-sm
                        mt-2 p-4 flex items-center hover:bg-gray-800 bg-gray-700
                        `}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
                <div className="profile--about text-white p-2 my-2 text-xs md:text-sm rounded bg-gray-200/50">
                  <Title className="text-xs text-gray-100">
                    {!isUser
                      ? userValues?.about ||
                        (!isAuth ? (
                          <>
                            <Ban /> there's no introduction yet
                          </>
                        ) : (
                          <span className="text-gray-200">about me...</span>
                        ))
                      : profileData?.["patientRecords"]?.current_issue ||
                        (!isAuth ? (
                          <>
                            <Ban /> there's no issues described
                          </>
                        ) : (
                          <span className="text-gray-200">
                            describe any current issues...
                          </span>
                        ))}
                  </Title>
                </div>
                {!isUser ? (
                  <div
                    className="profile--rating flex
              justify-evenly items-center flex-wrap
              p-2 rounded bg-gray-300"
                  >
                    <div>
                      <Rate
                        value={profileData?.["doctor"]?.rate || 0}
                        disabled
                        allowHalf
                      />
                      <Title className="inline-block relative -top-2 text-xs text-gray-700">
                        &nbsp;&nbsp;{profileData?.["doctor"]?.num_rate || 0}{" "}
                        users rate
                      </Title>
                    </div>
                    {!isUser && !isAuth ? (
                      <>
                        <Button
                          className={`rounded-lg text-xs lg:text-sm text-white
                      bg-orange-800 p-4 flex items-center ${
                        isVisitor
                          ? "border border-gray-500 bg-gray-400 text-gray-600"
                          : "hover:bg-orange-600"
                      }
            `}
                          onClick={function () {
                            showDrawer("rate", "Your Feedback", "");
                          }}
                          disabled={isVisitor ? true : false}
                        >
                          Place Your Feedback
                        </Button>
                      </>
                    ) : null}
                  </div>
                ) : null}
                <Drawer
                  title={
                    <span className="text-lg font-black">
                      {handleDrawer?.name}
                    </span>
                  }
                  className={handleDrawer?.className}
                  placement="right"
                  classNames={{
                    wrapper:
                      handleDrawer.type == "medical" ||
                      handleDrawer.type == "personal" ||
                      handleDrawer.type == "clinic"
                        ? "w-full"
                        : "",
                  }}
                  open={handleDrawer?.isOpen}
                  onClose={function () {
                    setHandleDrawer(function (val?: any, ..._args: any[]) {
                      return {
                        ...val,
                        isOpen: false,
                      };
                    });
                  }}
                >
                  {handleDrawer.type == "rate" ? (
                    <>
                      <Title className="text-xs mt-4 font-medium">
                        Submit Your Rate
                      </Title>
                      <Rate
                        onChange={setRateValue}
                        allowHalf
                        defaultValue={0}
                      />
                      <Title className="text-xs mt-4 font-medium">
                        Write Any feedback About your experince with Dr.{" "}
                        {userValues?.nickname}
                      </Title>
                      <Form
                        onFinish={function (values?: any, ..._args: any[]) {
                          submitFeedback(
                            rateValue,
                            values?.feedback,
                            profileId,
                            messageApi,
                            setFetchFeedback,
                            fetchUserData,
                            username,
                          );
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
                          ></Input.TextArea>
                        </Form.Item>
                        <Form.Item className="flex justify-center">
                          <Button
                            className="rounded-lg text-xs lg:text-sm text-white
                    bg-gray-700 p-4 m-4 flex items-center hover:bg-gray-600
             "
                            htmlType="submit"
                          >
                            Submit Your Feedback
                          </Button>
                        </Form.Item>
                      </Form>
                    </>
                  ) : handleDrawer.type == "medical" ? (
                    <MedicalForm
                      isEdit={
                        profileData?.["patientRecords"]?.current_issue
                          ? true
                          : false
                      }
                      initialValues={{
                        currentIssue:
                          profileData?.["patientRecords"]?.current_issue,
                        immunizations:
                          profileData?.["patientRecords"]?.immunizations,
                        allergies: profileData?.["patientRecords"]?.allergies,
                        surgeries: profileData?.["patientRecords"]?.surgeries,
                        illnessesHistory:
                          profileData?.["patientRecords"]?.illnesses_history,
                        testResults:
                          profileData?.["patientRecords"]?.test_results,
                      }}
                      fetchProfileData={fetchProfileData}
                      fetchUserData={fetchUserData}
                      userName={profileData?.["user"]?.user_id}
                      messageApi={messageApi}
                    />
                  ) : handleDrawer.type == "personal" ? (
                    <PersonalForm
                      initialValues={{
                        nickname: profileData?.["user"]?.nick_name,
                        gender: profileData?.["user"]?.gender,
                        birth: dayjs(profileData?.["user"]?.bdate),
                        address: {
                          city: profileData?.["user"]?.city,
                          street: profileData?.["user"]?.street,
                        },
                        phone: profileData?.["user"]?.pnumber,
                        prefix: profileData?.["user"]?.prefix,
                        email: profileData?.["user"]?.email,
                      }}
                      fetchProfileData={fetchProfileData}
                      fetchUserData={fetchUserData}
                      userName={profileData?.["user"]?.user_id}
                      messageApi={messageApi}
                    />
                  ) : handleDrawer.type == "clinic" ? (
                    <ClinicForm
                      initialValues={{
                        name: "sd",
                        address: {
                          city: profileData?.["doctor"]?.clinic_city,
                          street: profileData?.["doctor"]?.clinic_street,
                        },
                        phone: profileData?.["doctor"]?.clinic_pnumber,
                        telephone: profileData?.["doctor"]?.clinic_tnumber,
                        prefix: profileData?.["doctor"]?.clinic_prefix,
                      }}
                      fetchProfileData={fetchProfileData}
                      fetchUserData={fetchUserData}
                      userName={profileData?.["user"]?.user_id}
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
                <AccountVerify isVerified={isVerified} />
              </div>
              {profileData?.["doctor"]?.clinic_city ? (
                <ClinicDetails
                  setHandleDrawer={setHandleDrawer}
                  clinicValues={profileData["doctor"]}
                  showEdit={showEdit}
                  username={username}
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
                    currentIssue:
                      profileData?.["patientRecords"]?.current_issue,
                    immunizations:
                      profileData?.["patientRecords"]?.immunizations,
                    allergies: profileData?.["patientRecords"]?.allergies,
                    surgeries: profileData?.["patientRecords"]?.surgeries,
                    illnessesHistory:
                      profileData?.["patientRecords"]?.illnesses_history,
                    testResults: profileData?.["patientRecords"]?.test_results,
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
                  timeZone={timeZone || ""}
                />
              </SlotsContextProvider>
            )}
          </div>
          <ProfileDetails
            fetchFeedback={fetchFeedback}
            setHandleDrawer={setHandleDrawer}
            isAuth={isAuth}
            isUser={isUser}
            showEdit={showEdit}
            setUserValues={setUserValues}
            userValues={userValues}
            username={username || userid}
          />
        </>
      ) : (
        <div className="h-80 flex justify-center items-center">
          <Empty
            className="my-4 font-medium text-black"
            description="cannot find any profile"
          />
        </div>
      )}
    </div>
  );
}
