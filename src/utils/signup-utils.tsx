import { Form, Select } from "@/components/ui/kit";
import { currencyOptions, phonePrefixOptions } from "@/utils/sign-data";

const prefixSelector = (
  <Form.Item name="prefix" noStyle rules={[{ required: true }]}>
    <Select
      className="w-24 bg-gray-100 flex items-center"
      showSearch
      optionFilterProp="label"
      options={phonePrefixOptions}
    />
  </Form.Item>
);

const suffixSelector = (
  <Form.Item name="suffix" noStyle className="bg-gray-100">
    <Select
      className="w-16"
      showSearch
      optionFilterProp="label"
      options={currencyOptions}
    />
  </Form.Item>
);

export { prefixSelector, suffixSelector };
