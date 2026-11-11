import type {
  Session,
  StreamManager,
  Publisher,
  Subscriber,
  Device,
} from "openvidu-browser";

// Why the call is not showing
export type SessionException =
  false | "End" | "Closed" | "noSchedule" | "Expired" | "NoDevice";

export interface MeetingState {
  myNickName: string;
  username: string;
  appointmentId: string;
  // OpenVidu session id
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
