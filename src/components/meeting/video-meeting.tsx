import { Button, Input } from "@/components/ui/controls";
import { Loader2, Settings, Video } from "lucide-react";
import {
  OpenVidu,
  type Device,
  type Publisher,
  type Session,
  type StreamManager,
  type Subscriber,
} from "openvidu-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserVideoComponent from "@/components/meeting/user-video";
import TitleHeader from "@/components/ui/title-header";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import { api, errorData, errorStatus } from "@/services/client";
import { toQuery } from "@/utils/query";

// Why the call is not showing: it ended, the other side closed it, it needs
// a booked appointment, or the session expired.
type SessionException = false | "End" | "Closed" | "noSchedule" | "Expired";

interface MeetingState {
  myNickName: string;
  username: string;
  appointmentId: string;
  // The OpenVidu session id.
  mySession: string;
  isLoading: boolean;
  isError: boolean;
  session?: Session;
  sessionException: SessionException;
  mainStreamManager?: StreamManager;
  publisher?: Publisher;
  subscribers: Subscriber[];
  currentVideoDevice?: Device;
}

// Everything about a live call, cleared when it stops.
const noCall = {
  session: undefined,
  mainStreamManager: undefined,
  publisher: undefined,
  subscribers: [],
} satisfies Partial<MeetingState>;

