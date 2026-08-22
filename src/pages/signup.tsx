import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Radio,
  Select,
  Space,
  Upload,
} from "@/components/ui/kit";
import axios from "axios";
import { ImagePlus, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";
import UserType from "@/components/signup/user-type";
import HeaderLine from "@/components/ui/header-line";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import { cityOptions } from "@/utils/sign-data";
import { prefixSelector } from "@/utils/signup-utils";
import { apiUrl } from "@/utils/api";

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

function beforeUpload(file?: any): any {
  return new Promise(function (resolve?: any) {
    const isImg =
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png" ||
      file.type === "image/gif" ||
      file.type === "image/webp";
    const isLt5M = file.size / 1024 / 1024 <= 5;
    if (!isImg) {
      message.error("You can only upload images", 4);
    } else if (!isLt5M) {
      message.error("Image must smaller than 5MB!", 4);
    } else resolve(false);
  });
}
function normFile(e?: any, setImageUrls?: any, ..._args: any[]) {
  if (Array.isArray(e)) {
    return e;
  }
  const imageUrls = [];
  e?.fileList.map(function (file?: any, i?: any, ..._args: any[]) {
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      imageUrls[i] = reader.result;
    });
    reader.readAsDataURL(file.originFileObj);
  });
  setImageUrls(imageUrls);
  return e?.fileList;
}

function checkUserName(uname?: any, setValidState?: any, ..._args: any[]) {
  axios
    .get(apiUrl(`/chkuname/${uname}`))
    .then(function () {
      if (uname) setValidState("success");
      else setValidState("");
    })
    .catch(function (err?: any, ..._args: any[]) {
      if (err?.response?.status === 400) setValidState("error");
      else setValidState("error1");
    });
}

