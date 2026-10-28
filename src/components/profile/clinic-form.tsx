import { Button, Input, Select, Space } from "@/components/ui/controls";
import { Form } from "@/components/ui/form";
import ProfileTable from "@/components/profile/profile-table";
import type { ClinicValues } from "@/components/profile/clinic-register";
import type { LoadOptions, ServiceContext } from "@/services/client";
import submitProfile from "@/services/submit-profile";
import type { Id } from "@/types/user";
import { cityOptions } from "@/constants/sign-data";
import { phoneRule } from "@/utils/validators";
import { prefixSelector } from "@/components/signup/form-selectors";

// Saved values can have empty columns; the form fills them in.
export interface ClinicInitialValues {
  address: { city?: string | null; street?: string | null };
  phone?: string | null;
  telephone?: string | null;
  prefix?: string | null;
}

const { Item } = Form;
export default function ClinicForm({
  messageApi,
  fetchProfileData,
  fetchUserData,
  userName,
  initialValues,
}: ServiceContext & {
  userName: Id;
  fetchProfileData: (user: Id, options?: LoadOptions) => Promise<unknown>;
  initialValues: ClinicInitialValues;
}) {
  const editData = [
    {
      headers: ["Contact"],
      data: [
        {
          name: "Clinic Phone Number",
          value: (
            <Item
              className="mb-0"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please write clinic phone number!",
                },
                phoneRule,
              ]}
            >
              <Space.Compact className="w-full">
                {prefixSelector}
                <Input placeholder="Clinic phone number" />
              </Space.Compact>
            </Item>
          ),
        },
        {
          name: "Clinic Telephone",
          value: (
            <Item className="mb-0" name="telephone">
              <Space.Compact className="w-full">
                {prefixSelector}
                <Input placeholder="Clinic telephone" />
              </Space.Compact>
            </Item>
          ),
        },
      ],
    },
  ];
  return (
    <div className="bg-gray-200 p-2 w-full rounded-lg">
      <Form<ClinicValues>
        initialValues={initialValues as Partial<ClinicValues>}
        onFinish={function (values) {
          void submitProfile({
            section: "clinic",
            values: { ...values },
            isEdit: true,
            messageApi,
            fetchUserData,
          }).then(function (saved) {
            if (saved) void fetchProfileData(userName, { silent: true });
          });
        }}
      >
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
                        <Input placeholder="Clinic street" />
                      </Item>
                    ),
                  },
                ]}
                headers={["Clinic Location"]}
              />
            </div>
          </Item>
        </div>
        {editData.map(function ({ data, headers }, i) {
          return <ProfileTable key={i} data={data} headers={headers} />;
        })}
        <div className="flex mt-2 justify-end">
          <Button
            type="primary"
            htmlType="submit"
            className="rounded-lg text-xs lg:text-sm bg-gray-600 py-4 font-medium text-white border-gray-700 px-8 flex items-center hover:bg-gray-700"
          >
            Edit Now
          </Button>
        </div>
      </Form>
    </div>
  );
}
