import { Button, Checkbox, Form, Input, Typography } from "@/components/ui/kit";
import axios from "axios";
import { Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import HeaderLine from "@/components/ui/header-line";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import { apiUrl } from "@/utils/api";

const { Title } = Typography;

function getMessage(
  key?: any,
  type?: any,
  content?: any,
  duration?: any,
  ..._args: any[]
) {
  return {
    key,
    type,
    content,
    duration,
  };
}

function signing(
  values?: any,
  messageApi?: any,
  setValidState?: any,
  navigate?: any,
  fetchUserData?: any,
  location?: any,
) {
  messageApi.open(getMessage(1, "loading", "verifying...", 8));
  delete values?.remember;
  axios
    .post(
      apiUrl("/login"),
      {
        data: values,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      },
    )
    .then(async function ({ data }: any) {
      const cookies = new Cookies();
      if (data?.data?.token) cookies.set("accessToken", data?.data?.token);

      messageApi.open(getMessage(1, "success", "logged in successfully", 2));
      setTimeout(function () {
        const loc = new URLSearchParams(location?.search)?.get("redirect");
        navigate(loc ? loc : "/");
        fetchUserData(true, cookies.get("accessToken"));
      }, 2000);
    })
    .catch(function (err?: any, ..._args: any[]) {
      const { isExist, isVerified } = err?.response?.data?.data || {};
      if (isExist == 0) {
        messageApi.open(getMessage(1, "error", "invalid username", 2));
        setValidState(function (state?: any, ..._args: any[]) {
          return {
            ...state,
            invalidUser: 1,
          };
        });
      } else if (isVerified == 0) {
        messageApi.open(getMessage(1, "error", "incorrect password", 2));
        setValidState(function (state?: any, ..._args: any[]) {
          return {
            ...state,
            invalidPass: 1,
          };
        });
      } else {
        messageApi.open(
          getMessage(1, "error", "there's some issues, try again later", 2),
        );
        setValidState({ invalidUser: 0, invalidPass: 0 });
      }
    });
}
function Login() {
  const { messageApi } = useUtilsContext();
  const {
    tokenExpired: isTokenExpired,
    fetchUserData,
    userData: user,
  } = useUserContext();
  const [validState, setValidState] = useState({
    invalidUser: 0,
    invalidPass: 0,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { Item } = Form;
  useEffect(
    function () {
      if (user?.user_id) {
        navigate("/");
        return;
      }
    },
    [user],
  );
  const [, setFormValues] = useState(null);
  return (
    <div className="grow bg-linear-to-tr from-slate-500/85 to-blue-400/90">
      <div
        className="py-10 px-3 sm:px-10  grow
      flex justify-start mt-20 flex-col items-center"
      >
        <HeaderLine
          value={"Login"}
          center
          invisible
          size="no"
          classText="text-5xl xl:text-6xl text-white mb-16"
        />
        {isTokenExpired && (
          <Title level={5} className=" text-red-400 text-xs">
            {"Your Time Has Expired, you can sign-in again"}
          </Title>
        )}
        <Form
          name="entry"
          colon={false}
          size="large"
          className="w-full sm:w-3/4 lg:w-1/2 2xl:w-1/3 bg-transparent"
          initialValues={{ remember: false }}
          autoComplete="on"
          onFinish={function (val?: any, ..._args: any[]) {
            signing(
              val,
              messageApi,
              setValidState,
              navigate,
              fetchUserData,
              location,
            );
          }}
          onValuesChange={function (c?: any, values?: any, ..._args: any[]) {
            setFormValues(values);
            setValidState({ invalidUser: 0, invalidPass: 0 });
          }}
        >
          <Item
            name="username"
            validateStatus={validState.invalidUser ? "error" : ""}
            help={
              validState.invalidUser
                ? `be sure you wrote the correct username`
                : null
            }
            rules={[
              {
                required: true,
                message: "Please input your username!",
              },
              {
                pattern: new RegExp("^([A-Z]|[a-z])+.{0,22}$"),
                message: "must begin with letters and max 22 characters",
              },
            ]}
          >
            <Input
              prefix={<User className="size-4" />}
              placeholder={"Username"}
            />
          </Item>
          <Item
            name="password"
            validateStatus={validState.invalidPass ? "error" : ""}
            help={
              validState.invalidPass
                ? `incorrect password, you can ask for help`
                : null
            }
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
              {
                message:
                  "Minimum 8 and maximum 14 characters, at least one uppercase letter, one lowercase letter",
                pattern: new RegExp(
                  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,14}$",
                ),
              },
            ]}
          >
            <Input.Password
              prefix={<Lock className="size-4" />}
              placeholder={"Password"}
            />
          </Item>
          <Item name="remember" valuePropName="checked">
            <Checkbox className="text-white">{"Remember me"}</Checkbox>
          </Item>
          <Item>
            <Button
              type="primary"
              className="w-full bg-blue-600/80 hover:bg-blue-600 border border-white"
              htmlType="submit"
            >
              {"Submit"}
            </Button>
          </Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
