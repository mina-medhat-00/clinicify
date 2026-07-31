import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";
import { UserContextProvider } from "../contexts";
import UtilsContextProvider from "../contexts/UtilsContextProvider";

// The app talks to a backend on port 5000 and a socket.io server; neither is
// available in the test environment, so stub the network layer.
vi.mock("axios", () => {
  const stub = () => Promise.resolve({ data: {} });
  const axios = {
    request: stub,
    get: stub,
    post: stub,
    put: stub,
    delete: stub,
  };
  return { default: axios, ...axios };
});

vi.mock("socket.io-client", () => {
  const socket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  const connect = () => socket;
  return { default: { connect }, io: { connect }, connect };
});

describe("App smoke test", () => {
  it("renders the app shell without crashing", () => {
    const { container } = render(
      <Router>
        <UtilsContextProvider>
          <UserContextProvider>
            <App />
          </UserContextProvider>
        </UtilsContextProvider>
      </Router>,
    );
    expect(container.querySelector(".app")).not.toBeNull();
  });
});
