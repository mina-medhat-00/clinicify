import ReactDOM from "react-dom/client";
import { SkeletonTheme } from "react-loading-skeleton";
import { BrowserRouter as Router } from "react-router-dom";
import App from "@/App";
import { MessageRoot } from "@/components/ui/message";
import UserContextProvider from "@/contexts/user-context";
import UtilsContextProvider from "@/contexts/utils-context";
import "@/index.css";

const DOMElement = document.getElementById("root");
if (!DOMElement) throw new Error("index.html is missing the #root element");
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
