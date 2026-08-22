import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
} from "@/components/ui";
import { Mail } from "lucide-react";
import ProfileTable from "@/components/profile/profile-table";
import submitPersonal from "@/services/submit-personal";
import { cityOptions } from "@/utils/sign-data";
import { prefixSelector } from "@/utils/signup-utils";

const { Item } = Form;
export default function PersonalForm({
  messageApi,
  fetchProfileData,
  fetchUserData,
  userName,
  initialValues,
}: any) {
  const editData = [
    {
      headers: ["Personal"],
      data: [
        {
          name: "nickname",
          value: (
            <Item
              className="mb-0"
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
          ),
        },
        {
          name: "gender",
          value: (
            <Item
              className="mb-0"
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
          ),
        },
        {
          name: "birth",
          value: (
            <Item
              className="mb-0"
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
              <DatePicker className="w-full" placeholder="birthdate" />
            </Item>
          ),
        },
      ],
    },
    {
      headers: ["Contact"],
      data: [
        {
          name: "Phone Number",
          value: (
            <Item
              className="mb-0"
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
                <Input placeholder="Your phone number" />
              </Space.Compact>
            </Item>
          ),
        },
        {
          name: "Email",
          value: (
            <Item
              className="mb-0"
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
          ),
        },
      ],
    },
  ];
  return (
    <div className="bg-gray-200 p-2 w-full rounded-lg">
      <Form
        initialValues={{ ...initialValues }}
        onFinish={function (values?: any) {
          return submitPersonal(
            values,
            messageApi,
            fetchProfileData,
            fetchUserData,
            userName,
          );
        }}
      >
        {editData?.map(function ({ data, headers }: any, i?: any) {
          return <ProfileTable key={i + 1} data={data} headers={headers} />;
        })}
        <div>
          <Item className="w-full">
            <div className="w-full">
              <ProfileTable
                data={[
                  {
                    name: "city",
                    value: (
                      <Item
                        className="mb-0"
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
                          className="w-full"
                          placeholder="Select city"
                          showSearch
                          optionFilterProp="label"
                          options={cityOptions}
                        />
                      </Item>
                    ),
                  },
                  {
                    name: "street",
                    value: (
                      <Item
                        className="mb-0"
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
                    ),
                  },
                ]}
                headers={["Address"]}
              />
            </div>
          </Item>
        </div>
        <div className="flex justify-center">
          <Button
            type="primary"
            htmlType="submit"
            className={`rounded-lg text-xs lg:text-sm
          bg-gray-600 py-6 font-medium text-white
          border-gray-700 px-8 flex items-center hover:bg-gray-700`}
          >
            Edit Now
          </Button>
        </div>
      </Form>
    </div>
  );
}
