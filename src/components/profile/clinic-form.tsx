import { Button, Form, Input, Select, Space } from "@/components/ui";
import ProfileTable from "@/components/profile/profile-table";
import submitClinic from "@/services/submit-clinic";
import { cityOptions } from "@/utils/sign-data";
import { prefixSelector } from "@/utils/signup-utils";

const { Item } = Form;
export default function ClinicForm({
  messageApi,
  fetchProfileData,
  fetchUserData,
  userName,
  initialValues,
}: any) {
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
                {
                  message:
                    "please write phone number with 8 digits after 01x or 1x",
                  pattern: new RegExp("^0?(10|11|12|15)[0-9]{8,8}$"),
                },
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
      <Form
        initialValues={{ ...initialValues }}
        onFinish={function (values?: any) {
          return submitClinic(
            values,
            messageApi,
            fetchProfileData,
            fetchUserData,
            userName,
            true,
          );
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
        {editData?.map(function ({ data, headers }: any, i?: any) {
          return <ProfileTable key={i + 1} data={data} headers={headers} />;
        })}
        <div className="flex mt-2 justify-end">
          <Button
            type="primary"
            htmlType="submit"
            className={`rounded-lg text-xs lg:text-sm
              bg-gray-600 py-4 font-medium text-white
              border-gray-700 px-8 flex items-center hover:bg-gray-700`}
          >
            Edit Now
          </Button>
        </div>
      </Form>
    </div>
  );
}
