import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { vi } from "vitest";
import HomePage from "../HomePage";
import { HomeContextProvider, UserContextProvider } from "../../../contexts";
import UtilsContextProvider from "../../../contexts/UtilsContextProvider";

// The contexts fetch from the backend on mount; stub the network layer.
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

const MockHome = () => (
  <Router>
    <UtilsContextProvider>
      <UserContextProvider>
        <HomeContextProvider>
          <HomePage />
        </HomeContextProvider>
      </UserContextProvider>
    </UtilsContextProvider>
  </Router>
);

describe("Home", () => {
  it("renders the home page without crashing", () => {
    render(<MockHome />);
  });
});
