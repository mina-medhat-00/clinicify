import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider } from "antd";
import ReactDOM from "react-dom/client";
import { SkeletonTheme } from "react-loading-skeleton";
import { BrowserRouter as Router } from "react-router-dom";
import Cookies from "universal-cookie";
import App from "@/App";
import { UserContextProvider } from "@/contexts";
import UtilsContextProvider from "@/contexts/utils-context";
import "@/index.css";

const cookies = new Cookies();
const DOMElement = document.getElementById("root");
const ReactRootElement = ReactDOM.createRoot(DOMElement);

ReactRootElement.render(
  <StyleProvider layer>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        },
      }}
    >
      <Router>
        <UtilsContextProvider>
          <UserContextProvider token={cookies.get("accessToken")}>
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
              <App />
            </SkeletonTheme>
          </UserContextProvider>
        </UtilsContextProvider>
      </Router>
    </ConfigProvider>
  </StyleProvider>,
);
