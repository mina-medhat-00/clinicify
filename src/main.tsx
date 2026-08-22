import ReactDOM from "react-dom/client";
import { SkeletonTheme } from "react-loading-skeleton";
import { BrowserRouter as Router } from "react-router-dom";
import Cookies from "universal-cookie";
import App from "@/App";
import { MessageRoot } from "@/components/ui/kit";
import { UserContextProvider } from "@/contexts";
import UtilsContextProvider from "@/contexts/utils-context";
import "@/index.css";

const cookies = new Cookies();
const DOMElement = document.getElementById("root");
const ReactRootElement = ReactDOM.createRoot(DOMElement);

ReactRootElement.render(
  <Router>
    <UtilsContextProvider>
      <UserContextProvider token={cookies.get("accessToken")}>
        <SkeletonTheme baseColor="#202020" highlightColor="#444">
          <MessageRoot />
          <App />
        </SkeletonTheme>
      </UserContextProvider>
    </UtilsContextProvider>
  </Router>,
);
