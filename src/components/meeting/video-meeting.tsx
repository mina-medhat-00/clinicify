import { Button, Input } from "@/components/ui";
import axios from "axios";
import { Loader2, Settings, Video } from "lucide-react";
import { OpenVidu } from "openvidu-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import UserVideoComponent from "@/components/meeting/user-video";
import TitleHeader from "@/components/ui/title-header";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import { apiOrigin } from "@/utils/api";

const APPLICATION_SERVER_URL = apiOrigin;

export default function VideoMeeting({
  nickname,
  username,
  session,
  appointmentId,
}: any) {
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
  const sessionDetailsRef = useRef(sessionDetails);
  useEffect(
    function () {
      sessionDetailsRef.current = sessionDetails;
    },
    [sessionDetails],
  );
  const leaveSession = useCallback(function () {
    const mySession = sessionDetailsRef.current.session;
    if (mySession) {
      mySession.disconnect();
    }

    OVRef.current = null;
    setSessionDetails(function (sD?: any) {
      return {
        ...sD,
        session: undefined,
        isLoading: false,
        sessionException: sD.subscribers.length < 1 ? "End" : false,
        isError: false,
        subscribers: [],
        mainStreamManager: undefined,
        publisher: undefined,
      };
    });
  }, []);
  useEffect(
    function () {
      return function () {
        leaveSession();
      };
    },
    [leaveSession],
  );
  function handleChangeUserName(e?: any) {
    setSessionDetails(function (sD?: any) {
      return {
        ...sD,
        myNickName: e.target.value,
      };
    });
  }
  function handleMainVideoStream(stream?: any) {
    if (sessionDetails.mainStreamManager !== stream) {
      setSessionDetails(function (sD?: any) {
        return {
          ...sD,
          mainStreamManager: stream,
        };
      });
    }
  }
  function deleteSubscriber(streamManager?: any) {
    const subscribers = new Array(sessionDetails?.subscribers);
    const index = subscribers.indexOf(streamManager, 0);
    subscribers.splice(index, 1);
    if (index > -1) {
      if (
        streamManager.stream.connection.connectionId ==
        sessionDetails.session.connection.connectionId
      )
        setSessionDetails(function (sD?: any) {
          return {
            ...sD,
            session: undefined,
            sessionException: false,
            subscribers: [],
            mainStreamManager: undefined,
            publisher: undefined,
          };
        });
      setSessionDetails(function (sD?: any) {
        return {
          ...sD,
          subscribers: subscribers,
        };
      });
    }
  }
  function joinSession() {
    OVRef.current = new OpenVidu();
    if (!sessionDetails?.session)
      setSessionDetails(function (sD?: any) {
        return {
          ...sD,
          isLoading: true,
        };
      });
    const session = OVRef.current.initSession();
    setSessionDetails(function (sD?: any) {
      return {
        ...sD,
        session: session,
      };
    });
    const mySession = session;
    mySession.on("streamCreated", function (event?: any) {
      const subscriber = mySession.subscribe(event.stream, undefined);
      const subscribers = new Array(...sessionDetails.subscribers);
      subscribers.push(subscriber);
      setSessionDetails(function (sD?: any) {
        return {
          ...sD,
          subscribers: subscribers,
        };
      });
    });
    mySession.on("streamDestroyed", function (event?: any) {
      deleteSubscriber(event.stream.streamManager);
    });
    mySession.on("sessionDisconnected", function () {
      setSessionDetails(function (sD?: any) {
        return {
          ...sD,
          session: undefined,
          isLoading: false,
          sessionException: "Closed",
          subscribers: [],
          mainStreamManager: undefined,
          publisher: undefined,
        };
      });
    });

    getToken()
      .then(function (token?: any) {
        mySession
          .connect(token, {
            clientData: sessionDetails.myNickName,
          })
          .then(async function () {
            const publisher = await OVRef.current.initPublisherAsync(
              undefined,
              {
                audioSource: undefined,
                videoSource: undefined,
                publishAudio: true,
                publishVideo: true,
                resolution: "640x480",
                frameRate: 30,
                insertMode: "APPEND",
                mirror: false,
              },
            );

            mySession.publish(publisher);

            const devices = await OVRef.current.getDevices();
            const videoDevices = devices.filter(function (device?: any) {
              return device.kind === "videoinput";
            });
            const currentVideoDeviceId = publisher.stream
              .getMediaStream()
              .getVideoTracks()[0]
              .getSettings().deviceId;
            const currentVideoDevice = videoDevices.find(function (
              device?: any,
            ) {
              return device.deviceId === currentVideoDeviceId;
            });
            setSessionDetails(function (sD?: any) {
              return {
                ...sD,
                isLoading: false,
                currentVideoDevice: currentVideoDevice,
                mainStreamManager: publisher,
                publisher: publisher,
              };
            });
          })
          .catch(function (err?: any) {
            if (err?.response?.status == 401) {
              if (err?.response?.data?.data?.noSchedule) {
                setSessionDetails(function (sD?: any) {
                  return {
                    ...sD,
                    session: undefined,
                    sessionException: "noSchedule",
                    isLoading: false,
                    isError: false,
                    subscribers: [],
                    mainStreamManager: undefined,
                    publisher: undefined,
                  };
                });
                return;
              }
              fetchUserData(true, new Cookies().get("accessToken"));
            }
            setSessionDetails(function (sD?: any) {
              return {
                ...sD,
                session: undefined,
                isLoading: false,
                sessionException: "Expired",
                subscribers: [],
                mainStreamManager: undefined,
                publisher: undefined,
              };
            });
          });
      })
      .catch(function (err?: any) {
        if (err?.response?.status == 401) {
          if (err?.response?.data?.data?.noSchedule) {
            setSessionDetails(function (sD?: any) {
              return {
                ...sD,
                session: undefined,
                sessionException: "noSchedule",
                isLoading: false,
                isError: false,
                subscribers: [],
                mainStreamManager: undefined,
                publisher: undefined,
              };
            });
            return;
          }
          fetchUserData(true, new Cookies().get("accessToken"));
        }
        setSessionDetails(function (sD?: any) {
          return {
            ...sD,
            session: undefined,
            isLoading: false,
            sessionException: "Expired",
            subscribers: [],
            mainStreamManager: undefined,
            publisher: undefined,
          };
        });
      });
  }
  async function switchCamera() {
    const devices = await OVRef.current.getDevices();
    const videoDevices = devices.filter(function (device?: any) {
      return device.kind === "videoinput";
    });

    if (videoDevices && videoDevices.length > 1) {
      const newVideoDevice = videoDevices.filter(function (device?: any) {
        return device.deviceId !== sessionDetails.currentVideoDevice.deviceId;
      });

      if (newVideoDevice.length > 0) {
        const newPublisher = OVRef.current.initPublisher(undefined, {
          videoSource: newVideoDevice[0].deviceId,
          publishAudio: true,
          publishVideo: true,
          mirror: true,
        });

        await sessionDetails.session.unpublish(
          sessionDetails.mainStreamManager,
        );

        await sessionDetails.session.publish(newPublisher);
        setSessionDetails(function (sD?: any) {
          return {
            ...sD,
            currentVideoDevice: newVideoDevice[0],
            mainStreamManager: newPublisher,
            publisher: newPublisher,
          };
        });
      }
    }
  }
  async function getToken() {
    return await createToken(sessionDetails.mySession);
  }
  async function createSession() {
    setSessionDetails(function (sD?: any) {
      return {
        ...sD,
        isLoading: true,
      };
    });
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
      .then(function (res?: any) {
        setSessionDetails(function (sD?: any) {
          return {
            ...sD,
            session: undefined,
            sessionException: false,
            mySession: res.data,
            isLoading: false,
            isError: false,
            subscribers: [],
            mainStreamManager: undefined,
            publisher: undefined,
          };
        });
        navigate(`/join/meeting/${res.data}?appointment_id=${appointmentId}`);
      })
      .catch(function (err?: any) {
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
            setSessionDetails(function (sD?: any) {
              return {
                ...sD,
                session: undefined,
                sessionException: "noSchedule",
                isLoading: false,
                isError: false,
                subscribers: [],
                mainStreamManager: undefined,
                publisher: undefined,
              };
            });
            return;
          }
          fetchUserData(true, new Cookies().get("accessToken"));
        }
        setSessionDetails(function (cD?: any) {
          return {
            ...cD,
            isError: true,
            session: undefined,
            isLoading: false,
            subscribers: [],
          };
        });
      });
  }
  async function createToken(sessionId?: any) {
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
  }
  return (
    <>
      {sessionDetails.session === undefined || sessionDetails.isLoading ? (
        <>
          <TitleHeader
            icon={<Settings className="text-white text-2xl" />}
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
            <Video className="text-5xl sm:text-6xl my-12 lg:text-7xl text-blue-700" />
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
                  onClick={function () {
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
                    <Loader2 className="ml-2 animate-spin" />
                  ) : null}
                </Button>
                {sessionDetails?.sessionException != "noSchedule" ? (
                  <Link
                    className="rounded-lg m-0 p-1 text-center border flex items-center text-white font-medium bg-blue-400/80"
                    {...({ disabled: sessionDetails?.isLoading } as any)}
                    to={"/doctors"}
                    onClick={function () {
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
              items-center bg-blue-500 hover:bg-blue-800"
                onClick={function () {
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
                  <Loader2 className="ml-2 animate-spin" />
                ) : null}
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
      <div className="flex min-h-screen flex-col items-center justify-center">
        {sessionDetails.session !== undefined && !sessionDetails.isLoading ? (
          <div
            id="session"
            className="flex w-5/6 grow flex-col gap-1 xl:w-3/4 2xl:w-4/5 [&_img]:inline-block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:align-baseline"
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
                className="my-2 w-full [&_p]:absolute [&_p]:left-0 [&_p]:inline-block [&_p]:rounded-br [&_p]:bg-neutral-50 [&_p]:px-1 [&_p]:text-xl [&_p]:font-bold [&_p]:text-neutral-500 [&_video]:h-screen [&_video]:cursor-auto"
              >
                <UserVideoComponent
                  streamManager={sessionDetails.mainStreamManager}
                />
              </div>
            ) : null}
            <div
              id="video-container"
              className="scroll--h flex gap-2 overflow-auto [&_img]:relative [&_img]:float-left [&_img]:h-44 [&_img]:w-1/2 [&_img]:cursor-pointer [&_img]:object-cover [&_p]:inline-block [&_p]:rounded-br [&_p]:bg-neutral-50 [&_p]:px-1 [&_p]:font-bold [&_p]:text-neutral-500 [&_video]:relative [&_video]:cursor-pointer"
            >
              {sessionDetails.subscribers.map(function (sub?: any) {
                return (
                  <div
                    key={sub.id}
                    className="stream-container w-1/5 sm:w-1/4 lg:w-1/4 xl:w-1/5"
                    onClick={function () {
                      handleMainVideoStream(sub);
                    }}
                  >
                    <span>{sub.id}</span>
                    <UserVideoComponent streamManager={sub} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