function Signup() {
  const { messageApi } = useUtilsContext();
  const { userData: user } = useUserContext();
  const { Item } = Form;
  const isMobile = useMediaQuery({
    query: "(max-width:778px)",
  });
  const [validState, setValidState] = useState<any>("");
  const [formValues, setFormValues] = useState<any>({
    prefix: "20",
  });
  const [imageUrls, setImageUrls] = useState([]);
  const navigate = useNavigate();

  useEffect(function () {
    if (user?.user_id) {
      navigate("/");
      return;
    }
  }, []);

  function addUser(values?: any, ..._args: any[]) {
    if (validState === "success" || validState === "") {
      messageApi.open(getMessage(1, "loading", "signing up...", 8));
      values.birth = values?.birth?.format("YYYY-MM-DD");
      values.images = imageUrls?.[0];
      values.moreInf = formValues.moreInf;
      axios
        .post(
          apiUrl("/adduser"),
          {
            data: values,
          },
          {
            headers: { "Content-Type": "application/json" },
          },
        )
        .then(function () {
          messageApi.open(
            getMessage(
              1,
              "success",
              `${values?.username} added you can login now`,
              2,
            ),
          );
          setTimeout(function () {
            navigate(`/login`);
          }, 2000);
        })
        .catch(function (err?: any, ..._args: any[]) {
          if (err?.response?.data?.data?.err?.code == "ER_DUP_ENTRY") {
            setValidState("error");
            messageApi.open(
              getMessage(
                1,
                "error",
                `${values?.username} already exists, please write a new username`,
                2,
              ),
            );
          } else {
            setValidState("");
            messageApi.open(
              getMessage(
                1,
                "error",
                "there's some issues, please try again later",
                2,
              ),
            );
          }
        });
    }
  }

  function setValues(changedVal?: any, values?: any, ..._args: any[]) {
    const chk = /^([A-Z]|[a-z])+.{0,22}$/.test(changedVal?.username);
    if (changedVal?.username && chk) {
      setValidState("validating");
      checkUserName(changedVal.username, setValidState);
    } else if (changedVal?.username === "" || !chk) setValidState("");
    setFormValues({ ...formValues, ...values });
  }

  return (
    <div className="flex grow justify-center bg-linear-to-tr from-slate-500/85 to-blue-400/90 p-2 sm:p-10">
      <Form
        name="register"
        autoComplete="on"
        layout="vertical"
        initialValues={formValues}
        onValuesChange={setValues}
        className="w-full lg:w-4/5 xl:w-2/3 sm:mt-0 mt-5"
        size="large"
        onFinish={addUser}
        scrollToFirstError
      >
        <HeaderLine
          value={"Sign Up"}
          center
          invisible
          size="no"
          classText="text-4xl sm:text-5xl xl:text-6xl text-white mb-16"
        />
        <HeaderLine value={"Required Information"} />
        <div className="flex flex-wrap gap-1">
          <div className="grow sm:w-1/3 w-full">
            <HeaderLine
              imp
              value={"nickname"}
              size={"sm"}
              font="medium"
              classLine={"w-1/2 border mb-2"}
            />
            <Item
              name="nickname"
              rules={[
                {
                  required: true,
                  message: "Please write your nickname!",
                },
              ]}
            >
              <Input placeholder={"nickname"} />
            </Item>
          </div>
          <div className="grow sm:w-1/3 w-full">
            <HeaderLine
              imp
              value={"username"}
              size={"sm"}
              font="medium"
              classLine={"w-1/2 border mb-2"}
            />
            <Item
              name="username"
              validateStatus={validState}
              help={
                validState === "error"
                  ? "username already exists"
                  : validState?.at(-1) === "1"
                    ? "cannot contact the server right now"
                    : null
              }
              hasFeedback
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
                placeholder={"username"}
              />
            </Item>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <div className="grow sm:w-1/3 w-full">
            <Item
              name="password"
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
          </div>
          <div className="grow sm:w-1/3 w-full">
            <Form.Item
              name="confirm"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                function ({ getFieldValue }: any) {
                  return {
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!",
                        ),
                      );
                    },
                  };
                },
              ]}
            >
              <Input.Password placeholder={"Confirm Password"} />
            </Form.Item>
          </div>
        </div>
        <HeaderLine value={"Privacy Information"} />
        <div className="flex items-end gap-1 justify-between flex-wrap">
          <div className="grow">
            <HeaderLine
              imp
              value={"Gender"}
              size={"sm"}
              font="medium"
              classLine={"w-1/2 border mb-2"}
            />
            <Item
              name="gender"
              rules={[{ required: true, message: "Please select gender!" }]}
            >
              <Select
                placeholder={"Select your gender"}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                ]}
              />
            </Item>
          </div>
          <div className="grow">
            <Item
              name="birth"
              rules={[
                {
                  required: true,
                  message: "please enter your birthdate",
                },
                {
                  message: "your age must be more than 13",
                  validator(_, value) {
                    if (new Date().getFullYear() - value?.year() < 13)
                      return Promise.reject();
                    else return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker className="w-full" placeholder={"birthdate"} />
            </Item>
          </div>
        </div>
        <div>
          <HeaderLine
            imp
            value={"Address"}
            size={"sm"}
            font="medium"
            classLine={"w-1/2 border mb-2"}
          />
          <Item className="w-full">
            <Space.Compact className="w-full" block>
              <Item
                name={["address", "city"]}
                noStyle
                rules={[
                  {
                    required: true,
                    message: "city is required",
                  },
                ]}
              >
                <Select
                  placeholder="Select city"
                  showSearch
                  optionFilterProp="label"
                  options={cityOptions}
                  className="w-full sm:w-2/5"
                />
              </Item>
              <Item
                name={["address", "street"]}
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Street is required",
                  },
                ]}
              >
                <Input placeholder={"Your street"} />
              </Item>
            </Space.Compact>
          </Item>
        </div>
        <div className={`flex ${isMobile ? "flex-wrap" : ""} gap-1`}>
          <div className={`grow ${!isMobile && "max-w-2xl"}`}>
            <Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please write your phone number!",
                },
                {
                  message:
                    "please write phone number with 8 digits after 01x or 1x",
                  pattern: new RegExp("^0?(10|11|12|15)[0-9]{8,8}$"),
                },
              ]}
            >
              <Space.Compact className="w-full">
                {prefixSelector}
                <Input placeholder={"Your phone number"} />
              </Space.Compact>
            </Item>
          </div>
          <div className={`grow ${!isMobile && "max-w-2xl"}`}>
            <Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "you must write your email!",
                },
                {
                  type: "email",
                  message: "please enter a valid email",
                },
              ]}
            >
              <Input
                prefix={<Mail className="size-4" />}
                placeholder={"Your email"}
              />
            </Item>
          </div>
        </div>
        <Item>
          <Item
            name="images"
            valuePropName="fileList"
            getValueFromEvent={function (e?: any, ..._args: any[]) {
              return normFile(e, setImageUrls);
            }}
            noStyle
          >
            <Upload.Dragger
              name="file"
              beforeUpload={beforeUpload}
              accept=".png, .jpg, .jpeg, .bpm, .webp"
              listType="picture"
              multiple={false}
              maxCount={5}
            >
              <p className="ant-upload-drag-icon">
                <ImagePlus className="size-12 m-auto" />
              </p>
              <p className="font-bold">
                Click or drag your image to this area to upload
              </p>
              <p className="ant-upload-hint">Support only a single upload.</p>
            </Upload.Dragger>
          </Item>
        </Item>
        <Item
          name="userType"
          rules={[
            {
              required: true,
              message: "you must choose between staff or user",
            },
          ]}
        >
          <Radio.Group>
            <Radio.Button
              className={`hover:bg-gray-200 border-2 
              bg-gray-700 text-white
              ${formValues?.userType === "user" && "bg-purple-500"}
              `}
              value="user"
            >
              {"user"}
            </Radio.Button>
            <Radio.Button
              className={`ml-1 hover:bg-gray-200 border-2 
              bg-gray-700 text-white
              ${formValues?.userType === "doctor" && "bg-purple-500"}
              `}
              value="doctor"
            >
              {"doctor"}
            </Radio.Button>
          </Radio.Group>
        </Item>
        <UserType
          userType={formValues?.userType}
          setFormValues={setFormValues}
          formValues={formValues}
        />
        <Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full border border-white  bg-blue-600/80 hover:bg-blue-600"
          >
            {"Submit"}
          </Button>
        </Item>
      </Form>
    </div>
  );
}

export default Signup;
