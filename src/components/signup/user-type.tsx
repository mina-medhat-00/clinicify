import { Input, InputNumber, Form, Select, Switch } from "antd";
import HeaderLine from "@/components/ui/header-line";
import { useState } from "react";
import { DoctorOptions } from "@/utils/sign-data";

const { Item } = Form;
const UserType = ({ userType, setFormValues }: any) => {
  const [moreInf, setMoreInf] = useState(false);
  return userType === "doctor" ? (
    <>
      {
        <>
          <Switch
            onChange={() => {
              setFormValues((val?: any, ..._args: any[]) => ({
                ...val,
                moreInf: moreInf,
              }));
              setMoreInf((moreInf?: any, ..._args: any[]) => moreInf);
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
                  <Item name="chospital">
                    <Input className="w-full" placeholder="Current hosbital" />
                  </Item>
                </div>
                <div className="grow">
                  <Item name="gyear">
                    <InputNumber
                      min={1960}
                      max={2023}
                      className="w-full"
                      placeholder="Graduation year"
                    />
                  </Item>
                </div>
                <div className="grow">
                  <Item name="eyears">
                    <InputNumber
                      min={0}
                      max={50}
                      className="w-full"
                      placeholder="experinces years"
                    />
                  </Item>
                </div>
                <div className="grow">
                  <Item name="salary">
                    <InputNumber
                      className="w-full"
                      placeholder="Salary"
                      min={1000}
                      max={500000}
                    ></InputNumber>
                  </Item>
                </div>
                <div className="grow">
                  <Item name="fees">
                    <InputNumber
                      className="w-full"
                      placeholder="fees"
                      min={10}
                      max={50000}
                    ></InputNumber>
                  </Item>
                </div>
              </div>
              <Item name="about">
                <Input.TextArea
                  placeholder="breifly, information about your self"
                  showCount
                  maxLength={200}
                />
              </Item>
              <Item name="achievement">
                <Input.TextArea
                  placeholder="your experinces and certifcates"
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
          <Select placeholder="Your specialty">{DoctorOptions}</Select>
        </Item>
      </>
    </>
  ) : null;
};

export default UserType;
