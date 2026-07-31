import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { vi } from "vitest";
import Signup from "../Signup";
import { UserContextProvider } from "../../../../contexts";
import UtilsContextProvider from "../../../../contexts/UtilsContextProvider";

// Signup checks username availability against the backend; stub the network layer.
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

const MockSignup = () => (
  <Router>
    <UtilsContextProvider>
      <UserContextProvider>
        <Signup />
      </UserContextProvider>
    </UtilsContextProvider>
  </Router>
);

describe("Signup", () => {
  it("renders the signup form without crashing", () => {
    render(<MockSignup />);
  });
});
