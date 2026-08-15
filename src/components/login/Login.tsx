import { useEffect } from "react";
import { Checkbox, Button, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import HeaderLine from "@/utils/signup/HeaderLine";
import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";
import Cookies from "universal-cookie";
import { useUtilsContext } from "@/hooks/UtilsContextProvider";
import { useUserContext } from "@/hooks/UserContextProvider";
const getMessage = (key?: any, type?: any, content?: any, duration?: any, ..._args: any[]) => ({
  key,
  type,
  content,
  duration,
});

const signing = (
  values?: any,
  messageApi?: any,
  setValidState?: any,
  navigate?: any,
  fetchUserData?: any,
  location?: any,
) => {
  messageApi.open(getMessage(1, "loading", "verfying...", 8));
  const host = window?.location?.hostname;
  delete values?.remember;
  axios
    .post(
      `http://${host}:5000/login`,
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
    .then(async ({ data }: any) => {
      const cookies = new Cookies();
      if (data?.data?.token) cookies.set("accessToken", data?.data?.token);

      messageApi.open(getMessage(1, "success", "login successfully", 2));
      setTimeout(() => {
        const loc = new URLSearchParams(location?.search)?.get("redirect");
        navigate(loc ? loc : "/");
        fetchUserData(true, cookies.get("accessToken"));
      }, 2000);
    })
    .catch((err?: any, ..._args: any[]) => {
      const { isExist, isVerified } = err?.response?.data?.data || {};
      if (isExist == 0) {
        // bad request, name not exist
        messageApi.open(getMessage(1, "error", "invalid username", 2));
        setValidState((state?: any, ..._args: any[]) => ({ ...state, invalidUser: 1 }));
        // setValidState("error");
      } else if (isVerified == 0) {
        messageApi.open(getMessage(1, "error", "incorrect password", 2));
        setValidState((state?: any, ..._args: any[]) => ({ ...state, invalidPass: 1 }));
      } else {
        messageApi.open(
          getMessage(1, "error", "there's some issues, try again later", 2),
        );
        setValidState({ invalidUser: 0, invalidPass: 0 });
      }
    });
};
const Login = () => {
  const { messageApi, t } = useUtilsContext();
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
  useEffect(() => {
    if (user?.user_id) {
      navigate("/");
      return;
    }
  }, [user]);
  const [, setFormValues] = useState(null);
  return (
    <div
      className="grow bg-[linear-gradient(45deg,gray,rgb(85,114,115))]"
      style={{
        background:
          "linear-gradient(to right top,rgb(93 98 128 / 85%) , rgb(108 146 192 / 90%))", // "linear-gradient(to right top, rgb(124 163 211 / 90%), rgb(77 82 108 / 85%))"
        // "linear-gradient(to right top, rgba(32, 58, 89, 0.9), #334297d9)",
        // "linear-gradient(to top right, rgb(32 58 89 / 90%), #a1858bff)",
      }}
    >
      <div
        className="py-10 px-3 sm:px-10  grow
      flex justify-start mt-20 flex-col items-center"
      >
        <HeaderLine
          value={t("Login")}
          center
          invisible
          size="no"
          classText="text-5xl xl:text-6xl"
          style={{ color: "white", marginBottom: "65px" }}
          lineStyle={{ marginBottom: "65px" }}
        />
        {isTokenExpired && (
          <Title level={5} className=" text-red-400 text-xs">
            {t("Your Time Has Expired, you can sign-in again")}
          </Title>
        )}
        <Form
          name="entry"
          colon={false}
          size="large"
          className="w-full sm:w-3/4 lg:w-1/2 2xl:w-1/3 bg-transparent"
          initialValues={{ remember: false }}
          autoComplete="on"
          onFinish={(val?: any, ..._args: any[]) =>
            signing(
              val,
              messageApi,
              setValidState,
              navigate,
              fetchUserData,
              location,
            )
          }
          onValuesChange={(c?: any, values?: any, ..._args: any[]) => {
            setFormValues(values);
            setValidState({ invalidUser: 0, invalidPass: 0 });
          }}
        >
          <Item
            name="username"
            validateStatus={validState.invalidUser ? "error" : ""}
            help={
              validState.invalidUser ? `be sure you write correct user` : null
            }
            // hasFeedback
            rules={[
              {
                required: true,
                message: `${t("Please input your username!")}`,
              },
              {
                pattern: new RegExp('^([A-Z]|[a-z])+.{0,22}$'),
                message: `${t("must begin with letters and max 22 character")}`,
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder={t("Username")} />
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
                message: `${t("Please input your password!")}`,
              },
              {
                message: `${t(
                  "Minimum 8 and maximum 14 characters, at least one uppercase letter, one lowercase letter",
                )}  `,
                pattern: new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,14}$'),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("Password")}
            />
          </Item>
          <Item name="remember" valuePropName="checked">
            <Checkbox style={{ color: "white" }}>{t("Remember me")}</Checkbox>
          </Item>
          <Item>
            <Button
              type="primary"
              className="w-full bg-blue-600/80 hover:bg-blue-600 border border-white"
              htmlType="submit"
            >
              {t("Submit")}
            </Button>
          </Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
