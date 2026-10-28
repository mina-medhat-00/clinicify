import type { StreamManager } from "openvidu-browser";
import { Component } from "react";
import OpenViduVideoComponent from "@/components/meeting/ov-video";

// The name each participant sent when joining, stored as
// '{"clientData": "<name>"}' in the connection data.
function nicknameOf(streamManager: StreamManager) {
  const [first = ""] = streamManager.stream.connection.data.split("%/%");
  try {
    const parsed: unknown = JSON.parse(first);
    if (typeof parsed === "object" && parsed && "clientData" in parsed)
      return String(parsed.clientData);
  } catch {
    // Not JSON: show nothing rather than break the call.
  }
  return "";
}

export default class UserVideoComponent extends Component<{
  streamManager?: StreamManager;
}> {
  override render() {
    const { streamManager } = this.props;
    return (
      <div>
        {streamManager ? (
          <div className="relative">
            <OpenViduVideoComponent streamManager={streamManager} />
            <div className="absolute rounded-br bg-neutral-50 px-1 font-bold text-neutral-500">
              <p className="m-0">{nicknameOf(streamManager)}</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
