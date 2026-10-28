import { Button, Input, Radio, Select, Space } from "@/components/ui/controls";
import { DatePicker } from "@/components/ui/calendar";
import { Form } from "@/components/ui/form";
import { message } from "@/components/ui/message";
import {
  Upload,
  type BeforeUploadResult,
  type UploadChange,
  type UploadFile,
} from "@/components/ui/upload";
import type { Dayjs } from "dayjs";
import { ImagePlus, Lock, Mail, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";
import UserType from "@/components/signup/user-type";
import HeaderLine from "@/components/ui/header-line";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";
import { cityOptions } from "@/constants/sign-data";
import {
  minimumAgeRule,
  passwordRule,
  phoneRule,
  usernameRule,
} from "@/utils/validators";
import { prefixSelector } from "@/components/signup/form-selectors";
import { api, errorData, errorStatus } from "@/services/client";

interface SignupValues {
  nickname: string;
  username: string;
  password: string;
  confirm: string;
  gender: string;
  birth: Dayjs | null;
  address: { city: string; street: string };
  prefix: string;
  phone: string;
  email: string;
  images?: UploadFile[];
  userType: "user" | "doctor";
  // Doctors only.
  specialty?: string;
  currentHospital?: string;
  graduationYear?: number | null;
  experienceYears?: number | null;
  fees?: number | null;
  salary?: number | null;
  about?: string;
  achievement?: string;
  // The doctor opened the optional fields.
  moreInf?: boolean;
}

// "error1": the server could not be reached.
type UsernameState = "" | "validating" | "success" | "error" | "error1";

const imageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

function beforeUpload(file: File): BeforeUploadResult {
  const isImg = imageTypes.includes(file.type);
  const isLt5M = file.size / 1024 / 1024 <= 5;
  if (!isImg) message.error("You can only upload images", 4);
  else if (!isLt5M) message.error("Image must smaller than 5MB!", 4);
  // false = keep the file in the list without uploading it.
  return isImg && isLt5M ? false : Upload.LIST_IGNORE;
}

function readAsDataUrl(file: File) {
  return new Promise<string>(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result as string);
    };
    reader.onerror = function () {
      reject(new Error("cannot read the image"));
    };
    reader.readAsDataURL(file);
  });
}

function normFile(
  change: UploadChange,
  setImageUrls: (urls: string[]) => void,
) {
  const files = change.fileList;
  // Store the data URLs only once every file has been read.
  Promise.all(
    files.map(function (file) {
      return readAsDataUrl(file.originFileObj);
    }),
  )
    .then(setImageUrls)
    .catch(function () {
      setImageUrls([]);
    });
  return files;
}

function checkUserName(
  uname: string,
  setValidState: (state: UsernameState) => void,
) {
  api
    .get(`/chkuname/${encodeURIComponent(uname)}`)
    .then(function () {
      setValidState(uname ? "success" : "");
    })
    .catch(function (err: unknown) {
      setValidState(errorStatus(err) === 400 ? "error" : "error1");
    });
}

