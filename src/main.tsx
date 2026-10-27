import ReactDOM from "react-dom/client";
import { SkeletonTheme } from "react-loading-skeleton";
import { BrowserRouter as Router } from "react-router-dom";
import App from "@/App";
import { MessageRoot } from "@/components/ui";
import { UserContextProvider } from "@/contexts";
import UtilsContextProvider from "@/contexts/utils-context";
import "@/index.css";

const DOMElement = document.getElementById("root");
const ReactRootElement = ReactDOM.createRoot(DOMElement);

ReactRootElement.render(
  <Router>
    <UtilsContextProvider>
      <UserContextProvider>
        <SkeletonTheme baseColor="#202020" highlightColor="#444">
          <MessageRoot />
          <App />
        </SkeletonTheme>
      </UserContextProvider>
    </UtilsContextProvider>
  </Router>,
);
