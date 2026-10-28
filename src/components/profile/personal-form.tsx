import { Button, Input, Select, Space } from "@/components/ui/controls";
import { DatePicker } from "@/components/ui/calendar";
import { Form } from "@/components/ui/form";
import type { Dayjs } from "dayjs";
import { Mail } from "lucide-react";
import ProfileTable from "@/components/profile/profile-table";
import type { LoadOptions, ServiceContext } from "@/services/client";
import submitProfile from "@/services/submit-profile";
import type { Id } from "@/types/user";
import { cityOptions } from "@/constants/sign-data";
import { minimumAgeRule, phoneRule } from "@/utils/validators";
import { prefixSelector } from "@/components/signup/form-selectors";

export interface PersonalValues {
  nickname: string;
  gender: string;
  birth: Dayjs | null;
  address: { city: string | null; street: string | null };
  phone: string | null;
  prefix: string | null;
  email: string;
}

const { Item } = Form;
export default function PersonalForm({
  messageApi,
  fetchProfileData,
  fetchUserData,
  userName,
  initialValues,
}: ServiceContext & {
  userName: Id;
  fetchProfileData: (user: Id, options?: LoadOptions) => Promise<unknown>;
  initialValues: PersonalValues;
}) {
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
                minimumAgeRule,
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
                phoneRule,
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
      <Form<PersonalValues>
        initialValues={initialValues}
        onFinish={function (values) {
          void submitProfile({
            section: "personal",
            values: { ...values, birth: values.birth?.format("YYYY-MM-DD") },
            messageApi,
            fetchUserData,
          }).then(function (saved) {
            if (saved) void fetchProfileData(userName, { silent: true });
          });
        }}
      >
        {editData.map(function ({ data, headers }, i) {
          return <ProfileTable key={i} data={data} headers={headers} />;
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
            className="rounded-lg text-xs lg:text-sm bg-gray-600 py-6 font-medium text-white border-gray-700 px-8 flex items-center hover:bg-gray-700"
          >
            Edit Now
          </Button>
        </div>
      </Form>
    </div>
  );
}