export default function Signup() {
  const { messageApi } = useUtilsContext();
  const { userData: user } = useUserContext();
  const { Item } = Form;
  const isMobile = useMediaQuery({
    query: "(max-width:778px)",
  });
  const [validState, setValidState] = useState<UsernameState>("");
  const [formValues, setFormValues] = useState<Partial<SignupValues>>({
    prefix: "20",
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const usernameCheck = useRef(0);
  const navigate = useNavigate();

  useEffect(
    function () {
      if (user) void navigate("/");
    },
    [user, navigate],
  );

  function addUser(values: SignupValues) {
    if (validState !== "success" && validState !== "") return;
    messageApi.open({
      key: 1,
      type: "loading",
      content: "signing up...",
      duration: 8,
    });
    const data = {
      ...values,
      birth: values.birth?.format("YYYY-MM-DD"),
      images: imageUrls[0],
      moreInf: formValues.moreInf,
    };
    api
      .post(
        "/adduser",
        { data },
        { headers: { "Content-Type": "application/json" } },
      )
      .then(function () {
        messageApi.open({
          key: 1,
          type: "success",
          content: `${values.username} added you can login now`,
          duration: 2,
        });
        setTimeout(function () {
          void navigate("/login");
        }, 2000);
      })
      .catch(function (err: unknown) {
        const dbError = errorData(err)?.err;
        const duplicate =
          typeof dbError === "object" &&
          dbError !== null &&
          "code" in dbError &&
          dbError.code === "ER_DUP_ENTRY";
        if (duplicate) {
          setValidState("error");
          messageApi.open({
            key: 1,
            type: "error",
            content: `${values.username} already exists, please write a new username`,
            duration: 2,
          });
        } else {
          setValidState("");
          messageApi.open({
            key: 1,
            type: "error",
            content: "there's some issues, please try again later",
            duration: 2,
          });
        }
      });
  }

  function setValues(changedVal: Partial<SignupValues>, values: SignupValues) {
    const { username } = changedVal;
    if (username !== undefined) {
      // Only the latest check may update the field, so a slow response for
      // an older value can't overwrite the current one.
      usernameCheck.current += 1;
      const checkId = usernameCheck.current;
      if (username && /^([A-Z]|[a-z])+.{0,22}$/.test(username)) {
        setValidState("validating");
        checkUserName(username, function (state) {
          if (checkId === usernameCheck.current) setValidState(state);
        });
      } else setValidState("");
    }
    setFormValues({ ...formValues, ...values });
  }

  return (
    <div className="flex grow justify-center bg-linear-to-tr from-slate-500/85 to-blue-400/90 p-2 sm:p-10">
      <Form<SignupValues>
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
          value="Sign Up"
          center
          invisible
          size="no"
          classText="text-4xl sm:text-5xl xl:text-6xl text-white mb-16"
        />
        <HeaderLine value="Required Information" />
        <div className="flex flex-wrap gap-1">
          <div className="grow sm:w-1/3 w-full">
            <HeaderLine
              imp
              value="nickname"
              size="sm"
              font="medium"
              classLine="w-1/2 border mb-2"
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
              <Input placeholder="nickname" />
            </Item>
          </div>
          <div className="grow sm:w-1/3 w-full">
            <HeaderLine
              imp
              value="username"
              size="sm"
              font="medium"
              classLine="w-1/2 border mb-2"
            />
            <Item
              name="username"
              validateStatus={validState === "error1" ? "error" : validState}
              help={
                validState === "error"
                  ? "username already exists"
                  : validState === "error1"
                    ? "cannot contact the server right now"
                    : undefined
              }
              hasFeedback
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
                placeholder="username"
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
                passwordRule,
              ]}
            >
              <Input.Password
                prefix={<Lock className="size-4" />}
                placeholder="Password"
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
                function ({ getFieldValue }) {
                  return {
                    validator(_, value) {
                      if (value && getFieldValue("password") !== value)
                        throw new Error(
                          "The two passwords that you entered do not match!",
                        );
                    },
                  };
                },
              ]}
            >
              <Input.Password placeholder="Confirm Password" />
            </Form.Item>
          </div>
        </div>
        <HeaderLine value="Privacy Information" />
        <div className="flex items-end gap-1 justify-between flex-wrap">
          <div className="grow">
            <HeaderLine
              imp
              value="Gender"
              size="sm"
              font="medium"
              classLine="w-1/2 border mb-2"
            />
            <Item
              name="gender"
              rules={[{ required: true, message: "Please select gender!" }]}
            >
              <Select
                placeholder="Select your gender"
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
                minimumAgeRule,
              ]}
            >
              <DatePicker className="w-full" placeholder="birthdate" />
            </Item>
          </div>
        </div>
        <div>
          <HeaderLine
            imp
            value="Address"
            size="sm"
            font="medium"
            classLine="w-1/2 border mb-2"
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
                <Input placeholder="Your street" />
              </Item>
            </Space.Compact>
          </Item>
        </div>
        <div className={`flex ${isMobile ? "flex-wrap" : ""} gap-1`}>
          <div className={`grow ${isMobile ? "" : "max-w-2xl"}`}>
            <Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please write your phone number!",
                },
                phoneRule,
              ]}
            >
              <Space.Compact className="w-full">
                {prefixSelector}
                <Input placeholder="Your phone number" />
              </Space.Compact>
            </Item>
          </div>
          <div className={`grow ${isMobile ? "" : "max-w-2xl"}`}>
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
                placeholder="Your email"
              />
            </Item>
          </div>
        </div>
        <Item>
          <Item
            name="images"
            valuePropName="fileList"
            getValueFromEvent={function (change: UploadChange) {
              return normFile(change, setImageUrls);
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
              className={`hover:bg-gray-200 border-2 bg-gray-700 text-white ${
                formValues.userType === "user" ? "bg-purple-500" : ""
              }`}
              value="user"
            >
              user
            </Radio.Button>
            <Radio.Button
              className={`ml-1 hover:bg-gray-200 border-2 bg-gray-700 text-white ${
                formValues.userType === "doctor" ? "bg-purple-500" : ""
              }`}
              value="doctor"
            >
              doctor
            </Radio.Button>
          </Radio.Group>
        </Item>
        <UserType
          userType={formValues.userType}
          setFormValues={setFormValues}
        />
        <Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full border border-white bg-blue-600/80 hover:bg-blue-600"
          >
            Submit
          </Button>
        </Item>
      </Form>
    </div>
  );
}