export default function VideoMeeting({
  nickname,
  username,
  session,
  appointmentId,
}: {
  nickname: string;
  username: string;
  session: string;
  appointmentId: string;
}) {
  const [sessionDetails, setSessionDetails] = useState<MeetingState>({
    ...noCall,
    myNickName: nickname,
    username,
    appointmentId,
    mySession: session,
    isLoading: false,
    isError: false,
    sessionException: false,
  });
  const { messageApi } = useUtilsContext();
  const { fetchUserData } = useUserContext();
  const navigate = useNavigate();
  const OVRef = useRef<OpenVidu | null>(null);
  const sessionDetailsRef = useRef(sessionDetails);
  useEffect(
    function () {
      sessionDetailsRef.current = sessionDetails;
    },
    [sessionDetails],
  );
  function update(values: Partial<MeetingState>) {
    setSessionDetails(function (current) {
      return { ...current, ...values };
    });
  }
  const leaveSession = useCallback(function () {
    sessionDetailsRef.current.session?.disconnect();
    OVRef.current = null;
    setSessionDetails(function (current) {
      return {
        ...current,
        ...noCall,
        isLoading: false,
        sessionException: current.subscribers.length < 1 ? "End" : false,
        isError: false,
      };
    });
  }, []);
  useEffect(
    function () {
      return leaveSession;
    },
    [leaveSession],
  );

  // A 401 with noSchedule means there is no running appointment; any other
  // 401 means the sign-in expired.
  function handleCallError(err: unknown) {
    if (errorStatus(err) === 401) {
      if (errorData(err)?.noSchedule) {
        update({
          ...noCall,
          sessionException: "noSchedule",
          isLoading: false,
          isError: false,
        });
        return;
      }
      void fetchUserData({ silent: true });
    }
    update({ ...noCall, isLoading: false, sessionException: "Expired" });
  }

  function hasDetails() {
    const ok = Boolean(
      sessionDetails.appointmentId &&
      sessionDetails.username &&
      sessionDetails.myNickName,
    );
    if (!ok)
      messageApi.open({
        content: "please fill all required details or try again later",
        type: "warning",
        duration: 3,
      });
    return ok;
  }

  // The token that lets this user into the OpenVidu session (plain text).
  async function createToken() {
    const response = await api.post<string>(
      `/join/meeting/${toQuery({ session: sessionDetails.mySession })}`,
      {
        data: {
          appointment_id: sessionDetails.appointmentId,
          username: sessionDetails.username,
        },
      },
    );
    return response.data;
  }

  async function startCall(OV: OpenVidu, mySession: Session) {
    const token = await createToken();
    await mySession.connect(token, {
      clientData: sessionDetails.myNickName,
    });
    const publisher = await OV.initPublisherAsync(undefined, {
      audioSource: undefined,
      videoSource: undefined,
      publishAudio: true,
      publishVideo: true,
      resolution: "640x480",
      frameRate: 30,
      insertMode: "APPEND",
      mirror: false,
    });
    await mySession.publish(publisher);
    const devices = await OV.getDevices();
    const currentVideoDeviceId = publisher.stream
      .getMediaStream()
      .getVideoTracks()[0]
      ?.getSettings().deviceId;
    const currentVideoDevice = devices.find(function (device) {
      return (
        device.kind === "videoinput" && device.deviceId === currentVideoDeviceId
      );
    });
    update({
      isLoading: false,
      currentVideoDevice,
      mainStreamManager: publisher,
      publisher,
    });
  }

  function joinSession() {
    const OV = new OpenVidu();
    OVRef.current = OV;
    const mySession = OV.initSession();
    update({ session: mySession, isLoading: true });
    mySession.on("streamCreated", function (event) {
      const subscriber = mySession.subscribe(event.stream, undefined);
      setSessionDetails(function (current) {
        return {
          ...current,
          subscribers: [...current.subscribers, subscriber],
        };
      });
    });
    mySession.on("streamDestroyed", function (event) {
      const gone = event.stream.streamManager;
      setSessionDetails(function (current) {
        return {
          ...current,
          subscribers: current.subscribers.filter(function (subscriber) {
            return subscriber !== gone;
          }),
        };
      });
    });
    mySession.on("sessionDisconnected", function () {
      update({ ...noCall, isLoading: false, sessionException: "Closed" });
    });
    startCall(OV, mySession).catch(handleCallError);
  }

  async function switchCamera() {
    const OV = OVRef.current;
    const {
      session: mySession,
      publisher,
      currentVideoDevice,
    } = sessionDetails;
    if (!OV || !mySession) return;
    const devices = await OV.getDevices();
    const nextDevice = devices.find(function (device) {
      return (
        device.kind === "videoinput" &&
        device.deviceId !== currentVideoDevice?.deviceId
      );
    });
    if (!nextDevice) return;
    const newPublisher = OV.initPublisher(undefined, {
      videoSource: nextDevice.deviceId,
      publishAudio: true,
      publishVideo: true,
      mirror: true,
    });
    // Replace our own camera, whichever video is enlarged.
    if (publisher) await mySession.unpublish(publisher);
    await mySession.publish(newPublisher);
    update({
      currentVideoDevice: nextDevice,
      mainStreamManager: newPublisher,
      publisher: newPublisher,
    });
  }

  // Asks the API for a fresh session for this appointment.
  function createSession() {
    update({ isLoading: true });
    api
      .post<string>("/join/meeting", {
        data: { appointment_id: sessionDetails.appointmentId },
      })
      .then(function ({ data: newSession }) {
        update({
          ...noCall,
          sessionException: false,
          mySession: newSession,
          isLoading: false,
          isError: false,
        });
        void navigate(
          `/join/meeting/${newSession}${toQuery({ appointment_id: appointmentId })}`,
        );
      })
      .catch(function (err: unknown) {
        if (errorStatus(err) === 400) {
          update({ isLoading: false });
          messageApi.open({
            key: 1,
            type: "warning",
            content: "there's something missing, try to re-login",
            duration: 3,
          });
          return;
        }
        if (errorStatus(err) === 401) {
          handleCallError(err);
          return;
        }
        update({
          isError: true,
          session: undefined,
          isLoading: false,
          subscribers: [],
        });
      });
  }

  const inCall =
    sessionDetails.session !== undefined && !sessionDetails.isLoading;
  return (
    <>
      {!inCall ? (
        <>
          <TitleHeader
            icon={<Settings className="text-white text-2xl" />}
            title="Preparing Your Video Call"
            wrapperBg="w-full"
          />
          <div className="m-auto items-center p-5 flex sm:w-1/2 xl:w-2/3 flex-col gap-2 bg-white shadow-xl rounded-lg">
            {!sessionDetails.sessionException ? (
              <>
                <div className="text-blue-700 font-medium text-xl sm:text-xl lg:text-3xl">
                  Hello, {sessionDetails.username || "Type Your name"}
                </div>
                <Input
                  value={sessionDetails.myNickName}
                  className="text-center font-semibold text-lg text-white bg-blue-700/50"
                  onChange={function (event) {
                    update({ myNickName: event.target.value });
                  }}
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
                  {sessionDetails.sessionException === "noSchedule"
                    ? "Require Schedule"
                    : sessionDetails.sessionException}
                </span>
                <Button
                  className="rounded-lg p-4 m-0 flex items-center text-white font-medium bg-blue-500/80"
                  disabled={sessionDetails.isLoading}
                  onClick={function () {
                    if (hasDetails()) createSession();
                  }}
                >
                  Join New Call
                  {sessionDetails.isLoading ? (
                    <Loader2 className="ml-2 animate-spin" />
                  ) : null}
                </Button>
                {sessionDetails.sessionException !== "noSchedule" ? (
                  <Link
                    className="rounded-lg m-0 p-1 text-center border flex items-center text-white font-medium bg-blue-400/80"
                    to="/doctors"
                  >
                    find doctors
                  </Link>
                ) : null}
              </div>
            ) : null}
            {!sessionDetails.sessionException && !sessionDetails.isError ? (
              <Button
                disabled={sessionDetails.isLoading}
                className="rounded-lg px-8 p-4 text-white flex justify-center font-medium m-0 items-center bg-blue-500 hover:bg-blue-800"
                onClick={function () {
                  if (hasDetails()) joinSession();
                }}
              >
                Join Now
                {sessionDetails.isLoading ? (
                  <Loader2 className="ml-2 animate-spin" />
                ) : null}
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
      <div className="flex min-h-screen flex-col items-center justify-center">
        {inCall ? (
          <div
            id="session"
            className="flex w-5/6 grow flex-col gap-1 xl:w-3/4 2xl:w-4/5 [&_img]:inline-block [&_img]:h-auto [&_img]:w-full [&_img]:object-contain [&_img]:align-baseline"
          >
            <div id="session-header" className="flex gap-2">
              <Button
                className="p-1 bg-red-500/70 text-white hover:bg-red-700 rounded"
                onClick={leaveSession}
              >
                Leave Now
              </Button>
              <Button
                className="p-1 bg-blue-700/70 text-white hover:bg-blue-800 rounded"
                onClick={function () {
                  switchCamera().catch(function () {
                    messageApi.open({
                      key: 1,
                      type: "error",
                      content: "cannot switch the camera right now",
                      duration: 3,
                    });
                  });
                }}
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
              {sessionDetails.subscribers.map(function (sub) {
                return (
                  <div
                    key={sub.id}
                    className="stream-container w-1/5 sm:w-1/4 lg:w-1/4 xl:w-1/5"
                    onClick={function () {
                      update({ mainStreamManager: sub });
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
