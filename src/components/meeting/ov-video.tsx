import type { StreamManager } from "openvidu-browser";
import { Component, createRef } from "react";

export default class OpenViduVideoComponent extends Component<{
  streamManager: StreamManager;
}> {
  videoRef = createRef<HTMLVideoElement>();

  override componentDidUpdate() {
    this.attach();
  }

  override componentDidMount() {
    this.attach();
  }

  attach() {
    if (this.videoRef.current)
      this.props.streamManager.addVideoElement(this.videoRef.current);
  }

  override render() {
    return (
      <video
        autoPlay={true}
        ref={this.videoRef}
        className="float-left h-auto w-full cursor-pointer"
      />
    );
  }
}
