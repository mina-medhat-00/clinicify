import { Button, Checkbox, Input } from "@/components/ui/controls";
import { Form } from "@/components/ui/form";
import { Typography } from "@/components/ui/display";
import { Lock, User } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  useLocation,
  useNavigate,
  type Location,
  type NavigateFunction,
} from "react-router-dom";
import HeaderLine from "@/components/ui/header-line";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import {
  api,
  errorData,
  type ApiResponse,
  setToken,
  type MessageApi,
  type ServiceContext,
} from "@/services/client";
import { passwordRule, usernameRule } from "@/utils/validators";

const { Title } = Typography;

interface LoginValues {
  username: string;
  password: string;
  remember?: boolean;
}

interface ValidState {
  invalidUser: boolean;
  invalidPass: boolean;
}

const noErrors: ValidState = { invalidUser: false, invalidPass: false };

// Only follow in-app paths, never another origin (e.g. "//evil.com").
function getRedirect(search?: string) {
  const target = new URLSearchParams(search).get("redirect");
  return target?.startsWith("/") && !target.startsWith("//") ? target : "/";
}

function signing(
  { username, password }: LoginValues,
  messageApi: MessageApi,
  setValidState: Dispatch<SetStateAction<ValidState>>,
  navigate: NavigateFunction,
  fetchUserData: ServiceContext["fetchUserData"],
  location: Location,
) {
  messageApi.open({
    key: 1,
    type: "loading",
    content: "verifying...",
    duration: 8,
  });
  api
    .post<ApiResponse<{ token?: string }>>(
      "/login",
      { data: { username, password } },
      { withCredentials: true },
    )
    .then(function ({ data: { data } }) {
      if (data.token) setToken(data.token);

      messageApi.open({
        key: 1,
        type: "success",
        content: "logged in successfully",
        duration: 2,
      });
      setTimeout(function () {
        void navigate(getRedirect(location.search));
        void fetchUserData();
      }, 2000);
    })
    .catch(function (err: unknown) {
      // The API flags which part was wrong with 0.
      const data = errorData(err);
      if (data?.isExist === 0) {
        messageApi.open({
          key: 1,
          type: "error",
          content: "invalid username",
          duration: 2,
        });
        setValidState(function (state) {
          return { ...state, invalidUser: true };
        });
      } else if (data?.isVerified === 0) {
        messageApi.open({
          key: 1,
          type: "error",
          content: "incorrect password",
          duration: 2,
        });
        setValidState(function (state) {
          return { ...state, invalidPass: true };
        });
      } else {
        messageApi.open({
          key: 1,
          type: "error",
          content: "there's some issues, try again later",
          duration: 2,
        });
        setValidState(noErrors);
      }
    });
}
export default function Login() {
  const { messageApi } = useUtilsContext();
  const {
    tokenExpired: isTokenExpired,
    fetchUserData,
    userData: user,
  } = useUserContext();
  const [validState, setValidState] = useState<ValidState>(noErrors);
  const location = useLocation();
  const navigate = useNavigate();
  const { Item } = Form;
  useEffect(
    function () {
      if (user) void navigate("/");
    },
    [user, navigate],
  );
  return (
    <div className="grow bg-linear-to-tr from-slate-500/85 to-blue-400/90">
      <div className="py-10 px-3 sm:px-10 grow flex justify-start mt-20 flex-col items-center">
        <HeaderLine
          value="Login"
          center
          invisible
          size="no"
          classText="text-5xl xl:text-6xl text-white mb-16"
        />
        {isTokenExpired && (
          <Title level={5} className="text-red-400 text-xs">
            Your Time Has Expired, you can sign-in again
          </Title>
        )}
        <Form<LoginValues>
          name="entry"
          colon={false}
          size="large"
          className="w-full sm:w-3/4 lg:w-1/2 2xl:w-1/3 bg-transparent"
          initialValues={{ remember: false }}
          autoComplete="on"
          onFinish={function (values) {
            signing(
              values,
              messageApi,
              setValidState,
              navigate,
              fetchUserData,
              location,
            );
          }}
          onValuesChange={function () {
            setValidState(noErrors);
          }}
        >
          <Item
            name="username"
            validateStatus={validState.invalidUser ? "error" : ""}
            help={
              validState.invalidUser
                ? "be sure you wrote the correct username"
                : undefined
            }
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
              usernameRule,
            ]}
          >
            <Input
              prefix={<User className="size-4" />}
              placeholder="Username"
            />
          </Item>
          <Item
            name="password"
            validateStatus={validState.invalidPass ? "error" : ""}
            help={
              validState.invalidPass
                ? "incorrect password, you can ask for help"
                : undefined
            }
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
              passwordRule,
            ]}
          >
            <Input.Password
              prefix={<Lock className="size-4" />}
              placeholder="Password"
            />
          </Item>
          <Item name="remember" valuePropName="checked">
            <Checkbox className="text-white">Remember me</Checkbox>
          </Item>
          <Item>
            <Button
              type="primary"
              className="w-full bg-blue-600/80 hover:bg-blue-600 border border-white"
              htmlType="submit"
            >
              Submit
            </Button>
          </Item>
        </Form>
      </div>
    </div>
  );
}
