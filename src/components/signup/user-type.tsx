import { Form, Input, InputNumber, Select, Switch } from "@/components/ui";
import { useState } from "react";
import HeaderLine from "@/components/ui/header-line";
import { doctorSpecialtyOptions } from "@/utils/sign-data";

const { Item } = Form;
export default function UserType({ userType, setFormValues }: any) {
  const [moreInf, setMoreInf] = useState(false);
  return userType === "doctor" ? (
    <>
      {
        <>
          <Switch
            onChange={function () {
              setFormValues(function (val?: any, ..._args: any[]) {
                return {
                  ...val,
                  moreInf: moreInf,
                };
              });
              setMoreInf(function (moreInf?: any, ..._args: any[]) {
                return moreInf;
              });
            }}
            checked={moreInf}
            unCheckedChildren="Show More"
            checkedChildren="Hide More"
            className="block m-auto mb-3"
          />
          {moreInf && (
            <>
              <HeaderLine value="Introducing Your Self" />
              <div className="flex gap-1 flex-wrap justify-between">
                <div className="grow">
                  <Item name="currentHospital">
                    <Input className="w-full" placeholder="Current hospital" />
                  </Item>
                </div>
                <div className="grow">
                  <Item name="graduationYear">
                    <InputNumber
                      min={1960}
                      max={2023}
                      className="w-full"
                      placeholder="Graduation year"
                    />
                  </Item>
                </div>
                <div className="grow">
                  <Item name="experienceYears">
                    <InputNumber
                      min={0}
                      max={50}
                      className="w-full"
                      placeholder="Experience years"
                    />
                  </Item>
                </div>
                <div className="grow">
                  <Item name="fees">
                    <InputNumber
                      className="w-full"
                      placeholder="Fees"
                      min={1000}
                      max={500000}
                    ></InputNumber>
                  </Item>
                </div>
                <div className="grow">
                  <Item name="salary">
                    <InputNumber
                      className="w-full"
                      placeholder="Salary"
                      min={10}
                      max={50000}
                    ></InputNumber>
                  </Item>
                </div>
              </div>
              <Item name="about">
                <Input.TextArea
                  placeholder="briefly, information about yourself"
                  showCount
                  maxLength={200}
                />
              </Item>
              <Item name="achievement">
                <Input.TextArea
                  placeholder="your experiences and certificates"
                  showCount
                  maxLength={200}
                />
              </Item>
            </>
          )}
        </>
      }

      <>
        <HeaderLine value="Your Specialty" />
        <Item
          name="specialty"
          rules={[
            {
              required: true,
              message: "you must choose your job type",
            },
          ]}
        >
          <Select
            placeholder="Your specialty"
            showSearch
            optionFilterProp="label"
            options={doctorSpecialtyOptions}
          />
        </Item>
      </>
    </>
  ) : null;
}
