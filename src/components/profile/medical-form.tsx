import { Button, Input } from "@/components/ui/controls";
import { Form } from "@/components/ui/form";
import ProfileTable from "@/components/profile/profile-table";
import type { LoadOptions, ServiceContext } from "@/services/client";
import submitProfile from "@/services/submit-profile";
import type { Id } from "@/types/user";

// The names the API expects for each medical field.
export interface MedicalValues {
  currentIssue?: string | null;
  illnessesHistory?: string | null;
  allergies?: string | null;
  immunizations?: string | null;
  surgeries?: string | null;
  testResults?: string | null;
}

const { Item } = Form;
export default function MedicalForm({
  userName,
  messageApi,
  fetchProfileData,
  fetchUserData,
  initialValues,
  isEdit,
}: ServiceContext & {
  userName: Id;
  fetchProfileData: (user: Id, options?: LoadOptions) => Promise<unknown>;
  initialValues?: MedicalValues;
  isEdit?: boolean;
}) {
  return (
    <Form<MedicalValues>
      initialValues={initialValues}
      onFinish={function (values) {
        void submitProfile({
          section: "medical",
          values: { ...values },
          isEdit,
          messageApi,
          fetchUserData,
        }).then(function (saved) {
          if (saved) void fetchProfileData(userName, { silent: true });
        });
      }}
    >
      <div className="bg-gray-200 shadow-sm rounded-lg p-2">
        <ProfileTable
          headers={["Medical Information"]}
          data={[
            {
              name: "Current issue",
              value: (
                <Item
                  className="my-0 p-1"
                  name="currentIssue"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input.TextArea
                    maxLength={250}
                    className="scroll--v text-md font-medium 
rounded-lg resize-none"
                    placeholder="State your current issue"
                  />
                </Item>
              ),
            },
            {
              name: "Illnesses history",
              value: (
                <Item className="my-0 p-1" name="illnessesHistory">
                  <Input.TextArea
                    maxLength={250}
                    className="scroll--v text-md font-medium 
            rounded-lg resize-none"
                    placeholder="Your diseases, illness history or other issues"
                  />
                </Item>
              ),
            },
            {
              name: "Allergies",
              value: (
                <Item className="my-0 p-1" name="allergies">
                  <Input.TextArea
                    maxLength={250}
                    className="scroll--v text-md font-medium 
rounded-lg resize-none"
                    placeholder="Allergies"
                  />
                </Item>
              ),
            },
            {
              name: "Immunzations",
              value: (
                <Item className="my-0 p-1" name="immunizations">
                  <Input.TextArea
                    maxLength={250}
                    className="scroll--v text-md font-medium 
            rounded-lg resize-none"
                    placeholder="Immunzations"
                  />
                </Item>
              ),
            },
            {
              name: "Surgeries",
              value: (
                <Item className="my-0 p-1" name="surgeries">
                  <Input.TextArea
                    maxLength={250}
                    className="scroll--v text-md font-medium 
            rounded-lg resize-none"
                    placeholder="Surgeries"
                  />
                </Item>
              ),
            },
          ]}
        />
        <div className="flex mt-2 justify-center items-center">
          <Button
            type="primary"
            htmlType="submit"
            className="rounded-lg text-xs lg:text-sm bg-gray-600 py-6 font-medium text-white border-gray-700 px-8 flex items-center hover:bg-gray-700"
          >
            {isEdit ? "Edit Now" : "Add Now"}
          </Button>
        </div>
      </div>
    </Form>
  );
}
