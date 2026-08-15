import {
  LoadingOutlined,
  SettingFilled,
  VideoCameraFilled,
} from "@ant-design/icons";
import { Button, Input } from "antd";
import axios from "axios";
import { OpenVidu } from "openvidu-browser";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import UserVideoComponent from "@/components/meeting/user-video";
import TitleHeader from "@/components/ui/title-header";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

const APPLICATION_SERVER_URL = import.meta.env.PROD
  ? ""
  : `http://${window.location.hostname}:5000`;
const VideoMeeting = ({ nickname, username, session, appointmentId }: any) => {
  const [sessionDetails, setSessionDetails] = useState<any>({
    myNickName: nickname,
    username: username,
    appointmentId,
    mySession: session,
    isLoading: false,
    isError: false,
    session: undefined,
    sessionException: false,
    mainStreamManager: undefined,
    publisher: undefined,
    subscribers: [],
  });
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  const navigate = useNavigate();
  const OVRef = useRef(null);
  const leaveSession = () => {
    const mySession = sessionDetails.session;
    if (mySession) {
      mySession.disconnect();
    }

    OVRef.current = null;
    setSessionDetails((sD?: any, ..._args: any[]) => ({
      ...sD,
      session: undefined,
      isLoading: false,
      sessionException: sessionDetails.subscribers.length < 1 ? "End" : false,
      isError: false,
      subscribers: [],
      mainStreamManager: undefined,
      publisher: undefined,
    }));
  };
  useEffect(() => {
    return () => leaveSession();
  }, []);
  const handleChangeUserName = (e?: any, ..._args: any[]) => {
    setSessionDetails((sD?: any, ..._args: any[]) => ({
      ...sD,
      myNickName: e.target.value,
    }));
  };
  const handleMainVideoStream = (stream?: any, ..._args: any[]) => {
    if (sessionDetails.mainStreamManager !== stream) {
      setSessionDetails((sD?: any, ..._args: any[]) => ({
        ...sD,
        mainStreamManager: stream,
      }));
    }
  };
  const deleteSubscriber = (streamManager?: any, ..._args: any[]) => {
    let subscribers = new Array(sessionDetails?.subscribers);
    let index = subscribers.indexOf(streamManager, 0);
    subscribers.splice(index, 1);
    if (index > -1) {
      if (
        streamManager.stream.connection.connectionId ==
        sessionDetails.session.connection.connectionId
      )
        setSessionDetails((sD?: any, ..._args: any[]) => ({
          ...sD,
          session: undefined,
          sessionException: false,
          subscribers: [],
          mainStreamManager: undefined,
          publisher: undefined,
        }));
      setSessionDetails((sD?: any, ..._args: any[]) => ({
        ...sD,
        subscribers: subscribers,
      }));
    }
  };
  const joinSession = () => {
    OVRef.current = new OpenVidu();
    if (!sessionDetails?.session)
      setSessionDetails((sD?: any, ..._args: any[]) => ({
        ...sD,
        isLoading: true,
      }));
    const session = OVRef.current.initSession();
    setSessionDetails((sD?: any, ..._args: any[]) => ({
      ...sD,
      session: session,
    }));
    var mySession = session;
    mySession.on("streamCreated", (event?: any, ..._args: any[]) => {
      var subscriber = mySession.subscribe(event.stream, undefined);
      var subscribers = new Array(...sessionDetails.subscribers);
      subscribers.push(subscriber);
      setSessionDetails((sD?: any, ..._args: any[]) => ({
        ...sD,
        subscribers: subscribers,
      }));
    });
    mySession.on("streamDestroyed", (event?: any, ..._args: any[]) => {
      deleteSubscriber(event.stream.streamManager);
    });
    mySession.on("sessionDisconnected", () => {
      setSessionDetails((sD?: any, ..._args: any[]) => ({
        ...sD,
        session: undefined,
        isLoading: false,
        sessionException: "Closed",
        subscribers: [],
        mainStreamManager: undefined,
        publisher: undefined,
      }));
    });

    getToken()
      .then((token?: any, ..._args: any[]) => {
        mySession
          .connect(token, {
            clientData: sessionDetails.myNickName,
          })
          .then(async () => {
            let publisher = await OVRef.current.initPublisherAsync(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              resolution: "640x480",
              frameRate: 30,
              insertMode: "APPEND",
              mirror: false,
            });

            mySession.publish(publisher);

            var devices = await OVRef.current.getDevices();
            var videoDevices = devices.filter(
              (device?: any, ..._args: any[]) => device.kind === "videoinput",
            );
            var currentVideoDeviceId = publisher.stream
              .getMediaStream()
              .getVideoTracks()[0]
              .getSettings().deviceId;
            var currentVideoDevice = videoDevices.find(
              (device?: any, ..._args: any[]) =>
                device.deviceId === currentVideoDeviceId,
            );
            setSessionDetails((sD?: any, ..._args: any[]) => ({
              ...sD,
              isLoading: false,
              currentVideoDevice: currentVideoDevice,
              mainStreamManager: publisher,
              publisher: publisher,
            }));
          })
          .catch((err?: any, ..._args: any[]) => {
            if (err?.response?.status == 401) {
              if (err?.response?.data?.data?.noSchedule) {
                setSessionDetails((sD?: any, ..._args: any[]) => ({
                  ...sD,
                  session: undefined,
                  sessionException: "noSchedule",
                  isLoading: false,
                  isError: false,
                  subscribers: [],
                  mainStreamManager: undefined,
                  publisher: undefined,
                }));
                return;
              }
              fetchUserData(true, new Cookies().get("accessToken"));
            }
            setSessionDetails((sD?: any, ..._args: any[]) => ({
              ...sD,
              session: undefined,
              isLoading: false,
              sessionException: "Expired",
              subscribers: [],
              mainStreamManager: undefined,
              publisher: undefined,
            }));
          });
      })
      .catch((err?: any, ..._args: any[]) => {
        if (err?.response?.status == 401) {
          if (err?.response?.data?.data?.noSchedule) {
            setSessionDetails((sD?: any, ..._args: any[]) => ({
              ...sD,
              session: undefined,
              sessionException: "noSchedule",
              isLoading: false,
              isError: false,
              subscribers: [],
              mainStreamManager: undefined,
              publisher: undefined,
            }));
            return;
          }
          fetchUserData(true, new Cookies().get("accessToken"));
        }
        setSessionDetails((sD?: any, ..._args: any[]) => ({
          ...sD,
          session: undefined,
          isLoading: false,
          sessionException: "Expired",
          subscribers: [],
          mainStreamManager: undefined,
          publisher: undefined,
        }));
      });
  };
  const switchCamera = async () => {
    const devices = await OVRef.current.getDevices();
    var videoDevices = devices.filter(
      (device?: any, ..._args: any[]) => device.kind === "videoinput",
    );

    if (videoDevices && videoDevices.length > 1) {
      var newVideoDevice = videoDevices.filter(
        (device?: any, ..._args: any[]) =>
          device.deviceId !== sessionDetails.currentVideoDevice.deviceId,
      );

      if (newVideoDevice.length > 0) {
        var newPublisher = OVRef.current.initPublisher(undefined, {
          videoSource: newVideoDevice[0].deviceId,
          publishAudio: true,
          publishVideo: true,
          mirror: true,
        });

        await sessionDetails.session.unpublish(
          sessionDetails.mainStreamManager,
        );

        await sessionDetails.session.publish(newPublisher);
        setSessionDetails((sD?: any, ..._args: any[]) => ({
          ...sD,
          currentVideoDevice: newVideoDevice[0],
          mainStreamManager: newPublisher,
          publisher: newPublisher,
        }));
      }
    }
  };
  const getToken = async () => {
    return await createToken(sessionDetails.mySession);
  };
  const createSession = async () => {
    setSessionDetails((sD?: any, ..._args: any[]) => ({
      ...sD,
      isLoading: true,
    }));
    await axios
      .post(
        `${APPLICATION_SERVER_URL}/join/meeting`,
        { data: { appointment_id: sessionDetails?.appointmentId } },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${new Cookies().get("accessToken")}`,
          },
        },
      )
      .then((res?: any, ..._args: any[]) => {
        setSessionDetails((sD?: any, ..._args: any[]) => ({
          ...sD,
          session: undefined,
          sessionException: false,
          mySession: res.data,
          isLoading: false,
          isError: false,
          subscribers: [],
          mainStreamManager: undefined,
          publisher: undefined,
        }));
        navigate(`/join/meeting/${res.data}?appointment_id=${appointmentId}`);
      })
      .catch((err?: any, ..._args: any[]) => {
        if (err?.response?.status == 400) {
          messageApi.open({
            key: 1,
            type: "warning",
            content: "there's something missing, try to re-login",
            duration: 3,
          });
          return;
        }
        if (err?.response?.status == 401) {
          if (err?.response?.data?.data?.noSchedule) {
            setSessionDetails((sD?: any, ..._args: any[]) => ({
              ...sD,
              session: undefined,
              sessionException: "noSchedule",
              isLoading: false,
              isError: false,
              subscribers: [],
              mainStreamManager: undefined,
              publisher: undefined,
            }));
            return;
          }
          fetchUserData(true, new Cookies().get("accessToken"));
        }
        setSessionDetails((cD?: any, ..._args: any[]) => ({
          ...cD,
          isError: true,
          session: undefined,
          isLoading: false,
          subscribers: [],
        }));
      });
  };
  const createToken = async (sessionId?: any, ..._args: any[]) => {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}/join/meeting/?session=${sessionId}`,
      {
        data: {
          appointment_id: sessionDetails.appointmentId,
          username: sessionDetails.username,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${new Cookies().get("accessToken")}`,
        },
      },
    );
    return response.data;
  };
  return (
    <>
      {sessionDetails.session === undefined || sessionDetails.isLoading ? (
        <>
          <TitleHeader
            icon={<SettingFilled className="text-white text-2xl" />}
            title={"Preparing Your Video Call"}
            wrapperBg={"w-full"}
          />
          <div
            className="m-auto items-center p-5 flex sm:w-1/2 xl:w-2/3 flex-col gap-2 
          bg-white shadow-xl rounded-lg"
          >
            {!sessionDetails.sessionException ? (
              <>
                <div className="text-blue-700 font-medium text-xl sm:text-xl lg:text-3xl">
                  Hello, {sessionDetails.username || "Type Your name"}
                </div>
                <Input
                  value={sessionDetails.myNickName}
                  className="text-center font-semibold text-lg text-white bg-blue-700/50"
                  onChange={handleChangeUserName}
                />
              </>
            ) : null}
            <VideoCameraFilled className="text-5xl sm:text-6xl my-12 lg:text-7xl text-blue-700" />
            {sessionDetails.isError ? (
              <div className="flex bg-red-500/70 my-8 rounded p-4 items-center justify-center gap-2">
                <span className="rounded p-2 font-medium text-white">
                  Some Thing goes Wrong
                </span>
                <Link
                  className="rounded-lg text-center p-4 m-0 flex items-center text-white font-medium bg-blue-500/80"
                  to="/"
                >
                  Go Home
                </Link>
              </div>
            ) : sessionDetails.sessionException ? (
              <div className="flex bg-red-500/70 my-8 rounded p-4 items-center justify-center gap-2">
                <span className="rounded p-2 font-medium text-white">
                  Session{" "}
                  {sessionDetails.sessionException == "noSchedule"
                    ? "Require Schedule"
                    : sessionDetails.sessionException}
                </span>

                <Button
                  className="rounded-lg p-4 m-0 flex items-center text-white font-medium bg-blue-500/80"
                  disabled={sessionDetails?.isLoading}
                  onClick={() => {
                    if (
                      !sessionDetails?.appointmentId ||
                      !sessionDetails?.username ||
                      !sessionDetails?.myNickName
                    )
                      messageApi.open({
                        content:
                          "please fill all required details or try again later",
                        type: "warning",
                        duration: 3,
                      });
                    else createSession();
                  }}
                >
                  Join New Call
                  {sessionDetails?.isLoading ? (
                    <LoadingOutlined className="ml-2" />
                  ) : null}
                </Button>
                {sessionDetails?.sessionException != "noSchedule" ? (
                  <Link
                    className="rounded-lg m-0 p-1 text-center border flex items-center text-white font-medium bg-blue-400/80"
                    {...({ disabled: sessionDetails?.isLoading } as any)}
                    to={"/doctors"}
                    onClick={() => {
                      if (
                        !sessionDetails?.appointmentId ||
                        !sessionDetails?.username ||
                        !sessionDetails?.myNickName
                      )
                        messageApi.open({
                          content:
                            "please fill all required details or try again later",
                          type: "warning",
                          duration: 3,
                        });
                      else createSession();
                    }}
                  >
                    find doctors
                  </Link>
                ) : null}
              </div>
            ) : null}
            {!sessionDetails.sessionException && !sessionDetails.isError ? (
              <Button
                disabled={sessionDetails?.isLoading}
                className="rounded-lg px-8 p-4 text-white flex justify-center font-medium m-0 
              items-center bg-blue-500 hover:bg-gray-400 hover:bg-blue-800"
                onClick={() => {
                  if (
                    !sessionDetails?.appointmentId ||
                    !sessionDetails?.username ||
                    !sessionDetails?.myNickName
                  )
                    messageApi.open({
                      content:
                        "please fill all required details or try again later",
                      type: "warning",
                      duration: 3,
                    });
                  else joinSession();
                }}
              >
                Join Now
                {sessionDetails?.isLoading ? (
                  <LoadingOutlined className="ml-2" />
                ) : null}
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
      <div
        className="flex min-h-screen flex-col items-center justify-center"
        style={{
          minHeight: "100vh",
        }}
      >
        {sessionDetails.session !== undefined && !sessionDetails.isLoading ? (
          <div
            id="session"
            className="flex w-6/7 grow flex-col gap-1 xl:w-3/4 2xl:w-4/5 [&_img]:inline-block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:align-baseline"
          >
            <div id="session-header flex gap-2">
              <Button
                className="p-1 bg-red-500/70 text-white hover:bg-red-700 rounded"
                onClick={leaveSession}
              >
                Leave Now
              </Button>
              <Button
                className="p-1 bg-blue-700/70 text-white hover:bg-blue-800 rounded"
                onClick={switchCamera}
              >
                Switch Camera
              </Button>
            </div>
            {sessionDetails.mainStreamManager !== undefined ? (
              <div
                id="main-video"
                className="my-2 w-full [&_p]:absolute [&_p]:left-0 [&_p]:inline-block [&_p]:rounded-br [&_p]:bg-[#f8f8f8] [&_p]:px-1.25 [&_p]:text-[22px] [&_p]:font-bold [&_p]:text-[#777] [&_video]:h-[65vh] [&_video]:cursor-auto"
              >
                <UserVideoComponent
                  streamManager={sessionDetails.mainStreamManager}
                />
              </div>
            ) : null}
            <div
              id="video-container"
              className="scroll--h flex gap-2 overflow-auto [&_img]:relative [&_img]:float-left [&_img]:h-45 [&_img]:w-1/2 [&_img]:cursor-pointer [&_img]:object-cover [&_p]:inline-block [&_p]:rounded-br [&_p]:bg-[#f8f8f8] [&_p]:px-1.25 [&_p]:font-bold [&_p]:text-[#777] [&_video]:relative [&_video]:cursor-pointer"
            >
              {sessionDetails.subscribers.map((sub?: any, ..._args: any[]) => (
                <div
                  key={sub.id}
                  className="stream-container w-1/5 sm:w-1/4 lg:w-1/4 xl:w-1/5"
                  onClick={() => handleMainVideoStream(sub)}
                >
                  <span>{sub.id}</span>
                  <UserVideoComponent streamManager={sub} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default VideoMeeting;
