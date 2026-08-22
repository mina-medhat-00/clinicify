import { Component } from "react";
import OpenViduVideoComponent from "@/components/meeting/ov-video";

export default class UserVideoComponent extends Component<any> {
  getNicknameTag() {
    const str = this.props.streamManager.stream.connection.data.split("%/%");
    return JSON.parse(str[0]).clientData;
  }

  render() {
    return (
      <div>
        {this.props.streamManager !== undefined ? (
          <div className="relative">
            <OpenViduVideoComponent streamManager={this.props.streamManager} />
            <div className="absolute rounded-br bg-neutral-50 px-1 font-bold text-neutral-500">
              <p className="m-0">{this.getNicknameTag()}</p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
