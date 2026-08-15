import React, { Component } from "react";

export default class OpenViduVideoComponent extends Component<any> {
  videoRef = React.createRef<any>();

  componentDidUpdate(props?: any) {
    if (props && !!this.videoRef) {
      this.props.streamManager.addVideoElement(this.videoRef.current);
    }
  }

  componentDidMount() {
    if (this.props && !!this.videoRef) {
      this.props.streamManager.addVideoElement(this.videoRef.current);
    }
  }

  render() {
    return (
      <video
        autoPlay={true}
        ref={this.videoRef}
        className="float-left h-auto w-full cursor-pointer"
      />
    );
  }
}
