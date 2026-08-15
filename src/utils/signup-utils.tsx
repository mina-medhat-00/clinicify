import { Form, Select } from "antd";
import { currencyOptions, phonePrefixOptions } from "@/utils/sign-data";

const prefixSelector = (
  <Form.Item name="prefix" noStyle rules={[{ required: true }]}>
    <Select
      style={{ width: 100 }}
      className="bg-gray-100 flex items-center"
      showSearch
      optionFilterProp="label"
      options={phonePrefixOptions}
    />
  </Form.Item>
);

const suffixSelector = (
  <Form.Item name="suffix" noStyle className="bg-gray-100">
    <Select
      style={{ width: 70 }}
      showSearch
      optionFilterProp="label"
      options={currencyOptions}
    />
  </Form.Item>
);

export { prefixSelector, suffixSelector };
